// ============================================================================
// seed-curated.js — Seeds the DB with curated pilgrimage sites from JSON files
// ============================================================================
//
// Usage:  node enrich/seed-curated.js
//
// Reads per-city JSON files from enrich/data/ and inserts them into MongoDB.
// Each city has ~20 hand-picked places with priority-ranked entries and
// stable Wikimedia Commons image URLs.
//
// Cities: Varanasi, Mathura, Puri, Rameshwaram, Shirdi, Vaishno Devi
// ============================================================================

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, readdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '..', 'backend', '.env') });

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
  time_slot: { type: String, enum: ['dawn', 'morning', 'aarti', 'anytime'], default: 'anytime' },
  theme_group: { type: String, enum: ['ghats', 'temples', 'historic', 'nature', 'other'], default: 'other' },
  best_season: { type: String }
}, { timestamps: true });

const Place = mongoose.models.Place || mongoose.model('Place', placeSchema);

// ─── MAIN ────────────────────────────────────────────────────────────────────

const main = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('❌ MONGO_URI not found in backend/.env');
    process.exit(1);
  }

  console.log('\n🛕  Tirthing — Curated Seed Script');
  console.log('━'.repeat(55));

  // Read all JSON data files
  const dataDir = resolve(__dirname, 'data');
  const files = readdirSync(dataDir).filter(f => f.endsWith('.json'));
  
  let allPlaces = [];
  for (const file of files) {
    const places = JSON.parse(readFileSync(resolve(dataDir, file), 'utf-8'));
    const city = places[0]?.city || file.replace('.json', '');
    console.log(`📄 ${file}: ${places.length} places (${city})`);
    allPlaces = allPlaces.concat(places);
  }

  console.log(`\n📊 Total: ${allPlaces.length} places across ${files.length} cities\n`);

  console.log('📡 Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('  ✅ Connected\n');

  try {
    const deleted = await Place.deleteMany({});
    console.log(`🗑️  Deleted ${deleted.deletedCount} existing places\n`);

    console.log(`📌 Inserting ${allPlaces.length} curated places...`);
    let count = 0;
    for (const place of allPlaces) {
      await Place.create(place);
      count++;
    }

    // Summary by city
    const byCityPriority = {};
    for (const p of allPlaces) {
      if (!byCityPriority[p.city]) byCityPriority[p.city] = { 1: 0, 2: 0, 3: 0, total: 0 };
      byCityPriority[p.city][p.priority]++;
      byCityPriority[p.city].total++;
    }

    console.log('\n' + '━'.repeat(55));
    console.log('📊 Summary:');
    console.log('━'.repeat(55));
    for (const [city, counts] of Object.entries(byCityPriority)) {
      console.log(`  ${city}: ${counts.total} places (P1:${counts[1]} P2:${counts[2]} P3:${counts[3]})`);
    }
    console.log('━'.repeat(55));
    console.log(`✅ Done! ${count} curated places seeded.`);
    console.log('━'.repeat(55));

  } finally {
    await mongoose.disconnect();
    console.log('\n📴 Disconnected from MongoDB\n');
  }
};

main().catch(err => {
  console.error('💥 Fatal:', err);
  process.exit(1);
});
