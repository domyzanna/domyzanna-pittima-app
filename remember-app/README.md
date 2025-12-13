# REMEMBER APP

App per la gestione delle scadenze con sistema di notifiche persistenti.

**Non dimenticherai mai più una scadenza!**

---

## 🚀 Quick Start

### 1. Installa le dipendenze

```bash
cd remember-app
npm install
```

### 2. Configura Firebase

1. Vai su [Firebase Console](https://console.firebase.google.com)
2. Crea un nuovo progetto (o usa uno esistente)
3. Vai su **Impostazioni progetto** → **Le tue app** → **Web** (</>)
4. Registra l'app e copia le credenziali

5. Copia il file `.env.example` in `.env`:
```bash
cp .env.example .env
```

6. Inserisci le tue credenziali Firebase nel file `.env`:
```
REACT_APP_FIREBASE_API_KEY=AIza...
REACT_APP_FIREBASE_AUTH_DOMAIN=tuo-progetto.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=tuo-progetto
REACT_APP_FIREBASE_STORAGE_BUCKET=tuo-progetto.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 3. Configura Firestore

1. Nella console Firebase, vai su **Firestore Database**
2. Clicca **Crea database**
3. Scegli **Avvia in modalità test** (per lo sviluppo)
4. Seleziona la region più vicina (es: `europe-west1`)

### 4. Abilita l'autenticazione

1. Vai su **Authentication** → **Sign-in method**
2. Abilita **Email/Password**

### 5. Avvia l'app

```bash
npm start
```

L'app sarà disponibile su `http://localhost:3000`

---

## 📁 Struttura Progetto

```
remember-app/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── Login.js
│   │   │   └── Register.js
│   │   ├── Dashboard/
│   │   │   └── Dashboard.js
│   │   ├── Deadlines/
│   │   │   ├── DeadlineCard.js
│   │   │   └── DeadlineForm.js
│   │   └── Layout/
│   │       └── Navbar.js
│   ├── config/
│   │   └── firebase.js
│   ├── contexts/
│   │   └── AuthContext.js
│   ├── services/
│   │   └── deadlineService.js
│   ├── styles/
│   │   └── App.css
│   ├── App.js
│   └── index.js
├── .env.example
├── package.json
└── README.md
```

---

## ✅ Funzionalità Step 1 (Completate)

- [x] Autenticazione (Login/Registrazione)
- [x] Dashboard con visualizzazione scadenze
- [x] Sistema semaforo (🟢 🟡 🔴 ⚫) + countdown
- [x] Creazione scadenze con form completo
- [x] Categorie: Veicoli, Assicurazioni, Documenti, Personalizzata
- [x] Ricorrenze: Una tantum, Mensile, Trimestrale, Semestrale, Annuale
- [x] Azione "Aggiornata" con nuova data
- [x] Azione "Terminata" per archiviare
- [x] Design responsive

---

## 🔜 Prossimi Step

### Step 2: Sistema Notifiche Push
- Cloud Functions per scheduling
- Firebase Cloud Messaging
- Notifiche push nel browser

### Step 3: Email Mensile
- Riepilogo mensile via email
- Template email personalizzato
- Integrazione con servizio email (SendGrid/Mailgun)

---

## 🎨 Sistema Semaforo

| Colore | Condizione | Significato |
|--------|------------|-------------|
| 🟢 Verde | > 30 giorni | Tutto OK |
| 🟡 Giallo | 7-30 giorni | Attenzione |
| 🔴 Rosso | < 7 giorni | Urgente! |
| ⚫ Viola | Scaduto | AZIONE RICHIESTA |

---

## 🔒 Regole Firestore (Consigliate per produzione)

Vai su **Firestore** → **Regole** e sostituisci con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Gli utenti possono leggere/scrivere solo i propri dati
    match /deadlines/{deadlineId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

---

## 📱 Deploy su Firebase Hosting

```bash
# Installa Firebase CLI (se non l'hai già)
npm install -g firebase-tools

# Login
firebase login

# Inizializza (scegli Hosting)
firebase init

# Build dell'app
npm run build

# Deploy
firebase deploy
```

---

## 🛠 Tecnologie

- **React 18** - Frontend
- **Firebase Auth** - Autenticazione
- **Cloud Firestore** - Database
- **React Router** - Routing
- **date-fns** - Gestione date
- **react-hot-toast** - Notifiche UI
- **react-icons** - Icone

---

## 📄 Licenza

Progetto privato - REMEMBER APP
