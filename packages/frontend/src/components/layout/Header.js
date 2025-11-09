import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', backgroundColor: '#2c3e50', color: '#ecf0f1' }}>
      <div style={{ fontSize: 20, fontWeight: 'bold' }}>BMS Dashboard</div>
      <nav style={{ display: 'flex', gap: 16 }}>
        {user && (
          <>
            <Link to="/dashboard" style={{ color: '#ecf0f1', textDecoration: 'none' }}>Dashboard</Link>
            {user.role === 'moderator' && <Link to="/moderator" style={{ color: '#ecf0f1', textDecoration: 'none' }}>Moderator</Link>}
            {user.role === 'admin' && <Link to="/admin" style={{ color: '#ecf0f1', textDecoration: 'none' }}>Admin</Link>}
            <button onClick={logout} style={{ marginLeft: 16, background: 'none', border: '1px solid #ecf0f1', color: '#ecf0f1', padding: '4px 8px', cursor: 'pointer' }}>Log out</button>
          </>
        )}
        {!user && <Link to="/" style={{ color: '#ecf0f1', textDecoration: 'none' }}>Login</Link>}
      </nav>
    </header>
  );
};

export default Header;