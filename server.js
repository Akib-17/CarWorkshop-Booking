// server.js - Node.js/Express backend with MongoDB
require('dotenv').config();
const express = require('express');
const { ObjectId } = require('mongodb');
const { connectDB } = require('./db');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ─── GET /api/mechanics ───────────────────────────────────────────────────────
app.get('/api/mechanics', async (req, res) => {
  try {
    const db = await connectDB();
    const mechanics = await db.collection('mechanics').find().toArray();
    res.json(mechanics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/appointments ───────────────────────────────────────────────────
app.post('/api/appointments', async (req, res) => {
  try {
    const db = await connectDB();
    const appointments = db.collection('appointments');
    const {
      client_name, address, phone,
      car_license, engine_number,
      appointment_date, mechanic_id
    } = req.body;

    // Validate required fields
    if (!client_name || !phone || !car_license || !engine_number || !appointment_date || !mechanic_id) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Validate phone (BD format)
    const phoneRegex = /^(\+88)?01[3-9]\d{8}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: 'Invalid Bangladeshi phone number.' });
    }

    // Validate car license (ABC-1234)
    const licenseRegex = /^[A-Z]{3}-\d{4}$/;
    if (!licenseRegex.test(car_license)) {
      return res.status(400).json({ error: 'Car license format must be ABC-1234.' });
    }

    // Check duplicate appointment (same car on same date)
    const duplicate = await appointments.findOne({ car_license, appointment_date });
    if (duplicate) {
      return res.status(409).json({ error: 'This car already has an appointment on that date.' });
    }

    // Check mechanic capacity (max 4 per day)
    const mechanicCount = await appointments.countDocuments({
      mechanic_id: parseInt(mechanic_id),
      appointment_date
    });
    if (mechanicCount >= 4) {
      return res.status(409).json({ error: 'Selected mechanic is fully booked on that date.' });
    }

    // Insert
    const doc = {
      client_name, address, phone,
      car_license, engine_number,
      appointment_date,
      mechanic_id: parseInt(mechanic_id),
      status: 'pending',
      created_at: new Date()
    };
    const result = await appointments.insertOne(doc);
    res.status(201).json({ message: 'Appointment booked successfully!', id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/appointments ────────────────────────────────────────────────────
app.get('/api/appointments', async (req, res) => {
  try {
    const db = await connectDB();
    const appointments = await db.collection('appointments')
      .aggregate([
        {
          $lookup: {
            from: 'mechanics',
            localField: 'mechanic_id',
            foreignField: '_id',
            as: 'mechanic'
          }
        },
        { $unwind: { path: '$mechanic', preserveNullAndEmptyArrays: true } },
        { $sort: { appointment_date: 1 } }
      ]).toArray();
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/appointments/:id ────────────────────────────────────────────────
app.put('/api/appointments/:id', async (req, res) => {
  try {
    const db = await connectDB();
    const { appointment_date, mechanic_id, status } = req.body;

    const update = {};
    if (appointment_date) update.appointment_date = appointment_date;
    if (mechanic_id)      update.mechanic_id = parseInt(mechanic_id);
    if (status)           update.status = status;

    await db.collection('appointments').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: update }
    );
    res.json({ message: 'Appointment updated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/appointments/:id ─────────────────────────────────────────────
app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const db = await connectDB();
    await db.collection('appointments').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: 'Appointment deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Serve frontend pages ─────────────────────────────────────────────────────
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚗 Server running at http://localhost:${PORT}`));
