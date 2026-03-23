import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import placeRoutes from './routes/place.routes.js';
import itineraryRoutes from './routes/itinerary.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js'

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/place', placeRoutes);
app.use('/api/itinerary', itineraryRoutes);
app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;


const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

connectDB();



// This is the missing piece!
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});