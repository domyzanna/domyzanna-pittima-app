import React, { useState } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { 
  getDaysRemaining, 
  getUrgencyColor,
  calculateNextDate,
  renewDeadline,
  completeDeadline,
  deleteDeadline,
  RECURRENCE_OPTIONS
} from '../../services/deadlineService';
import toast from 'react-hot-toast';
import { FiCheck, FiRefreshCw, FiTrash2, FiEdit, FiX } from 'react-icons/fi';

export default function DeadlineCard({ deadline }) {
  const [showActions, setShowActions] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [loading, setLoading] = useState(false);

  const expirationDate = deadline.expirationDate.toDate 
    ? deadline.expirationDate.toDate() 
    : new Date(deadline.expirationDate);
  
  const daysRemaining = getDaysRemaining(expirationDate);
  const urgencyColor = getUrgencyColor(daysRemaining);

  // Formatta il countdown
  function formatCountdown(days) {
    if (days < 0) return `${Math.abs(days)}g`;
    return `${days}g`;
  }

  // Label per il countdown
  function getCountdownLabel(days) {
    if (days < 0) return 'SCADUTO!';
    if (days === 0) return 'OGGI!';
    if (days === 1) return 'DOMANI!';
    return 'Mancano';
  }

  // Ottieni il titolo della scadenza in base alla categoria
  function getTitle() {
    switch (deadline.category) {
      case 'veicoli':
        return `${deadline.tipoScadenza} - ${deadline.nomeVeicolo}`;
      case 'assicurazioni':
        return deadline.nomePolizza;
      case 'documenti':
        return `${deadline.tipoDocumento} - ${deadline.intestatario}`;
      default:
        return deadline.nome || 'Scadenza';
    }
  }

  // Sottotitolo con dettagli aggiuntivi
  function getSubtitle() {
    switch (deadline.category) {
      case 'veicoli':
        return deadline.targa;
      case 'assicurazioni':
        return `${deadline.tipoPolizza}${deadline.compagnia ? ` - ${deadline.compagnia}` : ''}`;
      case 'documenti':
        return '';
      default:
        return deadline.categoriaCustom || '';
    }
  }

  // Gestione rinnovo
  async function handleRenew() {
    const nextDate = calculateNextDate(expirationDate, deadline.recurrence);
    if (nextDate) {
      setNewDate(format(nextDate, 'yyyy-MM-dd'));
    } else {
      setNewDate(format(new Date(), 'yyyy-MM-dd'));
    }
    setShowRenewModal(true);
  }

  async function confirmRenew() {
    if (!newDate) {
      toast.error('Inserisci una data valida');
      return;
    }

    try {
      setLoading(true);
      await renewDeadline(deadline.id, newDate);
      toast.success('Scadenza aggiornata!');
      setShowRenewModal(false);
    } catch (error) {
      toast.error('Errore nell\'aggiornamento');
    } finally {
      setLoading(false);
    }
  }

  // Gestione completamento
  async function handleComplete() {
    if (!window.confirm('Sei sicuro di voler archiviare questa scadenza? Non riceverai più notifiche.')) {
      return;
    }

    try {
      setLoading(true);
      await completeDeadline(deadline.id);
      toast.success('Scadenza archiviata');
    } catch (error) {
      toast.error('Errore nell\'archiviazione');
    } finally {
      setLoading(false);
    }
  }

  // Gestione eliminazione
  async function handleDelete() {
    if (!window.confirm('Sei sicuro di voler eliminare questa scadenza?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteDeadline(deadline.id);
      toast.success('Scadenza eliminata');
    } catch (error) {
      toast.error('Errore nell\'eliminazione');
    } finally {
      setLoading(false);
    }
  }

  const recurrenceLabel = RECURRENCE_OPTIONS.find(r => r.value === deadline.recurrence)?.label || '';

  return (
    <>
      <div 
        className={`deadline-card urgency-${urgencyColor}`}
        onClick={() => setShowActions(!showActions)}
      >
        {/* Semaforo e Countdown */}
        <div className="deadline-urgency">
          <div className={`urgency-indicator ${urgencyColor}`}></div>
          <div className="countdown">
            <span className="countdown-label">{getCountdownLabel(daysRemaining)}</span>
            <span className="countdown-number">
              {daysRemaining < 0 && '-'}{formatCountdown(daysRemaining)}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="deadline-info">
          <h3 className="deadline-title">{getTitle()}</h3>
          {getSubtitle() && <p className="deadline-subtitle">{getSubtitle()}</p>}
          <p className="deadline-date">
            📅 {format(expirationDate, 'd MMMM yyyy', { locale: it })}
          </p>
          {recurrenceLabel && (
            <span className="deadline-recurrence">{recurrenceLabel}</span>
          )}
        </div>

        {/* Actions (visibili al click) */}
        {showActions && (
          <div className="deadline-actions">
            <button 
              className="btn-action btn-renew"
              onClick={(e) => { e.stopPropagation(); handleRenew(); }}
              disabled={loading}
              title="Aggiornata"
            >
              <FiRefreshCw /> Aggiornata
            </button>
            <button 
              className="btn-action btn-complete"
              onClick={(e) => { e.stopPropagation(); handleComplete(); }}
              disabled={loading}
              title="Completata"
            >
              <FiCheck /> Terminata
            </button>
            <button 
              className="btn-action btn-delete"
              onClick={(e) => { e.stopPropagation(); handleDelete(); }}
              disabled={loading}
              title="Elimina"
            >
              <FiTrash2 />
            </button>
          </div>
        )}
      </div>

      {/* Modal Rinnovo */}
      {showRenewModal && (
        <div className="modal-overlay" onClick={() => setShowRenewModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Aggiorna Scadenza</h3>
              <button className="modal-close" onClick={() => setShowRenewModal(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <p>Inserisci la nuova data di scadenza:</p>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="input-date"
              />
              {deadline.recurrence !== 'once' && (
                <p className="modal-hint">
                  💡 Data suggerita basata sulla ricorrenza {recurrenceLabel.toLowerCase()}
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setShowRenewModal(false)}
              >
                Annulla
              </button>
              <button 
                className="btn-primary" 
                onClick={confirmRenew}
                disabled={loading}
              >
                {loading ? 'Salvataggio...' : 'Conferma'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
