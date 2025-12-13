import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { FiLogOut, FiPlus, FiHome } from 'react-icons/fi';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      toast.success('Logout effettuato');
      navigate('/login');
    } catch (error) {
      toast.error('Errore durante il logout');
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">⏰</span>
          <span className="brand-text">REMEMBER</span>
        </Link>

        <div className="navbar-menu">
          <Link to="/" className="nav-link">
            <FiHome /> Dashboard
          </Link>
          <Link to="/new" className="nav-link btn-accent">
            <FiPlus /> Nuova Scadenza
          </Link>
        </div>

        <div className="navbar-user">
          <span className="user-name">
            Ciao, {currentUser?.displayName || 'Utente'}
          </span>
          <button onClick={handleLogout} className="btn-logout">
            <FiLogOut /> Esci
          </button>
        </div>
      </div>
    </nav>
  );
}
