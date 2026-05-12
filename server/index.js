const express = require('express');
const cors = require('cors');
const db = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173'];

app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());

// Routes
app.use('/api/exercises', require('./routes/exercises'));

// Test route (keep this for now)
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Backend is alive' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
app.use('/api/exercises', require('./routes/exercises'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/sets', require('./routes/sets'));