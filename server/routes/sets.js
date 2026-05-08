const express = require('express');
const db = require('../db/database');

const router = express.Router();

// DELETE /api/sets/:id - remove a single set
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM sets WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Set not found' });
  }
  res.json({ success: true });
});

module.exports = router;