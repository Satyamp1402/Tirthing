import Itinerary from '../models/itinerary.model.js';
import Place from '../models/place.model.js';
import { generateItineraryPlan } from '../utils/engine.js';


/**
 * POST /api/itinerary/generate
 *
 * Generates a pilgrimage itinerary based on destination, days, budget,
 * group size, and optional parameters (travelDate, elderlyFriendly).
 *
 * The engine may return either a valid plan or a structured error with
 * budget suggestions — both cases are handled gracefully.
 *
 * @param {Object} req.body - { destination, days, budget, groupSize, travelDate?, elderlyFriendly? }
 * @returns {Object} 201 with saved itinerary, or 400 with error + suggestion
 */
export const generateItinerary = async (req, res) => {
  try {
    const { destination, days, budget, groupSize, travelDate, elderlyFriendly } = req.body;

    // Fetch all places for the requested city (case-insensitive match)
    const places = await Place.find({ city: { $regex: new RegExp(`^${destination}$`, 'i') } });

    if (!places || places.length === 0) {
      return res.status(404).json({ message: 'No places found for this destination.' });
    }

    // Run the engine — now async because it fetches OSRM road data before clustering
    const engineResult = await generateItineraryPlan(places, days, budget, groupSize, {
      elderlyFriendly: elderlyFriendly || false
    });

    // If the engine flagged an error (budget too low, no sites fit, etc.),
    // send the structured suggestion back so the frontend can guide the user
    if (engineResult.error) {
      return res.status(400).json({
        message: engineResult.message,
        detectedTier: engineResult.detectedTier,
        suggestion: engineResult.suggestion
      });
    }

    // Build and save the itinerary document with the new fields
    const newItinerary = new Itinerary({
      user: req.user.id,
      destination,
      days,
      budget,
      groupSize,
      travelDate: travelDate || undefined,             // optional trip start date
      budgetTier: engineResult.detectedTier || 'budget', // auto-detected cost tier
      plan: engineResult.plan
    });

    await newItinerary.save();

    res.status(201).json({ message: 'Itinerary generated successfully', itinerary: newItinerary });
  } catch (error) {
    console.error('Error generating itinerary:', error);
    res.status(500).json({ message: 'Server error generating itinerary' });
  }
};


/**
 * GET /api/itinerary/my
 *
 * Returns all itineraries belonging to the authenticated user,
 * sorted by most recently created first.
 */
export const getMyItineraries = async (req, res) => {
  try {
    const itineraries = await Itinerary.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(itineraries);
  } catch (error) {
    console.error('Error fetching itineraries:', error);
    res.status(500).json({ message: 'Server error fetching itineraries' });
  }
};


/**
 * GET /api/itinerary/:id
 *
 * Returns a single itinerary by its MongoDB _id.
 */
export const getItineraryById = async (req, res) => {
  const itinerary = await Itinerary.findById(req.params.id);

  if (!itinerary) {
    return res.status(404).json({ message: "Not found" });
  }

  res.json(itinerary);
};


/**
 * DELETE /api/itinerary/:id
 *
 * Deletes an itinerary by its MongoDB _id.
 * Only the owner can delete their own itineraries.
 */
export const deleteItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    // Ownership check — prevent users from deleting other users' trips
    if (itinerary.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this itinerary' });
    }

    await Itinerary.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Itinerary deleted successfully' });
  } catch (error) {
    console.error('Error deleting itinerary:', error);
    res.status(500).json({ message: 'Server error deleting itinerary' });
  }
};
