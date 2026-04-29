import mongoose from 'mongoose';

/**
 * Place Schema — represents a visitable pilgrimage site.
 *
 * Each place has geographic coordinates for route optimization,
 * a visit duration for day-planning, and pilgrimage-specific metadata
 * like time_slot (when the site is best experienced) and theme_group
 * (what kind of spiritual/cultural experience it offers).
 */
const placeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  image: { type: String, required: true }, // Cloudinary URL
  publicId: { type: String, required: true }, // Cloudinary public ID for deletion

  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },

  visitDuration: { type: Number, required: true }, // in hours (e.g. 1.5)
  entryFee: { type: Number, required: true, default: 0 }, // in INR per person

  // 1 = must-visit (e.g. Kashi Vishwanath), 2 = recommended, 3 = optional/niche
  priority: { type: Number, required: true, enum: [1, 2, 3] },

  description: { type: String },

  // --- Pilgrimage-specific scheduling metadata ---

  // time_slot: Controls WHEN this site should appear in the daily schedule.
  // 'dawn'    — Early-morning rituals like Ganga Aarti at Dashashwamedh (05:00–07:00)
  // 'morning' — Temples that open early and get crowded by afternoon (07:00–13:00)
  // 'aarti'   — Sunset rituals like Sandhya Aarti — fixed at ~18:30, non-negotiable
  // 'anytime' — Flexible sites that can fill any gap in the schedule
  time_slot: {
    type: String,
    enum: ['dawn', 'morning', 'aarti', 'anytime'],
    default: 'anytime'
  },

  // theme_group: Categorizes the spiritual/cultural experience for thematic clustering.
  // Helps group similar experiences on the same day (e.g. a "ghats day" or "temple trail").
  theme_group: {
    type: String,
    enum: ['ghats', 'temples', 'historic', 'nature', 'other'],
    default: 'other'
  },

  // best_season: Human-readable hint for seasonal relevance.
  // Example: "October to February" for pleasant weather at outdoor ghats.
  // Optional — engine does not enforce this yet, but frontend can display it.
  best_season: { type: String }

}, { timestamps: true });

const Place = mongoose.model('Place', placeSchema);
export default Place;
