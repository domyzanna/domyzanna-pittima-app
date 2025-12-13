import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  createDeadline, 
  CATEGORIES, 
  RECURRENCE_OPTIONS,
  NOTIFICATION_INTENSITY 
} from '../../services/deadlineService';
import toast from 'react-hot-toast';
import { FiSave, FiArrowLeft } from 'react-icons/fi';

export default function DeadlineForm() {
  const [category, setCategory] = useState('');
  const [formData, setFormData] = useState({});
  const [expirationDate, setExpirationDate] = useState('');
  const [recurrence, setRecurrence] = useState('annual');
  const [notifyDaysBefore, setNotifyDaysBefore] = useState(30);
  const [notificationIntensity, setNotificationIntensity] = useState('medium');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const selectedCategory = category ? CATEGORIES[category.toUpperCase()] : null;

  function handleFieldChange(fieldName, value) {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!category) {
      toast.error('Seleziona una categoria');
      return;
    }

    if (!expirationDate) {
      toast.error('Inserisci la data di scadenza');
      return;
    }

    // Verifica campi obbligatori
    if (selectedCategory) {
      for (const field of selectedCategory.fields) {
        if (field.required && !formData[field.name]) {
          toast.error(`Il campo "${field.label}" è obbligatorio`);
          return;
        }
      }
    }

    try {
      setLoading(true);
      
      const deadlineData = {
        category: selectedCategory.id,
        ...formData,
        expirationDate,
        recurrence,
        notifyDaysBefore: parseInt(notifyDaysBefore),
        notificationIntensity,
        notes
      };

      await createDeadline(currentUser.uid, deadlineData);
      toast.success('Scadenza creata con successo!');
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error('Errore nella creazione della scadenza');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <button className="btn-back" onClick={() => navigate('/')}>
          <FiArrowLeft /> Indietro
        </button>
        <h1>Nuova Scadenza</h1>
      </div>

      <form onSubmit={handleSubmit} className="deadline-form">
        {/* Selezione Categoria */}
        <div className="form-section">
          <h2>1. Scegli la categoria</h2>
          <div className="category-selector">
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <button
                key={key}
                type="button"
                className={`category-btn ${category === key ? 'active' : ''}`}
                onClick={() => {
                  setCategory(key);
                  setFormData({});
                }}
              >
                <span className="category-btn-icon">{cat.icon}</span>
                <span className="category-btn-name">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Campi dinamici in base alla categoria */}
        {selectedCategory && (
          <div className="form-section">
            <h2>2. Dettagli {selectedCategory.name}</h2>
            <div className="form-fields">
              {selectedCategory.fields.map((field) => (
                <div key={field.name} className="form-group">
                  <label>
                    {field.label}
                    {field.required && <span className="required">*</span>}
                  </label>
                  
                  {field.type === 'select' ? (
                    <select
                      value={formData[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      required={field.required}
                    >
                      <option value="">Seleziona...</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      required={field.required}
                      placeholder={`Inserisci ${field.label.toLowerCase()}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data e Ricorrenza */}
        {category && (
          <div className="form-section">
            <h2>3. Data e Ricorrenza</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Data Scadenza <span className="required">*</span></label>
                <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Ricorrenza</label>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value)}
                >
                  {RECURRENCE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Impostazioni Notifiche */}
        {category && (
          <div className="form-section">
            <h2>4. Impostazioni Notifiche</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Avvisami X giorni prima</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={notifyDaysBefore}
                  onChange={(e) => setNotifyDaysBefore(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Intensità notifiche</label>
                <select
                  value={notificationIntensity}
                  onChange={(e) => setNotificationIntensity(e.target.value)}
                >
                  {NOTIFICATION_INTENSITY.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} - {opt.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Note */}
        {category && (
          <div className="form-section">
            <h2>5. Note (opzionale)</h2>
            <div className="form-group">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Aggiungi note o dettagli aggiuntivi..."
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Submit */}
        {category && (
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => navigate('/')}
            >
              Annulla
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  <FiSave /> Salva Scadenza
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
