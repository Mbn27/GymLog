const express = require('express');
const cors = require('cors');
const db = require('./db/database');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
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