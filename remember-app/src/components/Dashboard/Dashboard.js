import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  subscribeToDeadlines, 
  groupByCategory, 
  CATEGORIES 
} from '../../services/deadlineService';
import DeadlineCard from '../Deadlines/DeadlineCard';
import { FiPlus, FiInbox } from 'react-icons/fi';

export default function Dashboard() {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToDeadlines(currentUser.uid, (data) => {
      setDeadlines(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const groupedDeadlines = groupByCategory(deadlines);

  // Conta le scadenze urgenti
  const urgentCount = deadlines.filter(d => {
    const days = getDaysRemaining(d.expirationDate);
    return days <= 7;
  }).length;

  const expiredCount = deadlines.filter(d => {
    const days = getDaysRemaining(d.expirationDate);
    return days < 0;
  }).length;

  function getDaysRemaining(expirationDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = expirationDate.toDate ? expirationDate.toDate() : new Date(expirationDate);
    expDate.setHours(0, 0, 0, 0);
    return Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner large"></div>
        <p>Caricamento scadenze...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header Stats */}
      <div className="dashboard-header">
        <div className="stats-container">
          <div className="stat-card">
            <span className="stat-number">{deadlines.length}</span>
            <span className="stat-label">Totale Scadenze</span>
          </div>
          {expiredCount > 0 && (
            <div className="stat-card stat-expired">
              <span className="stat-number">{expiredCount}</span>
              <span className="stat-label">⚠️ Scadute!</span>
            </div>
          )}
          {urgentCount > 0 && (
            <div className="stat-card stat-urgent">
              <span className="stat-number">{urgentCount}</span>
              <span className="stat-label">Urgenti (&lt;7gg)</span>
            </div>
          )}
        </div>
      </div>

      {/* Empty State */}
      {deadlines.length === 0 ? (
        <div className="empty-state">
          <FiInbox className="empty-icon" />
          <h2>Nessuna scadenza</h2>
          <p>Inizia ad aggiungere le tue scadenze per non dimenticare più nulla!</p>
          <Link to="/new" className="btn-primary">
            <FiPlus /> Aggiungi la prima scadenza
          </Link>
        </div>
      ) : (
        /* Categories */
        <div className="categories-container">
          {Object.entries(CATEGORIES).map(([key, category]) => {
            const categoryDeadlines = groupedDeadlines[category.id] || [];
            
            if (categoryDeadlines.length === 0) return null;

            return (
              <div key={key} className="category-section">
                <h2 className="category-title">
                  <span className="category-icon">{category.icon}</span>
                  {category.name}
                  <span className="category-count">{categoryDeadlines.length}</span>
                </h2>
                <div className="deadlines-grid">
                  {categoryDeadlines.map(deadline => (
                    <DeadlineCard key={deadline.id} deadline={deadline} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
