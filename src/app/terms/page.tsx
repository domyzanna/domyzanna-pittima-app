import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">
            Termini e Condizioni di Servizio
          </CardTitle>
          <CardDescription>Ultimo aggiornamento: 26/02/2026</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground">

          <section>
            <h3 className="font-semibold text-foreground mb-2">1. Accettazione dei Termini</h3>
            <p>
              Utilizzando l'applicazione Pittima App ("Servizio"), l'utente dichiara 
              di aver letto, compreso e accettato integralmente i presenti Termini e 
              Condizioni di Servizio ("Termini"). L'utilizzo del Servizio è subordinato 
              all'accettazione incondizionata dei presenti Termini. Se l'utente non 
              accetta i Termini, è tenuto a cessare immediatamente l'utilizzo del Servizio 
              e a cancellare il proprio account.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">2. Descrizione del Servizio</h3>
            <p>
              Pittima App è un'applicazione di supporto alla gestione e al monitoraggio 
              di scadenze personali. Il Servizio consente all'utente di inserire, 
              organizzare e ricevere promemoria relativi a scadenze di varia natura. 
              Il Servizio ha natura meramente informativa e di supporto organizzativo, 
              e non costituisce in alcun modo consulenza legale, fiscale, assicurativa, 
              finanziaria o professionale di alcun tipo.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">3. Requisiti per l'Utilizzo</h3>
            <p>Per utilizzare il Servizio, l'utente dichiara e garantisce di:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Avere almeno 18 anni di età o la maggiore età prevista dalla giurisdizione di appartenenza.</li>
              <li>Avere la capacità giuridica di stipulare contratti vincolanti.</li>
              <li>Fornire informazioni veritiere, accurate e complete in fase di registrazione.</li>
              <li>Mantenere la riservatezza delle proprie credenziali di accesso.</li>
              <li>Essere l'unico responsabile di tutte le attività svolte tramite il proprio account.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">4. Account e Sicurezza</h3>
            <p>
              L'utente è responsabile della salvaguardia della password e di qualsiasi 
              altra credenziale utilizzata per accedere al Servizio. L'utente accetta 
              di notificare immediatamente qualsiasi uso non autorizzato del proprio 
              account. Il Fornitore non sarà responsabile per eventuali perdite o danni 
              derivanti dalla mancata osservanza di tali obblighi di sicurezza da parte 
              dell'utente.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">5. Piani e Pagamenti</h3>
            <p className="mb-2">Il Servizio è offerto nei seguenti piani:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Piano Gratuito:</strong> Accesso limitato a un massimo di 6 
                promemoria attivi contemporaneamente.
              </li>
              <li>
                <strong>Piano Pro:</strong> Fino a 60 scadenze attive 
                al costo di €12,00 (dodici/00) all'anno, con rinnovo automatico.
              </li>
            </ul>
            <p className="mt-3 mb-2">
              <strong>Limiti di servizio per il Piano Pro:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Massimo 60 scadenze attive.</li>
              <li>Notifiche email: fino a 2.000 all'anno.</li>
              <li>Notifiche WhatsApp: fino a 120 all'anno (massimo 2 per scadenza: il giorno prima e il giorno stesso).</li>
              <li>Preavviso notifiche: massimo 30 giorni prima della scadenza.</li>
              <li>Notifiche push: illimitate.</li>
            </ul>
            <p className="mt-3 mb-2">
              <strong>Limiti di servizio per il Piano Gratuito:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Massimo 6 scadenze attive.</li>
              <li>Notifiche email e push incluse.</li>
              <li>Notifiche WhatsApp non disponibili.</li>
            </ul>
            <p className="mt-3">
              I pagamenti sono elaborati tramite Stripe Inc. L'utente accetta i termini 
              di servizio di Stripe disponibili su stripe.com/legal. Il Fornitore non 
              memorizza dati delle carte di credito. L'abbonamento si rinnova 
              automaticamente salvo disdetta effettuata almeno 24 ore prima della 
              scadenza del periodo in corso. I pagamenti effettuati non sono rimborsabili, 
              salvo quanto previsto dalla legge applicabile.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">6. Natura del Servizio e Limitazioni</h3>
            <p>L'utente riconosce espressamente e accetta che:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                Il Servizio è uno <strong>strumento di supporto</strong> e non sostituisce 
                la diligenza personale dell'utente nella gestione delle proprie scadenze.
              </li>
              <li>
                Le notifiche e i promemoria hanno carattere <strong>meramente informativo</strong> 
                e non costituiscono garanzia di ricezione, lettura o azione da parte dell'utente.
              </li>
              <li>
                L'utente rimane <strong>l'unico responsabile</strong> dell'adempimento 
                tempestivo dei propri obblighi, indipendentemente dal funzionamento del Servizio.
              </li>
              <li>
                Il mancato invio, la mancata ricezione o il ritardo di una notifica 
                <strong> non costituisce inadempimento</strong> da parte del Fornitore.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">7. Funzionalità di Intelligenza Artificiale</h3>
            <p>
              Il Servizio può utilizzare modelli di intelligenza artificiale (AI) per 
              generare riepiloghi, suggerimenti e altre funzionalità. L'utente riconosce 
              e accetta che:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                I contenuti generati dall'AI sono forniti "così come sono" (as-is) e 
                possono contenere errori, imprecisioni, omissioni o informazioni obsolete.
              </li>
              <li>
                L'AI non è infallibile e i suoi output non devono essere considerati 
                come fonte autorevole o definitiva.
              </li>
              <li>
                È responsabilità esclusiva dell'utente verificare l'accuratezza delle 
                informazioni prima di intraprendere qualsiasi azione.
              </li>
              <li>
                Il Fornitore declina ogni responsabilità per decisioni, azioni o omissioni 
                dell'utente basate sui contenuti generati dall'AI.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">8. Esclusione di Garanzie</h3>
            <p>
              IL SERVIZIO È FORNITO "COSÌ COM'È" (AS-IS) E "COME DISPONIBILE" (AS-AVAILABLE), 
              SENZA GARANZIE DI ALCUN TIPO, ESPRESSE O IMPLICITE. IL FORNITORE ESCLUDE 
              ESPRESSAMENTE, NELLA MISURA MASSIMA CONSENTITA DALLA LEGGE APPLICABILE, 
              QUALSIASI GARANZIA DI COMMERCIABILITÀ, IDONEITÀ PER UNO SCOPO PARTICOLARE, 
              NON VIOLAZIONE DI DIRITTI DI TERZI, ACCURATEZZA, COMPLETEZZA O DISPONIBILITÀ 
              DEL SERVIZIO.
            </p>
            <p className="mt-2">Il Fornitore non garantisce che:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Il Servizio sarà ininterrotto, tempestivo, sicuro o privo di errori.</li>
              <li>I risultati ottenuti dall'uso del Servizio saranno accurati o affidabili.</li>
              <li>Eventuali errori nel Servizio saranno corretti.</li>
              <li>Il Servizio sarà compatibile con tutti i dispositivi o sistemi operativi.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">9. Limitazione di Responsabilità</h3>
            <p>
              NELLA MISURA MASSIMA CONSENTITA DALLA LEGGE APPLICABILE, IN NESSUN CASO 
              IL FORNITORE, I SUOI AMMINISTRATORI, DIPENDENTI, COLLABORATORI, AGENTI, 
              FORNITORI O LICENZIANTI SARANNO RESPONSABILI NEI CONFRONTI DELL'UTENTE 
              O DI TERZI PER:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                Qualsiasi danno diretto, indiretto, incidentale, speciale, consequenziale, 
                punitivo o esemplare.
              </li>
              <li>
                Perdita di profitti, ricavi, dati, avviamento, opportunità commerciali 
                o risparmi previsti.
              </li>
              <li>
                Mancato rispetto di scadenze, termini o adempimenti di qualsiasi natura.
              </li>
              <li>
                Sanzioni, more, interessi, penali o decadenze da diritti o benefici.
              </li>
              <li>
                Danni derivanti da interruzioni, malfunzionamenti, errori, virus o 
                attacchi informatici.
              </li>
              <li>
                Qualsiasi altra perdita o danno, anche se il Fornitore è stato informato 
                della possibilità di tali danni.
              </li>
            </ul>
            <p className="mt-3">
              IN OGNI CASO, LA RESPONSABILITÀ COMPLESSIVA DEL FORNITORE NON POTRÀ IN 
              NESSUN CASO SUPERARE L'IMPORTO EFFETTIVAMENTE PAGATO DALL'UTENTE PER IL 
              SERVIZIO NEI DODICI (12) MESI PRECEDENTI L'EVENTO CHE HA DATO ORIGINE 
              ALLA RESPONSABILITÀ, O €12,00 (DODICI/00) SE SUPERIORE.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">10. Manleva e Indennizzo</h3>
            <p>
              L'utente accetta di manlevare, difendere e tenere indenne il Fornitore, 
              i suoi amministratori, dipendenti, collaboratori e agenti da e contro 
              qualsiasi reclamo, richiesta, danno, perdita, responsabilità, costo o 
              spesa (incluse le ragionevoli spese legali) derivanti da o connessi a:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>L'utilizzo del Servizio da parte dell'utente.</li>
              <li>La violazione dei presenti Termini da parte dell'utente.</li>
              <li>La violazione di diritti di terzi da parte dell'utente.</li>
              <li>Contenuti o dati inseriti dall'utente nel Servizio.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">11. Uso Accettabile</h3>
            <p>L'utente si impegna a non:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Utilizzare il Servizio per scopi illegali o non autorizzati.</li>
              <li>Tentare di accedere a sistemi o dati non autorizzati.</li>
              <li>Interferire con il funzionamento del Servizio.</li>
              <li>Caricare contenuti dannosi, diffamatori o che violino diritti di terzi.</li>
              <li>Rivendere, sublicenziare o redistribuire il Servizio.</li>
              <li>Effettuare reverse engineering del software.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">12. Sospensione e Risoluzione</h3>
            <p>
              Il Fornitore si riserva il diritto di sospendere o terminare l'accesso 
              dell'utente al Servizio, in qualsiasi momento e senza preavviso, per 
              qualsiasi motivo, inclusa la violazione dei presenti Termini. In caso 
              di risoluzione, l'utente non avrà diritto ad alcun rimborso per il 
              periodo non utilizzato dell'abbonamento.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">13. Modifiche al Servizio e ai Termini</h3>
            <p>
              Il Fornitore si riserva il diritto di modificare, sospendere o 
              interrompere il Servizio (o parte di esso) in qualsiasi momento, con 
              o senza preavviso. Il Fornitore si riserva inoltre il diritto di 
              modificare i presenti Termini in qualsiasi momento. Le modifiche 
              sostanziali saranno comunicate via email o tramite avviso nell'applicazione. 
              L'uso continuato del Servizio dopo la pubblicazione delle modifiche 
              costituisce accettazione integrale dei nuovi Termini.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">14. Proprietà Intellettuale</h3>
            <p>
              Tutti i diritti di proprietà intellettuale relativi al Servizio, inclusi 
              ma non limitati a software, design, loghi, marchi e contenuti, sono e 
              rimangono di proprietà esclusiva del Fornitore o dei suoi licenzianti. 
              L'utente ottiene esclusivamente una licenza limitata, non esclusiva, 
              non trasferibile e revocabile per l'utilizzo del Servizio conformemente 
              ai presenti Termini.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">15. Comunicazioni</h3>
            <p>
              L'utente accetta di ricevere comunicazioni elettroniche dal Fornitore 
              relative al Servizio, incluse notifiche, aggiornamenti, comunicazioni 
              amministrative e promozionali. L'utente può disattivare le comunicazioni 
              promozionali ma non quelle relative al funzionamento del Servizio.
            </p>
            <p className="mt-3">
              <strong>Notifiche WhatsApp:</strong> L'utente Pro può attivare
              facoltativamente le notifiche WhatsApp. Il servizio di messaggistica
              è fornito tramite Twilio Inc. Il Fornitore non è responsabile per
              ritardi, mancate consegne o interruzioni del servizio WhatsApp
              dipendenti da Twilio, Meta (WhatsApp) o dall'operatore telefonico
              dell'utente. L'utente può disattivare le notifiche WhatsApp
              in qualsiasi momento dalle impostazioni della dashboard.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">16. Forza Maggiore</h3>
            <p>
              Il Fornitore non sarà responsabile per ritardi o inadempimenti derivanti 
              da cause al di fuori del proprio ragionevole controllo, inclusi ma non 
              limitati a: calamità naturali, guerre, terrorismo, sommosse, embarghi, 
              atti di autorità civili o militari, incendi, inondazioni, pandemie, 
              scioperi, interruzioni di servizi di terzi, guasti hardware o software, 
              attacchi informatici o interruzioni della rete Internet.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">17. Clausola di Salvaguardia</h3>
            <p>
              Qualora una o più disposizioni dei presenti Termini siano ritenute 
              invalide, nulle o inapplicabili da un tribunale competente, le restanti 
              disposizioni rimarranno pienamente valide ed efficaci. La disposizione 
              invalida sarà sostituita da una disposizione valida che si avvicini il 
              più possibile all'intento economico originario.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">18. Rinuncia</h3>
            <p>
              La mancata applicazione da parte del Fornitore di qualsiasi diritto o 
              disposizione dei presenti Termini non costituirà rinuncia a tale diritto 
              o disposizione. Qualsiasi rinuncia dovrà essere espressa per iscritto 
              per essere efficace.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">19. Intero Accordo</h3>
            <p>
              I presenti Termini, unitamente all'Informativa sulla Privacy, costituiscono 
              l'intero accordo tra l'utente e il Fornitore relativamente all'uso del 
              Servizio e sostituiscono qualsiasi accordo precedente, scritto o orale, 
              relativo allo stesso oggetto.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">20. Legge Applicabile e Foro Competente</h3>
            <p>
              I presenti Termini sono regolati dalla legge italiana. Per qualsiasi 
              controversia relativa all'interpretazione, validità o esecuzione dei 
              presenti Termini sarà competente in via esclusiva il Foro di Roma, 
              fatto salvo il foro inderogabile del consumatore ai sensi del D.Lgs. 
              206/2005 (Codice del Consumo).
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">21. Contatti</h3>
            <p>
              Per qualsiasi domanda relativa ai presenti Termini:<br />
              Team Pittima App<br />
              Email: info@zannalabs.com<br />
              Sito web: rememberapp.zannalabs.com
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