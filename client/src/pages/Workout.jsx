import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getWorkout,
  getExercises,
  getExerciseHistory,
  getExerciseStats,
  addSet,
  deleteSet,
  updateWorkout,
  deleteWorkout,
} from '../api';

export default function Workout() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workout, setWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Notes
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Active exercise selection + history + stats
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [lastTime, setLastTime] = useState([]);
  const [stats, setStats] = useState(null);

  // Set form
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load workout + exercise list on mount
  useEffect(() => {
    loadAll();
  }, [id]);

  // When the selected exercise changes, fetch its history and stats
  useEffect(() => {
    if (!selectedExerciseId) {
      setLastTime([]);
      setStats(null);
      return;
    }

    Promise.all([
      getExerciseHistory(selectedExerciseId, 10),
      getExerciseStats(selectedExerciseId),
    ])
      .then(([historyData, statsData]) => {
        if (historyData.length === 0) {
          setLastTime([]);
        } else {
          const previousWorkoutId = historyData.find(
            (s) => s.workout_id !== Number(id)
          )?.workout_id;
          setLastTime(
            previousWorkoutId
              ? historyData.filter((s) => s.workout_id === previousWorkoutId)
              : []
          );
        }
        setStats(statsData);
      })
      .catch(() => {
        setLastTime([]);
        setStats(null);
      });
  }, [selectedExerciseId, id]);

  async function loadAll() {
    try {
      setLoading(true);
      const [w, ex] = await Promise.all([getWorkout(id), getExercises()]);
      setWorkout(w);
      setExercises(ex);
      setNotes(w.notes || '');
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveNotes() {
    try {
      setSavingNotes(true);
      await updateWorkout(id, { notes });
      const updated = await getWorkout(id);
      setWorkout(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingNotes(false);
    }
  }

  async function handleAddSet(e) {
    e?.preventDefault?.();
    if (!selectedExerciseId || !weight || !reps) return;

    try {
      setSubmitting(true);
      await addSet(id, {
        exercise_id: Number(selectedExerciseId),
        weight: Number(weight),
        reps: Number(reps),
      });
      setWeight('');
      setReps('');
      const updated = await getWorkout(id);
      setWorkout(updated);
      // Refresh stats so a new PR appears immediately
      const newStats = await getExerciseStats(selectedExerciseId);
      setStats(newStats);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteSet(setId) {
    try {
      await deleteSet(setId);
      const updated = await getWorkout(id);
      setWorkout(updated);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleFinish() {
    if (!confirm('Finish this workout?')) return;
    try {
      await updateWorkout(id, { ended_at: new Date().toISOString() });
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteWorkout() {
    if (!confirm('Delete this whole workout? All sets will be lost.')) return;
    try {
      await deleteWorkout(id);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p className="text-gray-400">Loading...</p>;
  if (error && !workout) return <p className="text-red-400">{error}</p>;
  if (!workout) return null;

  // Group sets by exercise for display
  const setsByExercise = {};
  for (const s of workout.sets || []) {
    if (!setsByExercise[s.exercise_id]) {
      setsByExercise[s.exercise_id] = {
        name: s.exercise_name,
        muscle_group: s.muscle_group,
        sets: [],
      };
    }
    setsByExercise[s.exercise_id].sets.push(s);
  }

  const isFinished = !!workout.ended_at;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">
            {isFinished ? 'Workout Complete' : 'Active Workout'}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Started {new Date(workout.started_at + 'Z').toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          {!isFinished && (
            <button
              onClick={handleFinish}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md font-medium transition-colors"
            >
              Finish
            </button>
          )}
          <button
            onClick={handleDeleteWorkout}
            className="bg-red-900/60 hover:bg-red-800 px-4 py-2 rounded-md font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How did this session feel? Any injuries, PRs, observations?"
          rows={2}
          disabled={isFinished}
          className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 disabled:opacity-60 resize-none"
        />
        {!isFinished && notes !== (workout.notes || '') && (
          <button
            onClick={handleSaveNotes}
            disabled={savingNotes}
            className="mt-2 text-sm bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 px-3 py-1 rounded-md transition-colors"
          >
            {savingNotes ? 'Saving...' : 'Save notes'}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-200 rounded-md p-3 mb-4">
          {error}
        </div>
      )}

      {/* Set entry form (hidden if finished) */}
      {!isFinished && (
        <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-3">Log a set</h2>

          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 mb-3 focus:outline-none focus:border-blue-500"
          >
            <option value="">Select an exercise...</option>
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name} {ex.muscle_group ? `(${ex.muscle_group})` : ''}
              </option>
            ))}
          </select>

          {selectedExerciseId && (lastTime.length > 0 || stats?.max_weight_set) && (
            <div className="bg-gray-900/50 border border-gray-700 rounded-md p-3 mb-3 space-y-2">
              {lastTime.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Last time:</p>
                  <p className="text-sm font-mono">
                    {lastTime.map((s, i) => (
                      <span key={s.id}>
                        {i > 0 && <span className="text-gray-600 mx-1">·</span>}
                        {s.weight} × {s.reps}
                      </span>
                    ))}
                  </p>
                </div>
              )}

              {stats?.max_weight_set && (
                <div className={lastTime.length > 0 ? 'pt-2 border-t border-gray-700/60' : ''}>
                  <p className="text-xs text-gray-400 mb-1">Personal records:</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Heaviest</p>
                      <p className="font-mono text-yellow-300">
                        {stats.max_weight_set.weight} × {stats.max_weight_set.reps}
                      </p>
                    </div>
                    {stats.estimated_1rm && (
                      <div>
                        <p className="text-xs text-gray-500">Est. 1RM</p>
                        <p className="font-mono text-yellow-300">{stats.estimated_1rm}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="number"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Weight"
              step="2.5"
              className="bg-gray-900 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500"
            />
            <input
              type="number"
              inputMode="numeric"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="Reps"
              className="bg-gray-900 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleAddSet(e)}
            />
          </div>

          <button
            onClick={handleAddSet}
            disabled={submitting || !selectedExerciseId || !weight || !reps}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed py-2 rounded-md font-medium transition-colors"
          >
            {submitting ? 'Adding...' : 'Add Set'}
          </button>
        </div>
      )}

      {/* Logged sets, grouped by exercise */}
      <h2 className="text-lg font-semibold mb-3">This workout</h2>
      {Object.keys(setsByExercise).length === 0 ? (
        <p className="text-gray-400">No sets logged yet.</p>
      ) : (
        <div className="space-y-3">
          {Object.entries(setsByExercise).map(([exId, group]) => (
            <div key={exId} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="mb-2">
                <p className="font-semibold">{group.name}</p>
                {group.muscle_group && (
                  <p className="text-xs text-gray-400">{group.muscle_group}</p>
                )}
              </div>
              <div className="space-y-1">
                {group.sets.map((s, i) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between bg-gray-900/50 rounded px-3 py-2"
                  >
                    <p className="font-mono text-sm">
                      <span className="text-gray-500 mr-3">Set {i + 1}</span>
                      {s.weight} × {s.reps}
                    </p>
                    {!isFinished && (
                      <button
                        onClick={() => handleDeleteSet(s.id)}
                        className="text-red-400 hover:text-red-300 text-xs px-2 py-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}