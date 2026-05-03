// db.js - MongoDB connection for CarWorkshop Booking
const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = 'carworkshop';

let db;

async function connectDB() {
  if (db) return db;
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log(`✅ Connected to MongoDB: ${DB_NAME}`);

  // Seed mechanics collection if empty
  const mechanics = db.collection('mechanics');
  const count = await mechanics.countDocuments();
  if (count === 0) {
    await mechanics.insertMany([
      { _id: 1, name: 'Mr. Karim', speciality: 'Engine Specialist' },
      { _id: 2, name: 'Mr. Rahim', speciality: 'Electrical Systems' },
      { _id: 3, name: 'Mr. Salim', speciality: 'Body & Paint' },
      { _id: 4, name: 'Mr. Babu',  speciality: 'Transmission Expert' },
      { _id: 5, name: 'Mr. Anis',  speciality: 'General Servicing' }
    ]);
    console.log('✅ Seeded mechanics collection');
  }

  return db;
}

module.exports = { connectDB };
