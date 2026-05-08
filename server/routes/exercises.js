const express = require('express');
const db = require('../db/database');

const router = express.Router();

// GET /api/exercises - list all exercises
router.get('/', (req, res) => {
  const exercises = db.prepare('SELECT * FROM exercises ORDER BY name').all();
  res.json(exercises);
});

// GET /api/exercises/:id - get one exercise
router.get('/:id', (req, res) => {
  const exercise = db.prepare('SELECT * FROM exercises WHERE id = ?').get(req.params.id);
  if (!exercise) {
    return res.status(404).json({ error: 'Exercise not found' });
  }
  res.json(exercise);
});

// POST /api/exercises - create a new exercise
router.post('/', (req, res) => {
  const { name, muscle_group, notes } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const result = db.prepare(
      'INSERT INTO exercises (name, muscle_group, notes) VALUES (?, ?, ?)'
    ).run(name.trim(), muscle_group || null, notes || null);

    const newExercise = db.prepare('SELECT * FROM exercises WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newExercise);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Exercise with that name already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/exercises/:id - delete an exercise
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM exercises WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Exercise not found' });
  }
  res.json({ success: true });
});

// GET /api/exercises/:id/history - last sets for this exercise
router.get('/:id/history', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const history = db.prepare(`
    SELECT sets.*, workouts.started_at as workout_date
    FROM sets
    JOIN workouts ON sets.workout_id = workouts.id
    WHERE sets.exercise_id = ?
    ORDER BY workouts.started_at DESC, sets.set_order ASC
    LIMIT ?
  `).all(req.params.id, limit);
  res.json(history);
});

module.exports = router;