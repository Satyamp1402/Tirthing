import Itinerary from '../models/itinerary.model.js';
import Place from '../models/place.model.js';
import { generateItineraryPlan } from '../utils/engine.js';



export const generateItinerary = async (req, res) => {
  try {
    const { destination, days, budget, groupSize } = req.body;
    
    // Fetch places for the destination (case insensitive RegExp match)
    const places = await Place.find({ city: { $regex: new RegExp(`^${destination}$`, 'i') } });

    if (!places || places.length === 0) {
      return res.status(404).json({ message: 'No places found for this destination.' });
    }

    let plan;
    try {
      plan = generateItineraryPlan(places, days, budget, groupSize);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    const newItinerary = new Itinerary({
      user: req.user.id,
      destination,
      days,
      budget,
      groupSize,
      plan
    });

    await newItinerary.save();
    
    res.status(201).json({ message: 'Itinerary generated successfully', itinerary: newItinerary });
  } catch (error) {
    console.error('Error generating itinerary:', error);
    res.status(500).json({ message: 'Server error generating itinerary' });
  }
};

export const getMyItineraries = async (req, res) => {
  try {
    const itineraries = await Itinerary.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(itineraries);
  } catch (error) {
    console.error('Error fetching itineraries:', error);
    res.status(500).json({ message: 'Server error fetching itineraries' });
  }
};

export const getItineraryById = async (req, res) => {
  const itinerary = await Itinerary.findById(req.params.id);

  if (!itinerary) {
    return res.status(404).json({ message: "Not found" });
  }

  res.json(itinerary);
};

