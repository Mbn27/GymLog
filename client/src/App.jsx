import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Exercises from './pages/Exercises';
import Workout from './pages/Workout';
import History from './pages/History';

function NavBar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `px-4 py-2 rounded-md transition-colors ${
      isActive(path)
        ? 'bg-blue-600 text-white'
        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`;

  return (
    <nav className="bg-gray-950 border-b border-gray-800 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-blue-400">
          GymLog
        </Link>
        <div className="flex gap-2">
          <Link to="/" className={linkClass('/')}>Home</Link>
          <Link to="/exercises" className={linkClass('/exercises')}>Exercises</Link>
          <Link to="/history" className={linkClass('/history')}>History</Link>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <NavBar />
      <main className="max-w-4xl mx-auto p-4 sm:p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/workout/:id" element={<Workout />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;