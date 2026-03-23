import mongoose from 'mongoose';

const itinerarySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  destination: { type: String, required: true },
  days: { type: Number, required: true },
  budget: { type: Number, required: true },
  groupSize: { type: Number, required: true },
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
