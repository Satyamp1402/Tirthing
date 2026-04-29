// ============================================================================
// seed-curated.js — Replaces all places with a hand-picked, curated list
// ============================================================================
//
// The OSM fetch pulled 266+ places including random entries like parking lots
// and poultry farms. This script DELETES all existing places and inserts only
// the most important, tourist-worthy pilgrimage sites with real images.
//
// Usage:  node enrich/seed-curated.js
//
// This clears the Place collection and seeds ONLY the curated sites below.
// ============================================================================

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from backend/.env
dotenv.config({ path: resolve(__dirname, '..', 'backend', '.env') });

// ─── Place Schema (same as backend) ──────────────────────────────────────────
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
// Only the most significant pilgrimage and tourist sites.
// Images from Wikimedia Commons (public domain / CC licensed).

const VARANASI_PLACES = [
  {
    name: "Kashi Vishwanath Temple",
    city: "Varanasi",
    latitude: 25.3108, longitude: 83.0106,
    visitDuration: 2, entryFee: 0, priority: 1,
    time_slot: "dawn", theme_group: "temples",
    best_season: "October to March",
    description: "One of the 12 Jyotirlingas dedicated to Lord Shiva. The most sacred Hindu temple in Varanasi, located on the western bank of the holy Ganga river.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Kashi_Vishwanath_Temple_Varanasi_India.jpg/800px-Kashi_Vishwanath_Temple_Varanasi_India.jpg",
    publicId: "seeded"
  },
  {
    name: "Dashashwamedh Ghat",
    city: "Varanasi",
    latitude: 25.3069, longitude: 83.0107,
    visitDuration: 1.5, entryFee: 0, priority: 1,
    time_slot: "aarti", theme_group: "ghats",
    best_season: "October to March",
    description: "The main ghat in Varanasi, famous for the spectacular Ganga Aarti ceremony held every evening. One of the oldest and most prominent ghats.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Dashashwamedh_ghat_on_the_Ganges%2C_Varanasi.jpg/800px-Dashashwamedh_ghat_on_the_Ganges%2C_Varanasi.jpg",
    publicId: "seeded"
  },
  {
    name: "Manikarnika Ghat",
    city: "Varanasi",
    latitude: 25.3108, longitude: 83.0140,
    visitDuration: 1, entryFee: 0, priority: 1,
    time_slot: "morning", theme_group: "ghats",
    description: "The most sacred cremation ghat in Varanasi. Hindus believe that cremation here leads to moksha (liberation from the cycle of rebirth).",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Manikarnika_Ghat_in_Varanasi.jpg/800px-Manikarnika_Ghat_in_Varanasi.jpg",
    publicId: "seeded"
  },
  {
    name: "Sarnath",
    city: "Varanasi",
    latitude: 25.3814, longitude: 83.0227,
    visitDuration: 3, entryFee: 40, priority: 1,
    time_slot: "morning", theme_group: "historic",
    best_season: "October to February",
    description: "Where Lord Buddha gave his first sermon after enlightenment. Home to the famous Dhamekh Stupa, Ashoka Pillar, and the Sarnath Museum.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Dhamek_Stupa%2C_Sarnath.jpg/800px-Dhamek_Stupa%2C_Sarnath.jpg",
    publicId: "seeded"
  },
  {
    name: "Assi Ghat",
    city: "Varanasi",
    latitude: 25.2890, longitude: 83.0070,
    visitDuration: 1, entryFee: 0, priority: 1,
    time_slot: "dawn", theme_group: "ghats",
    description: "The southernmost ghat of Varanasi. Popular for morning yoga, meditation, and the subah-e-banaras cultural morning ceremony.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Assi_Ghat_1.jpg/800px-Assi_Ghat_1.jpg",
    publicId: "seeded"
  },
  {
    name: "Tulsi Manas Temple",
    city: "Varanasi",
    latitude: 25.2871, longitude: 83.0004,
    visitDuration: 1, entryFee: 0, priority: 2,
    time_slot: "morning", theme_group: "temples",
    description: "Modern marble temple built in 1964, dedicated to Lord Ram. Named after poet Tulsidas who wrote the Ramcharitmanas here.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Tulsi_Manas_Mandir_-_Varanasi.jpg/800px-Tulsi_Manas_Mandir_-_Varanasi.jpg",
    publicId: "seeded"
  },
  {
    name: "Durga Temple",
    city: "Varanasi",
    latitude: 25.2886, longitude: 82.9993,
    visitDuration: 1, entryFee: 0, priority: 2,
    time_slot: "morning", theme_group: "temples",
    description: "18th-century temple dedicated to Goddess Durga, known for its Nagara-style architecture and red-colored walls. Also called Monkey Temple.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Varanasi_03-2018_21_Durga_Temple.jpg/800px-Varanasi_03-2018_21_Durga_Temple.jpg",
    publicId: "seeded"
  },
  {
    name: "Sankat Mochan Hanuman Temple",
    city: "Varanasi",
    latitude: 25.2821, longitude: 83.0000,
    visitDuration: 1, entryFee: 0, priority: 2,
    time_slot: "morning", theme_group: "temples",
    description: "One of the most revered Hanuman temples in India, founded by the poet Tulsidas. Famous for its prasad of besan ke laddoo.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Sankat_Mochan_Hanuman_Temple%2CVaranasi.jpg/800px-Sankat_Mochan_Hanuman_Temple%2CVaranasi.jpg",
    publicId: "seeded"
  },
  {
    name: "Ramnagar Fort",
    city: "Varanasi",
    latitude: 25.2702, longitude: 83.0251,
    visitDuration: 2, entryFee: 15, priority: 2,
    time_slot: "anytime", theme_group: "historic",
    best_season: "October to March",
    description: "18th-century Mughal-era fort and palace on the eastern bank of the Ganges. Houses a museum with vintage cars, royal costumes, and weaponry.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Ramnagar_Fort%2C_Varanasi.jpg/800px-Ramnagar_Fort%2C_Varanasi.jpg",
    publicId: "seeded"
  },
  {
    name: "Bharat Mata Temple",
    city: "Varanasi",
    latitude: 25.3172, longitude: 82.9893,
    visitDuration: 0.75, entryFee: 0, priority: 2,
    time_slot: "anytime", theme_group: "temples",
    description: "Unique temple dedicated to Mother India. Instead of gods, it has a marble relief map of undivided India. Inaugurated by Mahatma Gandhi in 1936.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Bharat_Mata_Temple_Varanasi.jpg/800px-Bharat_Mata_Temple_Varanasi.jpg",
    publicId: "seeded"
  },
  {
    name: "Dhamekh Stupa",
    city: "Varanasi",
    latitude: 25.3808, longitude: 83.0245,
    visitDuration: 1, entryFee: 25, priority: 2,
    time_slot: "morning", theme_group: "historic",
    description: "Massive cylindrical stupa at Sarnath marking the spot where Buddha gave his first sermon. Built in 500 AD, it stands 43 meters tall.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Dhamek_Stupa%2C_Sarnath.jpg/800px-Dhamek_Stupa%2C_Sarnath.jpg",
    publicId: "seeded"
  },
  {
    name: "Kedar Ghat",
    city: "Varanasi",
    latitude: 25.2991, longitude: 83.0073,
    visitDuration: 1, entryFee: 0, priority: 2,
    time_slot: "dawn", theme_group: "ghats",
    description: "A quiet, colorful ghat with the Kedareshwar Temple. Popular among South Indian pilgrims and known for its vibrant painted steps.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Kedar_Ghat_in_Varanasi.jpg/800px-Kedar_Ghat_in_Varanasi.jpg",
    publicId: "seeded"
  },
  {
    name: "Annapurna Temple",
    city: "Varanasi",
    latitude: 25.3106, longitude: 83.0102,
    visitDuration: 0.75, entryFee: 0, priority: 2,
    time_slot: "morning", theme_group: "temples",
    description: "Temple dedicated to Goddess Annapurna, the deity of food and nourishment. Located near Kashi Vishwanath, it has a beautiful gold-plated idol.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Annapurna_Devi_Temple%2C_Varanasi.jpg/800px-Annapurna_Devi_Temple%2C_Varanasi.jpg",
    publicId: "seeded"
  },
  {
    name: "Gyanvapi Mosque",
    city: "Varanasi",
    latitude: 25.3112, longitude: 83.0104,
    visitDuration: 0.5, entryFee: 0, priority: 2,
    time_slot: "anytime", theme_group: "temples",
    description: "A 17th-century mosque adjacent to Kashi Vishwanath Temple. Historically significant structure representing the city's composite cultural heritage.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Gyanvapi_Mosque%2C_Varanasi.jpg/800px-Gyanvapi_Mosque%2C_Varanasi.jpg",
    publicId: "seeded"
  },
  {
    name: "Panchganga Ghat",
    city: "Varanasi",
    latitude: 25.3150, longitude: 83.0180,
    visitDuration: 1, entryFee: 0, priority: 2,
    time_slot: "anytime", theme_group: "ghats",
    description: "Sacred ghat where five rivers are believed to meet. Features the grand Alamgir Mosque on top and is lit beautifully during Dev Deepawali.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Panchganga_Ghat_in_Varanasi.jpg/800px-Panchganga_Ghat_in_Varanasi.jpg",
    publicId: "seeded"
  },
  {
    name: "Harishchandra Ghat",
    city: "Varanasi",
    latitude: 25.2983, longitude: 83.0072,
    visitDuration: 0.5, entryFee: 0, priority: 2,
    time_slot: "anytime", theme_group: "ghats",
    description: "Named after the legendary King Harishchandra. The second cremation ghat in Varanasi, smaller and less crowded than Manikarnika Ghat.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Harishchandra_Ghat_Varanasi.jpg/800px-Harishchandra_Ghat_Varanasi.jpg",
    publicId: "seeded"
  },
  {
    name: "Alamgir Mosque",
    city: "Varanasi",
    latitude: 25.3152, longitude: 83.0178,
    visitDuration: 0.5, entryFee: 0, priority: 2,
    time_slot: "anytime", theme_group: "temples",
    description: "Also called Beni Madhav Ka Darera. Built by Mughal emperor Aurangzeb, it sits majestically overlooking Panchganga Ghat and the Ganges.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Alamgir_Mosque%2C_Varanasi.jpg/800px-Alamgir_Mosque%2C_Varanasi.jpg",
    publicId: "seeded"
  },
  {
    name: "ISKCON Temple",
    city: "Varanasi",
    latitude: 25.2934, longitude: 83.0005,
    visitDuration: 1, entryFee: 0, priority: 2,
    time_slot: "anytime", theme_group: "temples",
    description: "International Society for Krishna Consciousness temple. Known for its beautiful architecture, devotional music, and vegetarian prasad.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/ISKCON_Temple_Vrindavan.jpg/800px-ISKCON_Temple_Vrindavan.jpg",
    publicId: "seeded"
  },
  {
    name: "Nepali Temple",
    city: "Varanasi",
    latitude: 25.3100, longitude: 83.0131,
    visitDuration: 0.5, entryFee: 0, priority: 2,
    time_slot: "anytime", theme_group: "temples",
    description: "A beautiful Nepali-style wooden temple at Lalita Ghat. Features exquisite erotic carvings similar to Khajuraho temples, built by King of Nepal.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Nepali_Temple_-_Lalita_Ghat%2C_Varanasi_-_Sept_2004.jpg/800px-Nepali_Temple_-_Lalita_Ghat%2C_Varanasi_-_Sept_2004.jpg",
    publicId: "seeded"
  },
  {
    name: "Chaukhandi Stupa",
    city: "Varanasi",
    latitude: 25.3741, longitude: 83.0237,
    visitDuration: 0.75, entryFee: 0, priority: 3,
    time_slot: "anytime", theme_group: "historic",
    description: "Ancient Buddhist stupa marking the spot where Buddha met his first five disciples. Features a unique octagonal Mughal tower on top.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Chaukhandi_Stupa.jpg/800px-Chaukhandi_Stupa.jpg",
    publicId: "seeded"
  },
  {
    name: "Sarnath Museum",
    city: "Varanasi",
    latitude: 25.3816, longitude: 83.0227,
    visitDuration: 1.5, entryFee: 25, priority: 2,
    time_slot: "morning", theme_group: "historic",
    description: "Archaeological museum housing the original Lion Capital of Ashoka (India's national emblem), along with Buddhist sculptures and artifacts from 3rd century BC.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Sarnath_Museum.jpg/800px-Sarnath_Museum.jpg",
    publicId: "seeded"
  },
  {
    name: "Manmandir Ghat",
    city: "Varanasi",
    latitude: 25.3077, longitude: 83.0110,
    visitDuration: 0.75, entryFee: 0, priority: 2,
    time_slot: "anytime", theme_group: "ghats",
    description: "Built by Maharaja Man Singh of Amber in 1600, this ghat features a stunning observatory (Jantar Mantar) on its terrace.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Man_Mandir_Ghat_in_Varanasi.jpg/800px-Man_Mandir_Ghat_in_Varanasi.jpg",
    publicId: "seeded"
  },
  {
    name: "Kabir Math",
    city: "Varanasi",
    latitude: 25.3222, longitude: 83.0072,
    visitDuration: 1, entryFee: 0, priority: 2,
    time_slot: "anytime", theme_group: "temples",
    description: "The ashram and memorial of Sant Kabir, the famous 15th-century mystic poet. A serene spiritual place reflecting Kabir's philosophy of unity.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Kabir_Math_Varanasi.jpg/800px-Kabir_Math_Varanasi.jpg",
    publicId: "seeded"
  },
  {
    name: "Lolark Kund",
    city: "Varanasi",
    latitude: 25.2910, longitude: 83.0058,
    visitDuration: 0.5, entryFee: 0, priority: 3,
    time_slot: "anytime", theme_group: "other",
    description: "Ancient sacred well dedicated to Sun God (Surya). One of the few remaining kunds in Varanasi, popular during Lolark Shashthi festival.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Lolark_Kund_Varanasi.jpg/800px-Lolark_Kund_Varanasi.jpg",
    publicId: "seeded"
  },
  {
    name: "Mulagandha Kuti Vihar",
    city: "Varanasi",
    latitude: 25.3807, longitude: 83.0266,
    visitDuration: 1, entryFee: 0, priority: 2,
    time_slot: "morning", theme_group: "temples",
    description: "A modern Buddhist temple at Sarnath with beautiful Japanese-style frescoes painted by Kosetsu Nosu depicting scenes from Buddha's life.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Mulagandhakuti_vihara_01.jpg/800px-Mulagandhakuti_vihara_01.jpg",
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
    // Step 1: Delete ALL existing places
    const deleted = await Place.deleteMany({});
    console.log(`🗑️  Deleted ${deleted.deletedCount} existing places\n`);

    // Step 2: Insert curated places
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
