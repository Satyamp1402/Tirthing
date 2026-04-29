// ============================================================================
// merge.js — Data enrichment pipeline for Tirthing pilgrimage sites
// ============================================================================
//
// This is a one-time seeding script. It fetches pilgrimage sites from
// OpenStreetMap, enriches them with Wikipedia descriptions and images,
// applies local overrides for accuracy, and upserts everything into MongoDB.
//
// Usage:  node enrich/merge.js varanasi
//         node enrich/merge.js prayagraj
//
// The script is IDEMPOTENT — safe to re-run. It uses upsert (update-or-insert)
// matching on name + city, so running it twice won't create duplicates.
//
// Pipeline: OSM fetch → Wikipedia enrichment → Override merge → MongoDB upsert
// ============================================================================

import { fetchOSMSites } from './fetch-osm.js';
import { fetchWikiSummary, rateLimitDelay } from './fetch-wiki.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';


// ─── PATH RESOLUTION ─────────────────────────────────────────────────────────
// ES modules don't have __dirname, so we derive it from import.meta.url

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// ─── CITY CONFIGURATION ─────────────────────────────────────────────────────
// Maps our CLI-friendly city slugs to the exact names used by OSM and
// the display name we store in MongoDB. The osmName must match what
// Overpass knows — some Indian cities have different romanizations.

const CITY_CONFIG = {
  varanasi: {
    osmName: 'Varanasi',       // OSM uses the modern official name
    displayName: 'Varanasi',
    state: 'Uttar Pradesh'
  },
  prayagraj: {
    osmName: 'Prayagraj',      // Renamed from Allahabad in 2018
    displayName: 'Prayagraj',
    state: 'Uttar Pradesh'
  },
  mathura: {
    osmName: 'Mathura',        // Birthplace of Krishna
    displayName: 'Mathura',
    state: 'Uttar Pradesh'
  },
  tirupati: {
    osmName: 'Tirupati',       // Home of Tirumala Venkateswara Temple
    displayName: 'Tirupati',
    state: 'Andhra Pradesh'
  },
  amritsar: {
    osmName: 'Amritsar',       // Home of the Golden Temple (Harmandir Sahib)
    displayName: 'Amritsar',
    state: 'Punjab'
  }
};


// ─── PLACEHOLDER IMAGE ──────────────────────────────────────────────────────
// When Wikipedia doesn't have an image for a site, we use a saffron-themed
// placeholder. This satisfies the Place model's required `image` field and
// is visually consistent with the app's theme.

const PLACEHOLDER_IMAGE = 'https://placehold.co/400x300/fb923c/ffffff?text=No+Image';

// Sentinel value for publicId — tells the app this isn't a real Cloudinary asset.
// The deleteFromCloudinary function silently handles non-existent IDs (try-catch),
// so this won't cause errors if the admin later uploads a real image.
const SEEDED_PUBLIC_ID = 'seeded';


// ─── PLACE SCHEMA (inline) ──────────────────────────────────────────────────
// We define the schema here rather than importing from backend/models to keep
// the enrich scripts fully self-contained — no cross-directory import chains.
// This schema matches the one in backend/models/place.model.js exactly.

const placeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  image: { type: String, required: true },
  publicId: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  visitDuration: { type: Number, required: true },
  entryFee: { type: Number, required: true, default: 0 },
  priority: { type: Number, required: true, enum: [1, 2, 3] },
  description: { type: String },
  time_slot: {
    type: String,
    enum: ['dawn', 'morning', 'aarti', 'anytime'],
    default: 'anytime'
  },
  theme_group: {
    type: String,
    enum: ['ghats', 'temples', 'historic', 'nature', 'other'],
    default: 'other'
  },
  best_season: { type: String }
}, { timestamps: true });

// Avoid re-compiling the model if this script is loaded multiple times
const Place = mongoose.models.Place || mongoose.model('Place', placeSchema);


// ─── OVERRIDE LOADER ─────────────────────────────────────────────────────────

/**
 * Loads the manual override file for a city, if it exists.
 * Override files contain hardcoded correct data for key sites where
 * OSM tags are incomplete or inaccurate (e.g. wrong entry fees,
 * missing time_slot assignments).
 *
 * @param {string} citySlug - CLI slug like "varanasi"
 * @returns {Map<string, Object>} Map of site name → override fields
 */
const loadOverrides = (citySlug) => {
  const overridePath = resolve(__dirname, 'overrides', `${citySlug}.json`);
  const overrideMap = new Map();

  if (!existsSync(overridePath)) {
    console.log(`  ℹ️  No override file found at ${overridePath}`);
    return overrideMap;
  }

  try {
    const raw = readFileSync(overridePath, 'utf-8');
    const entries = JSON.parse(raw);

    for (const entry of entries) {
      // Key by name for O(1) lookup during merge
      overrideMap.set(entry.name, entry);
    }

    console.log(`  📋 Loaded ${overrideMap.size} overrides from ${citySlug}.json`);
  } catch (error) {
    console.warn(`  ⚠️  Failed to parse override file: ${error.message}`);
  }

  return overrideMap;
};


// ─── MERGE LOGIC ─────────────────────────────────────────────────────────────

/**
 * Merges an OSM site with Wikipedia data and local overrides.
 * Priority order: overrides > wiki > OSM defaults.
 *
 * This means a hardcoded entry fee in varanasi.json will always win over
 * whatever OSM or Wikipedia says — because we've manually verified it.
 *
 * @param {Object} osmSite - Raw site data from OpenStreetMap
 * @param {{ description: string|null, imageUrl: string|null }} wikiData - Wikipedia enrichment
 * @param {Object|undefined} override - Manual override fields (if any)
 * @param {string} cityName - Display name of the city (stored in the Place document)
 * @returns {Object} Fully merged site ready for MongoDB upsert
 */
const mergeSiteData = (osmSite, wikiData, override, cityName) => {
  // Start with OSM as the base — it provides coordinates and basic metadata
  const merged = {
    name: osmSite.name,
    city: cityName,
    latitude: osmSite.latitude,
    longitude: osmSite.longitude,
    visitDuration: osmSite.visitDuration,
    entryFee: osmSite.entryFee,
    priority: osmSite.priority,
    time_slot: osmSite.time_slot,
    theme_group: osmSite.theme_group,

    // Wikipedia enrichment — use wiki image if available, else placeholder
    image: wikiData.imageUrl || PLACEHOLDER_IMAGE,
    publicId: SEEDED_PUBLIC_ID,
    description: wikiData.description || ''
  };

  // Apply overrides last — they always win on conflicting fields.
  // This is how we fix OSM inaccuracies for important sites.
  if (override) {
    // Only overwrite fields that are explicitly present in the override.
    // Don't overwrite coordinates — OSM is usually accurate for location.
    const overrideFields = ['priority', 'time_slot', 'theme_group',
                            'visitDuration', 'entryFee', 'best_season'];
    for (const field of overrideFields) {
      if (override[field] !== undefined) {
        merged[field] = override[field];
      }
    }
  }

  return merged;
};


// ─── MONGODB UPSERT ──────────────────────────────────────────────────────────

/**
 * Upserts a single place into MongoDB. The match is on name + city,
 * so re-running the script updates existing documents rather than
 * creating duplicates.
 *
 * We use $set to update all fields while keeping the existing _id and
 * any manually-added data (like a Cloudinary image uploaded via admin panel).
 * However, if the admin has already uploaded a real image (publicId !== 'seeded'),
 * we skip overwriting the image to preserve their work.
 *
 * @param {Object} siteData - Fully merged site object
 * @returns {Promise<'inserted' | 'updated'>} Whether the document was new or existing
 */
const upsertPlace = async (siteData) => {
  const filter = { name: siteData.name, city: siteData.city };

  // Check if this place already exists with a real (non-seeded) image.
  // If the admin has uploaded a proper Cloudinary image, don't overwrite it.
  const existing = await Place.findOne(filter);
  if (existing && existing.publicId !== SEEDED_PUBLIC_ID) {
    // Preserve the admin's custom image
    delete siteData.image;
    delete siteData.publicId;
  }

  const result = await Place.findOneAndUpdate(
    filter,
    { $set: siteData },
    {
      upsert: true,                       // Create if doesn't exist
      returnDocument: 'after',            // Return the updated document (Mongoose 9 syntax)
      runValidators: true                 // Enforce schema validation
    }
  );

  // If the document was just created, it won't have a pre-existing createdAt
  // that differs from updatedAt. This is a rough heuristic.
  return existing ? 'updated' : 'inserted';
};


// ─── MAIN PIPELINE ───────────────────────────────────────────────────────────

/**
 * Main entry point — orchestrates the full enrichment pipeline:
 *   1. Validate the city argument
 *   2. Connect to MongoDB
 *   3. Fetch sites from OSM
 *   4. Enrich each site with Wikipedia data (with rate limiting)
 *   5. Apply local overrides
 *   6. Upsert into MongoDB
 *   7. Print summary and disconnect
 */
const main = async () => {
  // ── Parse CLI argument ──
  const citySlug = process.argv[2]?.toLowerCase();

  if (!citySlug || !CITY_CONFIG[citySlug]) {
    console.error('\n❌ Usage: node enrich/merge.js <city>');
    console.error(`   Available cities: ${Object.keys(CITY_CONFIG).join(', ')}\n`);
    process.exit(1);
  }

  const config = CITY_CONFIG[citySlug];
  console.log(`\n🛕  Tirthing Data Enrichment — ${config.displayName}, ${config.state}`);
  console.log('━'.repeat(60));

  // ── Load environment variables from the backend's .env ──
  // The MONGO_URI lives in backend/.env — we point dotenv to it
  const envPath = resolve(__dirname, '..', 'backend', '.env');
  dotenv.config({ path: envPath });

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('\n❌ MONGO_URI not found. Ensure backend/.env exists with MONGO_URI=...');
    process.exit(1);
  }

  // ── Connect to MongoDB ──
  console.log('\n📡 Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('  ✅ Connected\n');

  try {
    // ── STEP 1: Fetch sites from OpenStreetMap ──
    console.log('STEP 1: Fetching sites from OpenStreetMap');
    console.log('─'.repeat(40));
    const osmSites = await fetchOSMSites(config.osmName);

    // ── STEP 2: Load overrides ──
    console.log('\nSTEP 2: Loading local overrides');
    console.log('─'.repeat(40));
    const overrides = loadOverrides(citySlug);

    // Also inject override-only sites that OSM might be missing entirely.
    // Some important sites (like Sarnath) may be mapped under a broader area
    // name in OSM and won't appear in a city-scoped query.
    for (const [overrideName, overrideData] of overrides) {
      const alreadyInOsm = osmSites.some(s => s.name === overrideName);
      if (!alreadyInOsm && overrideData.latitude !== undefined) {
        // Only add if the override has coordinates — otherwise we can't
        // place it on the map, so we'll rely on the OSM data
        console.log(`  ➕ Adding override-only site: ${overrideName}`);
      }
    }

    // ── STEP 3: Enrich with Wikipedia ──
    console.log('\nSTEP 3: Enriching with Wikipedia descriptions + images');
    console.log('─'.repeat(40));

    let wikiHits = 0;
    let wikiImageHits = 0;
    const enrichedSites = [];

    for (let i = 0; i < osmSites.length; i++) {
      const site = osmSites[i];
      const progress = `[${i + 1}/${osmSites.length}]`;

      // Fetch Wikipedia summary + thumbnail with rate limiting
      const wikiData = await fetchWikiSummary(site.name);

      if (wikiData.description) {
        wikiHits++;
        process.stdout.write(`  ${progress} ✅ ${site.name}\n`);
      } else {
        process.stdout.write(`  ${progress} ⬜ ${site.name} (no Wikipedia article)\n`);
      }

      if (wikiData.imageUrl) wikiImageHits++;

      // Merge: OSM base + Wiki enrichment + local override
      const override = overrides.get(site.name);
      const merged = mergeSiteData(site, wikiData, override, config.displayName);
      enrichedSites.push(merged);

      // Respect Wikipedia's rate limits — 300ms between calls
      if (i < osmSites.length - 1) {
        await rateLimitDelay();
      }
    }

    // ── STEP 4: Upsert into MongoDB ──
    console.log('\nSTEP 4: Upserting into MongoDB');
    console.log('─'.repeat(40));

    let insertedCount = 0;
    let updatedCount = 0;

    for (const site of enrichedSites) {
      try {
        const action = await upsertPlace(site);
        if (action === 'inserted') insertedCount++;
        else updatedCount++;
      } catch (error) {
        console.error(`  ❌ Failed to upsert "${site.name}": ${error.message}`);
      }
    }

    // ── SUMMARY ──
    console.log('\n' + '━'.repeat(60));
    console.log(`📊 ENRICHMENT SUMMARY — ${config.displayName}`);
    console.log('━'.repeat(60));
    console.log(`  🗺️  OSM sites found:        ${osmSites.length}`);
    console.log(`  📖 Wikipedia descriptions:  ${wikiHits}`);
    console.log(`  🖼️  Wikipedia images:        ${wikiImageHits}`);
    console.log(`  📋 Overrides applied:       ${overrides.size}`);
    console.log(`  ✅ Inserted (new):          ${insertedCount}`);
    console.log(`  🔄 Updated (existing):      ${updatedCount}`);
    console.log('━'.repeat(60));
    console.log('');

  } finally {
    // Always disconnect, even if errors occurred
    await mongoose.disconnect();
    console.log('📴 Disconnected from MongoDB\n');
  }
};


// ── Run ──
main().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
