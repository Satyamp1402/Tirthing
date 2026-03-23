import mongoose from 'mongoose';

const placeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  image: { type: String, required: true }, // URL only
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  visitDuration: { type: Number, required: true }, // in hours
  entryFee: { type: Number, required: true, default: 0 },
  priority: { type: Number, required: true, enum: [1, 2, 3] }, // 1 = must visit, 2 = recommended, 3 = optional
  description: { type: String }
}, { timestamps: true });

const Place = mongoose.model('Place', placeSchema);
export default Place;
