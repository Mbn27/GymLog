const BASE_URL = 'http://localhost:3001/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

// Exercises
export const getExerciseStats = (id) => request(`/exercises/${id}/stats`);
export const getExercises = () => request('/exercises');
export const getExercise = (id) => request(`/exercises/${id}`);
export const createExercise = (data) =>
  request('/exercises', { method: 'POST', body: JSON.stringify(data) });
export const deleteExercise = (id) =>
  request(`/exercises/${id}`, { method: 'DELETE' });
export const getExerciseHistory = (id, limit = 10) =>
  request(`/exercises/${id}/history?limit=${limit}`);

// Workouts
export const getWorkouts = () => request('/workouts');
export const getWorkout = (id) => request(`/workouts/${id}`);
export const createWorkout = (data = {}) =>
  request('/workouts', { method: 'POST', body: JSON.stringify(data) });
export const updateWorkout = (id, data) =>
  request(`/workouts/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteWorkout = (id) =>
  request(`/workouts/${id}`, { method: 'DELETE' });
export const addSet = (workoutId, data) =>
  request(`/workouts/${workoutId}/sets`, { method: 'POST', body: JSON.stringify(data) });

// Sets
export const deleteSet = (id) =>
  request(`/sets/${id}`, { method: 'DELETE' });