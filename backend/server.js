import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import placeRoutes from './routes/place.routes.js';
import itineraryRoutes from './routes/itinerary.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js'

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",                           // local frontend
    process.env.FRONTEND_URL || "https://tirthing.vercel.app" // deployed frontend
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());

// cookie-parser reads httpOnly cookies from the request and makes them
// available as req.cookies — required for the JWT cookie auth flow
app.use(cookieParser());

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
    console.log(`🚀 Server is running.`);
});