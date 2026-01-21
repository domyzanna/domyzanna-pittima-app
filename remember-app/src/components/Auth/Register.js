import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiUserPlus, FiCheckCircle } from 'react-icons/fi';

export default function Register() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { signup, logout } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!displayName || !email || !password || !confirmPassword) {
      toast.error('Compila tutti i campi');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Le password non coincidono');
      return;
    }

    if (password.length < 6) {
      toast.error('La password deve avere almeno 6 caratteri');
      return;
    }

    try {
      setLoading(true);
      await signup(email, password, displayName);
      await logout(); // Disconnetti l'utente per forzare la verifica
      setIsSubmitted(true);
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email già registrata');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Email non valida');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password troppo debole');
      } else {
        toast.error('Errore durante la registrazione');
      }
    } finally {
      setLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <FiCheckCircle style={{ fontSize: '3rem', color: 'var(--urgency-green)', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Registrazione completata!</h2>
          <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>
            Controlla la tua casella di posta per il link di verifica, poi potrai accedere.
          </p>
          <Link to="/login" className="btn-primary" style={{ width: 'auto' }}>
            Torna al Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-logo">REMEMBER</h1>
          <p className="auth-subtitle">Crea il tuo account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <FiUser className="input-icon" />
            <input
              type="text"
              placeholder="Nome"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <FiMail className="input-icon" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <FiLock className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <FiLock className="input-icon" />
            <input
              type="password"
              placeholder="Conferma Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                <FiUserPlus /> Registrati
              </>
            )}
          </button>
        </form>

        <p className="auth-footer">
          Hai già un account? <Link to="/login">Accedi</Link>
        </p>
      </div>
    </div>
  );
}
