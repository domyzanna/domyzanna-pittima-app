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
          <CardDescription>Ultimo aggiornamento: 07/01/2026</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Benvenuto in Pittima App. La tua privacy è importante per noi.
            Questa informativa spiega quali dati raccogliamo e come li usiamo.
          </p>
          <h3 className="font-semibold text-foreground">Dati Raccolti</h3>
          <p>
            Raccogliamo solo i dati strettamente necessari al funzionamento del
            servizio:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Dati forniti dall'utente:</strong> Indirizzo email, nome
              e scadenze che inserisci nell'applicazione.
            </li>
            <li>
              <strong>Dati di utilizzo:</strong> Raccogliamo dati anonimi su come
              utilizzi l'applicazione per migliorare il servizio.
            </li>
          </ul>
          <h3 className="font-semibold text-foreground">
            Utilizzo dell'Intelligenza Artificiale (AI)
          </h3>
          <p>
            L'applicazione utilizza modelli di intelligenza artificiale per
            generare riepiloghi e prioritizzare le tue scadenze. È fondamentale
            comprendere che:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>L'AI può commettere errori:</strong> Le analisi e i
              suggerimenti forniti dall'IA sono generati automaticamente e
              potrebbero contenere imprecisioni, errori o omissioni.
            </li>
            <li>
              <strong>Non fare affidamento esclusivo sull'AI:</strong> I
              risultati dell'IA sono da intendersi come un supporto e non devono
              sostituire la verifica umana. L'utente è tenuto a controllare
              sempre l'accuratezza delle informazioni fornite.
            </li>
          </ul>
          <h3 className="font-semibold text-foreground">
            Responsabilità
          </h3>
          <p>
            Utilizzando Pittima App, accetti che i creatori e gestori del
            servizio non sono responsabili per qualsiasi danno, perdita di dati,
            mancato pagamento di scadenze o qualsiasi altra conseguenza derivante
            dall'uso (o mancato uso) dell'applicazione, inclusi eventuali errori
            generati dai modelli di intelligenza artificiale. La responsabilità
            finale della gestione delle proprie scadenze rimane interamente a
            carico dell'utente.
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
