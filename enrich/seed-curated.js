// ============================================================================
// seed-curated.js — Replaces all places with a hand-picked, curated list
// ============================================================================
//
// Usage:  node enrich/seed-curated.js
//
// This clears the Place collection and seeds ONLY curated pilgrimage sites
// with real, working image URLs from Wikimedia Commons (CC-licensed, stable).
//
// Previously used Unsplash URLs which started returning 404 errors.
// Now uses Wikimedia Commons thumbnails that are reliably hosted.
// ============================================================================

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

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

// ─── CURATED VARANASI PLACES ────────────────────────────────────────────────
// Images from Wikimedia Commons (stable, CC-licensed, no hotlinking issues)
// Reduced from 25 to 15 MAJOR sites — only the most important pilgrimage spots

const VARANASI_PLACES = [
  // ════════════════════════════════════════════════════════════════
  // PRIORITY 1 — Must-Visit Sites (the absolute essentials)
  // ════════════════════════════════════════════════════════════════
  {
    name: "Kashi Vishwanath Temple",
    city: "Varanasi",
    latitude: 25.3108, longitude: 83.0106,
    visitDuration: 2, entryFee: 0, priority: 1,
    time_slot: "dawn", theme_group: "temples",
    best_season: "October to March",
    description: "One of the 12 Jyotirlingas dedicated to Lord Shiva. The most sacred Hindu temple in Varanasi, located on the western bank of the holy Ganga river. Recently renovated as part of the Kashi Vishwanath Dham corridor.",
    image: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Kashi_Vishwanath.jpg",
    publicId: "seeded"
  },
  {
    name: "Dashashwamedh Ghat",
    city: "Varanasi",
    latitude: 25.3069, longitude: 83.0107,
    visitDuration: 1.5, entryFee: 0, priority: 1,
    time_slot: "aarti", theme_group: "ghats",
    best_season: "October to March",
    description: "The main ghat in Varanasi, famous for the spectacular Ganga Aarti ceremony held every evening. Priests perform the aarti with large fire lamps while thousands watch from the steps and boats.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Dasaswamedh_ghat-varanasi_india-andres_larin.jpg/960px-Dasaswamedh_ghat-varanasi_india-andres_larin.jpg",
    publicId: "seeded"
  },
  {
    name: "Manikarnika Ghat",
    city: "Varanasi",
    latitude: 25.3108, longitude: 83.0140,
    visitDuration: 1, entryFee: 0, priority: 1,
    time_slot: "morning", theme_group: "ghats",
    description: "The most sacred cremation ghat in Varanasi. Hindus believe that cremation here leads to moksha — liberation from the cycle of rebirth. The eternal fire has been burning here for thousands of years.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Manikarnika_Ghat%2C_Varanasi%2C_Uttar_Pradesh%2C_India_%282011%29_5.jpg/960px-Manikarnika_Ghat%2C_Varanasi%2C_Uttar_Pradesh%2C_India_%282011%29_5.jpg",
    publicId: "seeded"
  },
  {
    name: "Sarnath",
    city: "Varanasi",
    latitude: 25.3814, longitude: 83.0227,
    visitDuration: 3, entryFee: 40, priority: 1,
    time_slot: "morning", theme_group: "historic",
    best_season: "October to February",
    description: "Where Lord Buddha gave his first sermon after enlightenment. Home to the famous Dhamekh Stupa, Ashoka Pillar, and the Sarnath Museum with India's national emblem — the Lion Capital.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Ancient_Buddhist_monasteries_near_Dhamekh_Stupa_Monument_Site%2C_Sarnath.jpg/960px-Ancient_Buddhist_monasteries_near_Dhamekh_Stupa_Monument_Site%2C_Sarnath.jpg",
    publicId: "seeded"
  },
  {
    name: "Assi Ghat",
    city: "Varanasi",
    latitude: 25.2890, longitude: 83.0070,
    visitDuration: 1, entryFee: 0, priority: 1,
    time_slot: "dawn", theme_group: "ghats",
    description: "The southernmost ghat of Varanasi. Popular for morning yoga, meditation, and the subah-e-banaras cultural morning ceremony. A gathering spot for artists and travelers.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Assi_Ghat_Varanasi_morning_Aarti.jpg/960px-Assi_Ghat_Varanasi_morning_Aarti.jpg",
    publicId: "seeded"
  },

  // ════════════════════════════════════════════════════════════════
  // PRIORITY 2 — Recommended Sites (important, widely visited)
  // ════════════════════════════════════════════════════════════════
  {
    name: "Tulsi Manas Temple",
    city: "Varanasi",
    latitude: 25.2871, longitude: 83.0004,
    visitDuration: 1, entryFee: 0, priority: 2,
    time_slot: "morning", theme_group: "temples",
    description: "Modern marble temple built in 1964, dedicated to Lord Ram. Named after poet Tulsidas who wrote the Ramcharitmanas epic at this very spot in the 16th century.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Manas_Mandir.jpg/960px-Manas_Mandir.jpg",
    publicId: "seeded"
  },
  {
    name: "Durga Temple",
    city: "Varanasi",
    latitude: 25.2886, longitude: 82.9993,
    visitDuration: 1, entryFee: 0, priority: 2,
    time_slot: "morning", theme_group: "temples",
    description: "18th-century temple dedicated to Goddess Durga, known for its Nagara-style architecture and vibrant red-colored walls. Also called the Monkey Temple due to resident langurs.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Durga_Temple_gate.JPG/960px-Durga_Temple_gate.JPG",
    publicId: "seeded"
  },
  {
    name: "Sankat Mochan Hanuman Temple",
    city: "Varanasi",
    latitude: 25.2821, longitude: 83.0000,
    visitDuration: 1, entryFee: 0, priority: 2,
    time_slot: "morning", theme_group: "temples",
    description: "One of the most revered Hanuman temples in India, founded by the great poet Tulsidas in the 16th century. Famous for its Tuesday and Saturday special worship and besan ke laddoo prasad.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Sankat_Mochan_temple_entrance%2C_Varanasi_-_IRCTC_2017_%281%29.jpg/960px-Sankat_Mochan_temple_entrance%2C_Varanasi_-_IRCTC_2017_%281%29.jpg",
    publicId: "seeded"
  },
  {
    name: "Ramnagar Fort",
    city: "Varanasi",
    latitude: 25.2702, longitude: 83.0251,
    visitDuration: 2, entryFee: 15, priority: 2,
    time_slot: "anytime", theme_group: "historic",
    best_season: "October to March",
    description: "18th-century Mughal-era sandstone fort and palace on the eastern bank of the Ganges. Houses a museum with vintage cars, royal costumes, ivory work, and ancient weaponry.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Entrance_area_of_Ramnagar_Fort.jpg/960px-Entrance_area_of_Ramnagar_Fort.jpg",
    publicId: "seeded"
  },
  {
    name: "Bharat Mata Temple",
    city: "Varanasi",
    latitude: 25.3172, longitude: 82.9893,
    visitDuration: 0.75, entryFee: 0, priority: 2,
    time_slot: "anytime", theme_group: "temples",
    description: "Unique temple dedicated to Mother India. Instead of deities, it has a large marble relief map of undivided India carved in marble. Inaugurated by Mahatma Gandhi in 1936.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Bharat_Mata_Mandir_Varanasi_India_-_panoramio_%283%29.jpg/960px-Bharat_Mata_Mandir_Varanasi_India_-_panoramio_%283%29.jpg",
    publicId: "seeded"
  },
  {
    name: "Dhamekh Stupa",
    city: "Varanasi",
    latitude: 25.3808, longitude: 83.0245,
    visitDuration: 1, entryFee: 25, priority: 2,
    time_slot: "morning", theme_group: "historic",
    description: "Massive cylindrical stupa at Sarnath built around 500 AD, standing 43 meters tall. Marks the exact spot where Buddha delivered his first sermon — the Dharma Chakra Pravartana.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Dhamek_Stupa%2C_Sarnath.jpg/960px-Dhamek_Stupa%2C_Sarnath.jpg",
    publicId: "seeded"
  },
  {
    name: "Annapurna Temple",
    city: "Varanasi",
    latitude: 25.3106, longitude: 83.0102,
    visitDuration: 0.75, entryFee: 0, priority: 2,
    time_slot: "morning", theme_group: "temples",
    description: "Temple dedicated to Goddess Annapurna, the Hindu deity of food and nourishment. Located near Kashi Vishwanath, it features a beautiful gold-plated idol and intricate architecture.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Annapurna_devi.jpg/960px-Annapurna_devi.jpg",
    publicId: "seeded"
  },
  {
    name: "Gyanvapi Mosque",
    city: "Varanasi",
    latitude: 25.3112, longitude: 83.0104,
    visitDuration: 0.5, entryFee: 0, priority: 2,
    time_slot: "anytime", theme_group: "temples",
    description: "A 17th-century mosque built by Mughal emperor Aurangzeb, adjacent to Kashi Vishwanath Temple. A historically significant structure representing Varanasi's composite cultural heritage.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Kashi-gyanvapi_%281%29.jpg/960px-Kashi-gyanvapi_%281%29.jpg",
    publicId: "seeded"
  },
  {
    name: "Sarnath Museum",
    city: "Varanasi",
    latitude: 25.3816, longitude: 83.0227,
    visitDuration: 1.5, entryFee: 25, priority: 2,
    time_slot: "morning", theme_group: "historic",
    description: "Archaeological museum housing the original Lion Capital of Ashoka — which became India's national emblem. Contains Buddhist sculptures, inscriptions, and artifacts dating back to the 3rd century BC.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Sarnath_Museum_Front.jpg/960px-Sarnath_Museum_Front.jpg",
    publicId: "seeded"
  },
  {
    name: "Kabir Math",
    city: "Varanasi",
    latitude: 25.3222, longitude: 83.0072,
    visitDuration: 1, entryFee: 0, priority: 2,
    time_slot: "anytime", theme_group: "temples",
    description: "The ashram and memorial of Sant Kabir, the famous 15th-century mystic poet who preached unity among all religions. A serene spiritual place with Kabir's original loom and writings.",
    image: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Kabir004.jpg",
    publicId: "seeded"
  }
];


// ─── MAIN ────────────────────────────────────────────────────────────────────

const main = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('❌ MONGO_URI not found in backend/.env');
    process.exit(1);
  }

  console.log('\n🛕  Tirthing — Curated Seed Script');
  console.log('━'.repeat(50));

  console.log('📡 Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('  ✅ Connected\n');

  try {
    const deleted = await Place.deleteMany({});
    console.log(`🗑️  Deleted ${deleted.deletedCount} existing places\n`);

    console.log(`📌 Inserting ${VARANASI_PLACES.length} curated Varanasi places...`);
    for (const place of VARANASI_PLACES) {
      await Place.create(place);
      console.log(`  ✅ ${place.name}`);
    }

    console.log('\n' + '━'.repeat(50));
    console.log(`✅ Done! ${VARANASI_PLACES.length} curated places seeded.`);
    console.log('━'.repeat(50));

  } finally {
    await mongoose.disconnect();
    console.log('\n📴 Disconnected from MongoDB\n');
  }
};

main().catch(err => {
  console.error('💥 Fatal:', err);
  process.exit(1);
});
