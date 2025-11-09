import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchUsers, createUser } from '../services/api';

/**
 * AdminPanel allows administrators to view and create users.  It lists existing
 * users and provides a simple form to create new ones with a role.
 */
const AdminPanel = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', password: '', role: 'user' });
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchUsers(user?.token);
        setUsers(data);
      } catch (err) {
        setError(err.message);
      }
    };
    if (user) load();
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const created = await createUser(form, user?.token);
      setUsers((prev) => [...prev, created]);
      setForm({ username: '', password: '', role: 'user' });
      setMessage('User created successfully');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Admin Panel</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {message && <div style={{ color: 'green' }}>{message}</div>}
      <h3>Users</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>Username</th>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{u.username}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Create User</h3>
      <form onSubmit={handleCreate}>
        <div style={{ marginBottom: 8 }}>
          <label>Username</label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Role</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            style={{ width: '100%', padding: 8 }}
          >
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>Create</button>
      </form>
    </div>
  );
};

export default AdminPanel;