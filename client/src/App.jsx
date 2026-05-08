import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch('http://localhost:3001/api/hello')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => setMessage('Error: ' + err.message));
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-5xl font-bold mb-4 text-blue-400">GymLog</h1>
      <p className="text-xl text-gray-300 mb-8">Workout tracker</p>
      <div className="bg-gray-800 px-6 py-4 rounded-lg border border-gray-700">
        <p className="text-sm text-gray-400 mb-1">Backend says:</p>
        <p className="text-lg font-mono text-green-400">{message}</p>
      </div>
    </div>
  );
}

export default App;