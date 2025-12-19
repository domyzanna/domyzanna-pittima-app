'use client';

import { useState } from 'react';
import { getAiSummary } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Wand2 } from 'lucide-react';
import { Icons } from '@/components/icons';
import type { ProcessedDeadline } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export function MonthlySummary({
  deadlines,
}: {
  deadlines: ProcessedDeadline[];
}) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAiSummary(deadlines);
      if (result.summary.startsWith('Failed')) {
        setError(result.summary);
        setSummary(null);
      } else {
        setSummary(result.summary);
      }
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : 'Si è verificato un errore sconosciuto.';
      setError(errorMessage);
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Wand2 className="text-primary" />
          Riepilogo Mensile AI
        </CardTitle>
        <CardDescription>
          Ottieni un riepilogo basato sull'IA delle tue scadenze più critiche.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTitle>Errore</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : summary ? (
          <div className="text-sm text-foreground whitespace-pre-wrap font-body">
            {summary}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Clicca il pulsante per generare il tuo riepilogo.
          </p>
        )}
        <Button
          onClick={handleGenerateSummary}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Generazione...' : 'Genera Riepilogo AI'}
        </Button>
      </CardContent>
    </Card>
  );
}
