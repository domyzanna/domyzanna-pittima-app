import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">
            Informativa sulla Privacy
          </CardTitle>
          <CardDescription>Ultimo aggiornamento: 28/01/2026</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground">
          
          <section>
            <h3 className="font-semibold text-foreground mb-2">1. Titolare del Trattamento</h3>
            <p>
              Il Titolare del trattamento dei dati è Team Pittima App, con sede operativa 
              presso Via delle Scuole 2, contattabile all'indirizzo email: info@zannalabs.com
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">2. Dati Raccolti</h3>
            <p className="mb-2">
              Raccogliamo esclusivamente i dati strettamente necessari all'erogazione del servizio:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Dati di registrazione:</strong> Indirizzo email e nome forniti 
                volontariamente dall'utente in fase di registrazione.
              </li>
              <li>
                <strong>Dati inseriti dall'utente:</strong> Scadenze, date, descrizioni, 
                targhe veicoli, numeri di polizza e qualsiasi altra informazione che 
                l'utente sceglie liberamente di inserire nell'applicazione.
              </li>
              <li>
                <strong>Dati tecnici:</strong> Indirizzo IP, tipo di browser, sistema 
                operativo, timestamp di accesso, raccolti automaticamente per finalità 
                di sicurezza e funzionamento del servizio.
              </li>
              <li>
                <strong>Dati di pagamento:</strong> Le transazioni sono gestite 
                interamente da Stripe Inc. Non memorizziamo né abbiamo accesso ai 
                dati delle carte di credito.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">3. Finalità e Base Giuridica del Trattamento</h3>
            <p className="mb-2">I dati sono trattati per le seguenti finalità:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Esecuzione del contratto (Art. 6.1.b GDPR):</strong> Erogazione 
                del servizio di gestione scadenze, invio notifiche e promemoria.
              </li>
              <li>
                <strong>Obblighi legali (Art. 6.1.c GDPR):</strong> Adempimento di 
                obblighi fiscali e contabili.
              </li>
              <li>
                <strong>Legittimo interesse (Art. 6.1.f GDPR):</strong> Prevenzione 
                frodi, sicurezza del sistema, miglioramento del servizio.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">4. Utilizzo dell'Intelligenza Artificiale</h3>
            <p className="mb-2">
              L'applicazione può utilizzare modelli di intelligenza artificiale per 
              generare riepiloghi e suggerimenti. L'utente riconosce e accetta che:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                I contenuti generati dall'IA sono forniti "così come sono" (as-is) 
                e potrebbero contenere errori, imprecisioni, omissioni o informazioni 
                non aggiornate.
              </li>
              <li>
                L'IA non sostituisce in alcun modo il giudizio umano. L'utente è 
                l'unico responsabile della verifica e dell'utilizzo delle informazioni.
              </li>
              <li>
                Nessuna decisione critica deve basarsi esclusivamente sui suggerimenti 
                dell'IA senza verifica indipendente.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">5. Conservazione dei Dati</h3>
            <p>
              I dati personali sono conservati per il tempo necessario all'erogazione 
              del servizio e, successivamente alla cancellazione dell'account, per un 
              periodo massimo di 30 giorni per finalità di backup e ripristino. I dati 
              relativi alle transazioni sono conservati per 10 anni come richiesto 
              dalla normativa fiscale italiana.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">6. Condivisione dei Dati</h3>
            <p className="mb-2">I dati possono essere condivisi con:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Firebase/Google Cloud Platform:</strong> Per hosting, 
                autenticazione e database (server UE).
              </li>
              <li>
                <strong>Stripe Inc.:</strong> Per l'elaborazione dei pagamenti.
              </li>
              <li>
                <strong>Resend:</strong> Per l'invio di email transazionali.
              </li>
              <li>
                <strong>Autorità competenti:</strong> Quando richiesto per legge.
              </li>
            </ul>
            <p className="mt-2">
              Non vendiamo, affittiamo o cediamo a terzi i dati personali degli utenti 
              per finalità di marketing.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">7. Trasferimento Dati Extra-UE</h3>
            <p>
              Alcuni fornitori di servizi (es. Stripe) potrebbero trasferire dati al 
              di fuori dello Spazio Economico Europeo. Tali trasferimenti avvengono 
              sulla base di Clausole Contrattuali Standard approvate dalla Commissione 
              Europea o altre garanzie adeguate ai sensi del GDPR.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">8. Diritti dell'Utente</h3>
            <p className="mb-2">
              Ai sensi degli articoli 15-22 del GDPR, l'utente ha diritto di:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Accedere ai propri dati personali</li>
              <li>Richiedere la rettifica di dati inesatti</li>
              <li>Richiedere la cancellazione dei dati ("diritto all'oblio")</li>
              <li>Limitare il trattamento</li>
              <li>Ottenere la portabilità dei dati</li>
              <li>Opporsi al trattamento</li>
              <li>Revocare il consenso in qualsiasi momento</li>
              <li>Proporre reclamo al Garante per la Protezione dei Dati Personali</li>
            </ul>
            <p className="mt-2">
              Per esercitare tali diritti, contattare: privacy@zannalabs.com
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">9. Limitazione di Responsabilità</h3>
            <p>
              Pittima App è uno strumento di supporto alla gestione delle scadenze. 
              L'utente riconosce espressamente che:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>Nessuna garanzia di funzionamento ininterrotto:</strong> Il 
                servizio è fornito "così com'è" (as-is) e "come disponibile" 
                (as-available), senza garanzie di alcun tipo, espresse o implicite.
              </li>
              <li>
                <strong>Esclusione di responsabilità per danni:</strong> In nessun 
                caso il Titolare, i suoi collaboratori, fornitori o licenzianti 
                saranno responsabili per danni diretti, indiretti, incidentali, 
                speciali, consequenziali o punitivi, inclusi, a titolo esemplificativo: 
                perdita di profitti, dati, opportunità commerciali, mancato rispetto 
                di scadenze, sanzioni, interessi di mora, decadenze da diritti o 
                benefici, o qualsiasi altro danno derivante dall'uso o 
                dall'impossibilità di utilizzare il servizio.
              </li>
              <li>
                <strong>Responsabilità dell'utente:</strong> L'utente è l'unico 
                responsabile della corretta immissione dei dati, della verifica 
                delle scadenze e dell'adempimento tempestivo dei propri obblighi. 
                Le notifiche inviate dall'applicazione hanno carattere meramente 
                informativo e non costituiscono consulenza professionale di alcun tipo.
              </li>
              <li>
                <strong>Manleva:</strong> L'utente si impegna a manlevare e tenere 
                indenne il Titolare da qualsiasi richiesta, danno, costo o spesa 
                (incluse le spese legali) derivanti dall'utilizzo del servizio o 
                dalla violazione dei presenti termini.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">10. Sicurezza</h3>
            <p>
              Adottiamo misure tecniche e organizzative appropriate per proteggere 
              i dati personali, tra cui: crittografia dei dati in transito (TLS/SSL), 
              accesso limitato ai dati, backup regolari e monitoraggio delle attività 
              sospette. Tuttavia, nessun sistema è completamente sicuro e non possiamo 
              garantire la sicurezza assoluta dei dati trasmessi.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">11. Modifiche all'Informativa</h3>
            <p>
              Ci riserviamo il diritto di modificare questa informativa in qualsiasi 
              momento. Le modifiche sostanziali saranno comunicate via email o tramite 
              avviso nell'applicazione. L'uso continuato del servizio dopo la 
              pubblicazione delle modifiche costituisce accettazione delle stesse.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">12. Legge Applicabile e Foro Competente</h3>
            <p>
              La presente informativa è regolata dalla legge italiana. Per qualsiasi 
              controversia sarà competente in via esclusiva il Foro di Roma, 
              fatta salva la competenza inderogabile del foro del consumatore ai 
              sensi del D.Lgs. 206/2005.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">13. Contatti</h3>
            <p>
              Per qualsiasi domanda relativa al trattamento dei dati personali:<br />
              Email: privacy@zannalabs.com<br />
              PEC: [SE DISPONIBILE]
            </p>
          </section>

          <div className="pt-6 text-center border-t">
            <Link href="/landing" className="text-sm text-primary hover:underline">
              Torna alla Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
