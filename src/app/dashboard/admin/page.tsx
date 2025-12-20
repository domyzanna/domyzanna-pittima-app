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
    <div className="space-y-8">
      <h2 className="text-xl font-headline font-semibold mb-4 flex items-center gap-3">
        Pannello di Amministrazione
      </h2>
      <Card>
        <CardHeader>
          <CardTitle>Controllo Scadenze Manuale</CardTitle>
          <CardDescription>
            Usa questo pulsante per eseguire manualmente il "Guardiano Notturno". Questo processo
            controlla tutte le scadenze e invia le notifiche necessarie. Utile per il debug
            o per forzare un controllo al di fuori della normale pianificazione giornaliera.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleRunCheck} disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isLoading ? 'Esecuzione in corso...' : 'Avvia Controllo Notifiche'}
          </Button>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4">
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
            <Alert variant="default" className="border-green-500 bg-green-50">
              <AlertTitle className="text-green-800">Esecuzione completata con successo!</AlertTitle>
              <AlertDescription className="text-green-700">
                 <pre className="mt-2 rounded-md bg-slate-100 p-4">
                    <code className="text-slate-800">{JSON.stringify(result, null, 2)}</code>
                 </pre>
              </AlertDescription>
            </Alert>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
