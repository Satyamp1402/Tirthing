import mongoose from 'mongoose';

/**
 * Itinerary Schema — a saved, generated trip plan for a user.
 *
 * Stores the input parameters (destination, days, budget, groupSize)
 * alongside the computed day-by-day plan so users can revisit their
 * itineraries without re-running the engine.
 */
const itinerarySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  destination: { type: String, required: true },
  days: { type: Number, required: true },
  budget: { type: Number, required: true },
  groupSize: { type: Number, required: true },

  // travelDate: The start date of the trip. Optional — when provided, the engine
  // could use it for season-aware filtering in future iterations.
  travelDate: { type: Date },

  // budgetTier: The detected or user-specified cost tier.
  // Auto-detected by the engine from per-person-per-day budget:
  //   < ₹1,000 → 'budget'  |  < ₹3,500 → 'comfort'  |  else → 'premium'
  budgetTier: {
    type: String,
    enum: ['budget', 'comfort', 'premium'],
    default: 'budget'
  },

  plan: [{
    day: { type: Number, required: true },
    places: [{
      placeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Place' },
      name: String,
      city: String,
      image: String,
      latitude: Number,
      longitude: Number,
      visitDuration: Number,
      entryFee: Number,
      priority: Number,
      description: String
    }]
  }]
}, { timestamps: true });

const Itinerary = mongoose.model('Itinerary', itinerarySchema);
export default Itinerary;
