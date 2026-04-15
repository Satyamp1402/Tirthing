import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { deleteFromCloudinary } from "../utils/deleteFromCloudinary.js";
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

    // 🔥 find existing place
    const place = await Place.findById(id);

    if (!place) {
      return res.status(404).json({ message: "Place not found" });
    }

    let imageUrl = place.image;
    let publicId = place.publicId;

    // 🔥 if new image uploaded
    if (req.file) {

      const uploaded = await uploadToCloudinary(req.file.buffer);

      if (place.publicId) {
        await deleteFromCloudinary(place.publicId); // delete AFTER upload success
      }
      imageUrl = uploaded.url;
      publicId = uploaded.publicId;
    }
      
    const updatedData = {
      name: req.body.name ?? place.name,
      city: req.body.city ?? place.city,
      description: req.body.description ?? place.description,

      latitude: req.body.latitude ? Number(req.body.latitude) : place.latitude,
      longitude: req.body.longitude ? Number(req.body.longitude) : place.longitude,
      visitDuration: req.body.visitDuration ? Number(req.body.visitDuration) : place.visitDuration,
      entryFee: req.body.entryFee ? Number(req.body.entryFee) : place.entryFee,
      priority: req.body.priority ? Number(req.body.priority) : place.priority,

      image: imageUrl,
      publicId: publicId
    };

    // 🔥 update fields
    const updatedPlace = await Place.findByIdAndUpdate(
      id,
      updatedData,
      {
        returnDocument: 'after', // ✅ FIXED
        runValidators: true
      }
    );
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

    // 🔥 find place first (so we get publicId)
    const place = await Place.findById(id);

    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    // 🔥 delete image from cloudinary
    if (place.publicId) {
      await deleteFromCloudinary(place.publicId);
    }

    // 🔥 delete from DB
    await Place.findByIdAndDelete(id);

    res.status(200).json({ message: 'Place deleted successfully' });

  } catch (error) {
    console.error('Error deleting place:', error);
    res.status(500).json({ message: 'Server error deleting place' });
  }
};