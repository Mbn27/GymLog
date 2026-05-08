const express = require('express');
const db = require('../db/database');

const router = express.Router();

// GET /api/workouts - list all workouts (newest first)
router.get('/', (req, res) => {
  const workouts = db.prepare(`
    SELECT workouts.*,
           (SELECT COUNT(*) FROM sets WHERE sets.workout_id = workouts.id) as set_count
    FROM workouts
    ORDER BY started_at DESC
  `).all();
  res.json(workouts);
});

// GET /api/workouts/:id - full workout detail with all sets grouped by exercise
router.get('/:id', (req, res) => {
  const workout = db.prepare('SELECT * FROM workouts WHERE id = ?').get(req.params.id);
  if (!workout) {
    return res.status(404).json({ error: 'Workout not found' });
  }

  const sets = db.prepare(`
    SELECT sets.*, exercises.name as exercise_name, exercises.muscle_group
    FROM sets
    JOIN exercises ON sets.exercise_id = exercises.id
    WHERE sets.workout_id = ?
    ORDER BY sets.set_order ASC
  `).all(req.params.id);

  res.json({ ...workout, sets });
});

// POST /api/workouts - start a new workout
router.post('/', (req, res) => {
  const { notes } = req.body;
  const result = db.prepare(
    'INSERT INTO workouts (notes) VALUES (?)'
  ).run(notes || null);

  const newWorkout = db.prepare('SELECT * FROM workouts WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newWorkout);
});

// PATCH /api/workouts/:id - update a workout (notes, mark ended)
router.patch('/:id', (req, res) => {
  const { notes, ended_at } = req.body;
  const workout = db.prepare('SELECT * FROM workouts WHERE id = ?').get(req.params.id);
  if (!workout) {
    return res.status(404).json({ error: 'Workout not found' });
  }

  db.prepare(`
    UPDATE workouts
    SET notes = COALESCE(?, notes),
        ended_at = COALESCE(?, ended_at)
    WHERE id = ?
  `).run(notes, ended_at, req.params.id);

  const updated = db.prepare('SELECT * FROM workouts WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/workouts/:id - delete a workout (cascades to sets)
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM workouts WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Workout not found' });
  }
  res.json({ success: true });
});

// POST /api/workouts/:id/sets - add a set to a workout
router.post('/:id/sets', (req, res) => {
  const { exercise_id, weight, reps } = req.body;

  if (!exercise_id || weight == null || reps == null) {
    return res.status(400).json({ error: 'exercise_id, weight, and reps are required' });
  }

  const workout = db.prepare('SELECT * FROM workouts WHERE id = ?').get(req.params.id);
  if (!workout) {
    return res.status(404).json({ error: 'Workout not found' });
  }

  // Determine next set_order for this exercise within this workout
  const lastOrder = db.prepare(`
    SELECT MAX(set_order) as max_order FROM sets
    WHERE workout_id = ? AND exercise_id = ?
  `).get(req.params.id, exercise_id);
  const nextOrder = (lastOrder.max_order || 0) + 1;

  try {
    const result = db.prepare(`
      INSERT INTO sets (workout_id, exercise_id, weight, reps, set_order)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.params.id, exercise_id, weight, reps, nextOrder);

    const newSet = db.prepare('SELECT * FROM sets WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newSet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;