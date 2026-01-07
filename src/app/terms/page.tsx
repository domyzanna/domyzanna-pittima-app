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
            Termini di Servizio
          </CardTitle>
          <CardDescription>Ultimo aggiornamento: 07/01/2026</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Utilizzando l'applicazione Pittima App ("Servizio"), accetti di
            essere vincolato dai seguenti termini e condizioni ("Termini di
            Servizio").
          </p>
          <h3 className="font-semibold text-foreground">Uso del Servizio</h3>
          <p>
            Il Servizio è fornito "così com'è". L'utente accetta di utilizzare
            il Servizio a proprio rischio. Non garantiamo che il servizio sarà
            ininterrotto, sicuro o privo di errori.
          </p>
          <h3 className="font-semibold text-foreground">
            Declinazione di Responsabilità
          </h3>
          <p>
            In nessun caso Pittima App sarà responsabile per danni diretti,
            indiretti, incidentali, speciali o consequenziali derivanti
            dall'uso o dall'impossibilità di utilizzare il servizio. Questo
            include, ma non si limita a, la perdita di profitti, dati o altre
            perdite intangibili.
          </p>
          <h3 className="font-semibold text-foreground">
            Funzionalità di Intelligenza Artificiale
          </h3>
          <p>
            Il Servizio utilizza modelli di intelligenza artificiale (AI) per
            fornire riepiloghi e altre funzionalità. L'utente riconosce e
            accetta che:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              I risultati generati dall'AI possono contenere errori,
              imprecisioni o essere incompleti.
            </li>
            <li>
              È responsabilità esclusiva dell'utente verificare l'accuratezza
              e la validità delle informazioni e dei suggerimenti forniti
              dall'AI prima di intraprendere qualsiasi azione.
            </li>
            <li>
              Non ci assumiamo alcuna responsabilità per decisioni o azioni
              prese dall'utente basate sui contenuti generati dall'AI.
            </li>
          </ul>
          <h3 className="font-semibold text-foreground">
            Modifiche ai Termini
          </h3>
          <p>
            Ci riserviamo il diritto di aggiornare e modificare i Termini di
            Servizio di volta in volta senza preavviso. L'uso continuato del
            Servizio dopo tali modifiche costituirà il consenso a tali
            modifiche.
          </p>
          <div className="pt-6 text-center">
            <Link href="/landing" className="text-sm text-primary hover:underline">
                Torna alla Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
