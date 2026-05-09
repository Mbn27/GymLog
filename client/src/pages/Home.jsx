import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getWorkouts, createWorkout } from '../api';

export default function Home() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
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

  async function handleStartWorkout() {
    try {
      setStarting(true);
      const newWorkout = await createWorkout();
      navigate(`/workout/${newWorkout.id}`);
    } catch (err) {
      setError(err.message);
      setStarting(false);
    }
  }

  // Find an active (unfinished) workout if any
  const activeWorkout = workouts.find((w) => !w.ended_at);
  const recentFinished = workouts.filter((w) => w.ended_at).slice(0, 5);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">GymLog</h1>
        <p className="text-gray-400">Track your sets, reps, and progress.</p>
      </div>

      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-200 rounded-md p-3 mb-4">
          {error}
        </div>
      )}

      {/* Active workout banner OR start button */}
      {activeWorkout ? (
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-5 mb-8">
          <p className="text-sm text-blue-300 mb-1">Workout in progress</p>
          <p className="text-lg mb-3">
            Started {new Date(activeWorkout.started_at + 'Z').toLocaleString()}
            <span className="text-gray-400 text-sm ml-2">
              · {activeWorkout.set_count} {activeWorkout.set_count === 1 ? 'set' : 'sets'}
            </span>
          </p>
          <Link
            to={`/workout/${activeWorkout.id}`}
            className="inline-block bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-md font-medium transition-colors"
          >
            Resume Workout →
          </Link>
        </div>
      ) : (
        <div className="mb-8">
          <button
            onClick={handleStartWorkout}
            disabled={starting}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 disabled:bg-gray-700 px-8 py-4 rounded-lg text-xl font-semibold transition-colors"
          >
            {starting ? 'Starting...' : '+ Start Workout'}
          </button>
        </div>
      )}

      {/* Recent workouts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Recent Workouts</h2>
          {workouts.length > 5 && (
            <Link to="/history" className="text-sm text-blue-400 hover:text-blue-300">
              See all →
            </Link>
          )}
        </div>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : recentFinished.length === 0 ? (
          <p className="text-gray-400">
            {activeWorkout
              ? 'No completed workouts yet.'
              : 'No workouts yet. Hit "Start Workout" to begin.'}
          </p>
        ) : (
          <div className="space-y-2">
            {recentFinished.map((w) => (
              <Link
                key={w.id}
                to={`/workout/${w.id}`}
                className="block bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg p-4 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {new Date(w.started_at + 'Z').toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {new Date(w.started_at + 'Z').toLocaleTimeString(undefined, {
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}