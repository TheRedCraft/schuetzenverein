import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

function Dashboard({ onLogout }) {
  const [performances, setPerformances] = useState([]);
  const [error, setError] = useState('');
  const [isLinked, setIsLinked] = useState(false);

  useEffect(() => {
    checkLinkStatus();
    if (isLinked) {
      fetchPerformances();
    }
  }, [isLinked]);

  const checkLinkStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/user/status', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setIsLinked(response.data.isLinked);
    } catch (error) {
      setError('Failed to check user status');
    }
  };

  const fetchPerformances = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/performance', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPerformances(response.data);
    } catch (error) {
      setError('Failed to fetch performance data');
    }
  };

  if (!isLinked) {
    return (
      <div className="dashboard waiting">
        <h2>Welcome to SMemory</h2>
        <p>Your account is currently being verified. Please wait for an admin to link your account.</p>
        <button onClick={onLogout}>Logout</button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h2>Performance Dashboard</h2>
      {error && <p className="error">{error}</p>}
      <h3>Your Performances</h3>
      <ul>
        {performances.map((perf, index) => (
          <li key={index}>{new Date(perf.date).toLocaleDateString()}: {perf.score}</li>
        ))}
      </ul>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;
