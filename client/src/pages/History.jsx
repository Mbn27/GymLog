import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWorkouts } from '../api';

export default function History() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadWorkouts();
  }, []);

  async function loadWorkouts() {
    try {
      setLoading(true);
      const data = await getWorkouts();
      setWorkouts(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Group workouts by month
  const grouped = {};
  for (const w of workouts) {
    const date = new Date(w.started_at + 'Z');
    const key = date.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(w);
  }

  const totalSets = workouts.reduce((sum, w) => sum + w.set_count, 0);
  const finishedCount = workouts.filter((w) => w.ended_at).length;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">History</h1>

      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-200 rounded-md p-3 mb-4">
          {error}
        </div>
      )}

      {/* Summary stats */}
      {!loading && workouts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <p className="text-3xl font-bold">{finishedCount}</p>
            <p className="text-sm text-gray-400">Workouts</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <p className="text-3xl font-bold">{totalSets}</p>
            <p className="text-sm text-gray-400">Total sets</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 col-span-2 sm:col-span-1">
            <p className="text-3xl font-bold">
              {finishedCount > 0 ? (totalSets / finishedCount).toFixed(1) : '0'}
            </p>
            <p className="text-sm text-gray-400">Avg sets / workout</p>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : workouts.length === 0 ? (
        <p className="text-gray-400">
          No workouts yet. Head back to{' '}
          <Link to="/" className="text-blue-400 hover:text-blue-300">
            home
          </Link>{' '}
          to start one.
        </p>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([month, list]) => (
            <div key={month}>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                {month}
              </h2>
              <div className="space-y-2">
                {list.map((w) => {
                  const date = new Date(w.started_at + 'Z');
                  const isActive = !w.ended_at;
                  return (
                    <Link
                      key={w.id}
                      to={`/workout/${w.id}`}
                      className="block bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg p-4 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {date.toLocaleDateString(undefined, {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                            {isActive && (
                              <span className="text-xs bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mt-0.5">
                            {date.toLocaleTimeString(undefined, {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                            {w.notes && ` · ${w.notes}`}
                          </p>
                        </div>
                        <p className="text-sm text-gray-400">
                          {w.set_count} {w.set_count === 1 ? 'set' : 'sets'}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}