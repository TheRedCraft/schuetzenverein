import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPanel.css';

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [sqlUsers, setSqlUsers] = useState([]);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchSqlUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(response.data);
    } catch (error) {
      setError('Failed to fetch users');
    }
  };

  const fetchSqlUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/sql-users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSqlUsers(response.data);
    } catch (error) {
      setError('Failed to fetch SQL users');
    }
  };

  const linkUser = async (userId, sqlUsername) => {
    try {
      await axios.post('http://localhost:5000/api/admin/link-user', 
        { userId, sqlUsername },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      fetchUsers();
    } catch (error) {
      setError('Failed to link user');
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        fetchUsers();
      } catch (error) {
        setError('Failed to delete user');
      }
    }
  };

  const startEditing = (user) => {
    setEditingUser({ ...user });
  };

  const cancelEditing = () => {
    setEditingUser(null);
  };

  const saveEdit = async () => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${editingUser._id}`, 
        editingUser,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      fetchUsers();
      setEditingUser(null);
    } catch (error) {
      setError('Failed to update user');
    }
  };

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>
      {error && <p className="error">{error}</p>}
      <h3>Users</h3>
      <ul>
        {users.map(user => (
          <li key={user._id}>
            {editingUser && editingUser._id === user._id ? (
              <>
                <input 
                  value={editingUser.username} 
                  onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                />
                <select 
                  value={editingUser.sqlUsername || ''} 
                  onChange={(e) => setEditingUser({...editingUser, sqlUsername: e.target.value, isLinked: !!e.target.value})}
                >
                  <option value="">Not linked</option>
                  {sqlUsers.map(sqlUser => (
                    <option key={sqlUser.id} value={sqlUser.username}>{sqlUser.username}</option>
                  ))}
                </select>
                <button onClick={saveEdit}>Save</button>
                <button onClick={cancelEditing}>Cancel</button>
              </>
            ) : (
              <>
                {user.username} 
                {user.isLinked ? ` (Linked to ${user.sqlUsername})` : ' (Not linked)'}
                <button onClick={() => startEditing(user)}>Edit</button>
                <button onClick={() => deleteUser(user._id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminPanel;
