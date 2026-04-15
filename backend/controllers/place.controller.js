import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import Place from "../models/place.model.js";

export const addPlace = async (req, res) => {
  try {
    const {
      name,
      city,
      latitude,
      longitude,
      visitDuration,
      entryFee,
      priority,
      description
    } = req.body;

    // 🔥 check file
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    // 🔥 upload
    const { url, publicId } = await uploadToCloudinary(req.file.buffer);

    // 🔥 save
    const newPlace = new Place({
      name,
      city,
      image: url,
      publicId, // ✅ stored
      latitude,
      longitude,
      visitDuration,
      entryFee,
      priority,
      description
    });

    await newPlace.save();

    res.status(201).json({
      message: "Place added successfully",
      place: newPlace
    });

  } catch (error) {
    console.error("Error adding place:", error);
    res.status(500).json({ message: "Server error adding place" });
  }
};
export const getAllPlaces = async (req, res) => {
  try {
    const places = await Place.find({});
    res.status(200).json(places);
  } catch (error) {
    console.error('Error fetching places:', error);
    res.status(500).json({ message: 'Server error fetching places' });
  }
};

export const getPlaceById = async (req, res) => {
  try {
    const { id } = req.params;

    const place = await Place.findById(id);

    if (!place) {
      return res.status(404).json({ message: "Place not found" });
    }

    res.status(200).json(place);

  } catch (error) {
    console.error("Error fetching place:", error);
    res.status(500).json({ message: "Server error fetching place" });
  }
};


export const updatePlace = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedPlace = await Place.findByIdAndUpdate(
      id,
      { ...req.body }, // update whatever fields admin sends
      {
        new: true,         // return updated doc
        runValidators: true // apply schema validation
      }
    );

    if (!updatedPlace) {
      return res.status(404).json({ message: "Place not found" });
    }

    res.status(200).json({
      message: "Place updated successfully",
      place: updatedPlace
    });

  } catch (error) {
    console.error("Error updating place:", error);
    res.status(500).json({ message: "Server error updating place" });
  }
};

export const deletePlace = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPlace = await Place.findByIdAndDelete(id);
    
    if (!deletedPlace) {
      return res.status(404).json({ message: 'Place not found' });
    }

    res.status(200).json({ message: 'Place deleted successfully' });
  } catch (error) {
    console.error('Error deleting place:', error);
    res.status(500).json({ message: 'Server error deleting place' });
  }
};
