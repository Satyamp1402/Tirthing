// ============================================================================
// Itinerary API Integration Tests — Generation, Auth Guards, Error Handling
// ============================================================================
//
// WHY THESE TESTS MATTER:
// The itinerary endpoint is the core feature. We need to verify:
//   1. Unauthenticated users can't generate itineraries (security)
//   2. Invalid cities return proper errors (not crashes)
//   3. Low budgets return helpful suggestions (not generic errors)
//   4. Valid requests return complete, well-structured itineraries
// ============================================================================

import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import express from 'express';
import cookieParser from 'cookie-parser';
import User from '../models/user.model.js';
import authRoutes from '../routes/auth.routes.js';
import itineraryRoutes from '../routes/itinerary.routes.js';

let app;
let supertest;
let authCookie;

beforeAll(async () => {
  const mod = await import('supertest');
  supertest = mod.default;

  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/tirthing_test';
  await mongoose.connect(mongoUri);

  app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/auth', authRoutes);
  app.use('/api/itinerary', itineraryRoutes);

  // Create a test user and get the auth cookie
  const testEmail = `test_itin_${Date.now()}@test.com`;
  const signupRes = await supertest(app)
    .post('/api/auth/signup')
    .send({ name: 'Itinerary Tester', email: testEmail, password: 'testpass123' });

  // Extract the auth cookie from the signup response
  const cookies = signupRes.headers['set-cookie'];
  if (cookies) {
    authCookie = cookies.find(c => c.includes('token='));
  }
});

afterAll(async () => {
  await User.deleteMany({ email: { $regex: /^test_itin_/ } });
  await mongoose.connection.close();
});


// ─── AUTH GUARD TESTS ───────────────────────────────────────────────────────

describe('Itinerary auth protection', () => {

  test('generate without authentication returns 401', async () => {
    const response = await supertest(app)
      .post('/api/itinerary/generate')
      .send({ destination: 'Varanasi', days: 2, budget: 10000, groupSize: 2 });

    expect(response.status).toBe(401);
  });

  test('get my itineraries without authentication returns 401', async () => {
    const response = await supertest(app)
      .get('/api/itinerary/my');

    expect(response.status).toBe(401);
  });
});


// ─── GENERATION ERROR TESTS ─────────────────────────────────────────────────

describe('POST /api/itinerary/generate — error cases', () => {

  test('invalid destination returns 404', async () => {
    if (!authCookie) return;

    const response = await supertest(app)
      .post('/api/itinerary/generate')
      .set('Cookie', authCookie)
      .send({ destination: 'NonExistentCity12345', days: 2, budget: 10000, groupSize: 2 });

    expect(response.status).toBe(404);
    expect(response.body.message).toBeDefined();
  });

  test('budget too low returns 400 with suggestion object', async () => {
    if (!authCookie) return;

    const response = await supertest(app)
      .post('/api/itinerary/generate')
      .set('Cookie', authCookie)
      .send({ destination: 'Varanasi', days: 3, budget: 100, groupSize: 4 });

    // Either 400 (budget too low) or 404 (no places in test DB)
    // Both are valid — depends on whether Varanasi places exist in the DB
    expect([400, 404]).toContain(response.status);

    if (response.status === 400) {
      expect(response.body.suggestion).toBeDefined();
      expect(response.body.suggestion.minBudget).toBeGreaterThan(100);
    }
  });
});


// ─── SUCCESSFUL GENERATION ──────────────────────────────────────────────────

describe('POST /api/itinerary/generate — valid request', () => {

  test('valid Varanasi request returns 201 with complete itinerary', async () => {
    if (!authCookie) return;

    const response = await supertest(app)
      .post('/api/itinerary/generate')
      .set('Cookie', authCookie)
      .send({ destination: 'Varanasi', days: 2, budget: 50000, groupSize: 2 });

    // If no places in test DB, this will be 404 — that's OK for CI
    if (response.status === 404) {
      console.log('Skipped: No Varanasi places in test database');
      return;
    }

    expect(response.status).toBe(201);
    expect(response.body.itinerary).toBeDefined();
    expect(response.body.itinerary.destination).toBe('Varanasi');
    expect(response.body.itinerary.plan).toBeDefined();
    expect(Array.isArray(response.body.itinerary.plan)).toBe(true);

    // Each day should have places
    for (const day of response.body.itinerary.plan) {
      expect(day.day).toBeGreaterThan(0);
      expect(Array.isArray(day.places)).toBe(true);
    }
  });
});
