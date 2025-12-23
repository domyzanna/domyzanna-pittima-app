'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { runCheckDeadlinesAndNotify } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunCheck = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await runCheckDeadlinesAndNotify();
      if (response.success) {
        setResult(response.data);
      } else {
        setError(response.error || 'Si è verificato un errore sconosciuto.');
      }
    } catch (e: any) {
      setError(e.message || 'Errore durante la chiamata del server action.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-headline font-bold flex items-center gap-2">
            <Shield className="h-6 w-6"/>
            Pannello di Amministrazione
        </h1>
        <p className="text-muted-foreground">
            Azioni manuali per il debug e la manutenzione dell'applicazione.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Controllo Scadenze Manuale</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Usa questo pulsante per eseguire manualmente il "Guardiano Notturno". Questo processo
          controlla tutte le scadenze e invia le notifiche necessarie. Utile per il debug
          o per forzare un controllo al di fuori della normale pianificazione giornaliera.
        </p>
        <Button onClick={handleRunCheck} disabled={isLoading}>
          {isLoading && (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          )}
          {isLoading ? 'Esecuzione in corso...' : 'Avvia Controllo Notifiche'}
        </Button>
      </div>
      
      <div className="flex-col items-start gap-4">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Errore durante l'esecuzione</AlertTitle>
              <AlertDescription>
                <pre className="mt-2 rounded-md bg-slate-950 p-4">
                  <code className="text-white">{error}</code>
                </pre>
              </AlertDescription>
            </Alert>
          )}
          {result && (
            <Alert variant="default" className="border-green-500 bg-green-50 dark:bg-green-950">
              <AlertTitle className="text-green-800 dark:text-green-300">Esecuzione completata con successo!</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-400">
                 <pre className="mt-2 rounded-md bg-slate-100 dark:bg-slate-800 p-4">
                    <code className="text-slate-800 dark:text-slate-200">{JSON.stringify(result, null, 2)}</code>
                 </pre>
              </AlertDescription>
            </Alert>
          )}
        </div>
    </div>
  );
}
