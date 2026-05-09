import { useState, useEffect } from 'react';
import { getExercises, createExercise, deleteExercise } from '../api';

const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Other'];

export default function Exercises() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('Chest');
  const [submitting, setSubmitting] = useState(false);

  // Load exercises when the page mounts
  useEffect(() => {
    loadExercises();
  }, []);

  async function loadExercises() {
    try {
      setLoading(true);
      const data = await getExercises();
      setExercises(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      await createExercise({ name: name.trim(), muscle_group: muscleGroup });
      setName('');
      await loadExercises();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this exercise? Past sets that reference it will keep working.')) return;
    try {
      await deleteExercise(id);
      await loadExercises();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Exercises</h1>

      {/* Add form */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
        <h2 className="text-lg font-semibold mb-3">Add new exercise</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Exercise name"
            className="flex-1 bg-gray-900 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd(e)}
          />
          <select
            value={muscleGroup}
            onChange={(e) => setMuscleGroup(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            {MUSCLE_GROUPS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={submitting || !name.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-4 py-2 rounded-md font-medium transition-colors"
          >
            {submitting ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-200 rounded-md p-3 mb-4">
          {error}
        </div>
      )}

      {/* List */}
      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : exercises.length === 0 ? (
        <p className="text-gray-400">No exercises yet. Add your first one above.</p>
      ) : (
        <div className="space-y-2">
          {exercises.map((ex) => (
            <div
              key={ex.id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-lg">{ex.name}</p>
                {ex.muscle_group && (
                  <p className="text-sm text-gray-400">{ex.muscle_group}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(ex.id)}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/30 px-3 py-1 rounded-md transition-colors text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}