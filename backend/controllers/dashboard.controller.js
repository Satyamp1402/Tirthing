import Itinerary from '../models/itinerary.model.js';
import Place from '../models/place.model.js';
import User from '../models/user.model.js';


import mongoose from 'mongoose';

export const getUserDashboardData = async (req, res) => {
  try {
    // Ensure we are comparing ObjectId to ObjectId in aggregation
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // 1. Basic Counts & Recent Items
    const totalGenerated = await Itinerary.countDocuments({ user: userId });
    
    const recentItineraries = await Itinerary.find({ user: userId })
      .select('-plan.places.priority') 
      .sort({ createdAt: -1 })
      .limit(3);

    // 2. Aggregate Stats (Top Destinations, Budget, and Place Count)
    // Running this in one pipeline is more efficient
    const stats = await Itinerary.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalBudgetSpent: { $sum: { $toDouble: "$budget" } }, // Ensures numeric sum
          // Count total items in the places array across all itineraries
          totalPlacesVisited: { 
            $sum: { $size: { $ifNull: ["$plan.places", []] } } 
          },
          // Collect all destinations to count unique cities later
          allDestinations: { $push: "$destination" }
        }
      }
    ]);

    const topDestinations = await Itinerary.aggregate([
      { $match: { user: userId } },
      { $group: { _id: "$destination", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // 3. System-wide Stats
    const systemPlaces = await Place.countDocuments();
    const systemCitiesResult = await Place.distinct('city');

    const userStats = stats[0] || { totalBudgetSpent: 0, totalPlacesVisited: 0 };

    res.status(200).json({
      success: true,
      summary: {
        totalItineraries: totalGenerated,
        totalBudgetTracked: userStats.totalBudgetSpent,
        placesExplored: userStats.totalPlacesVisited
      },
      systemInventory: {
        availablePlaces: systemPlaces,
        availableCities: systemCitiesResult.length
      },
      topDestinations,
      recentItineraries
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: error.message });
  }
};
export const getAdminDashboard = async (req, res) => {
  try {
    // Run independent queries in parallel to save time
    const [recentGlobalItineraries, recentAddedPlaces, counts, systemOverview] = await Promise.all([
      Itinerary.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(3),
      Place.find().sort({ createdAt: -1 }).limit(3),
      // Aggregate counts in one go or use Promise.all
      Promise.all([
        User.countDocuments({ role: 'user' }),
        Itinerary.countDocuments(),
        Place.countDocuments()
      ]),
      Place.aggregate([
        {
          $facet: {
            "priorityDistribution": [
              { $group: { _id: "$priority", count: { $sum: 1 } } }
            ],
            "budgetInsights": [
              { $group: { 
                  _id: null, 
                  avgEntryFee: { $avg: "$entryFee" },
                  mostExpensive: { $max: "$entryFee" } 
              } }
            ]
          }
        }
      ])
    ]);

    res.status(200).json({
      success: true,
      activity: {
        recentItineraries: recentGlobalItineraries,
        recentPlaces: recentAddedPlaces
      },
      counts: {
        totalUsers: counts[0],
        totalItineraries: counts[1],
        totalPlaces: counts[2]
      },
      inventoryHealth: systemOverview[0].priorityDistribution,
      // Added optional chaining here to prevent errors if collection is empty
      financials: systemOverview[0].budgetInsights[0] || { avgEntryFee: 0, mostExpensive: 0 }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};