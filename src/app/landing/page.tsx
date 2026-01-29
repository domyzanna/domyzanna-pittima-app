'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import placeholderImages from '@/lib/placeholder-images.json';
import {
  Zap,
  LayoutGrid,
  Relax,
  Wand2,
  CheckCircle,
  BarChart,
  BellRing,
  History,
  Mail,
  Rocket,
  Download,
} from 'lucide-react';
import { Icons } from '@/components/icons';
import { useState, useEffect } from 'react';

const features = [
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: 'Centralizza Tutto',
    description:
      "Inserisci ogni scadenza in pochi secondi, dall'assicurazione dell'auto al rinnovo dell'abbonamento TV.",
  },
  {
    icon: <LayoutGrid className="h-8 w-8 text-primary" />,
    title: 'Organizza con Categorie',
    description:
      "Raggruppa le scadenze in categorie come 'Casa', 'Veicoli' o 'Tasse' per avere sempre tutto sotto controllo.",
  },
  {
    icon: <BellRing className="h-8 w-8 text-primary" />,
    title: 'Dimentica di Dover Ricordare',
    description:
      "Pittima ti avviserà via email al momento giusto, così potrai dedicarti ad altro senza ansie.",
  },
];

export default function LandingPage() {
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
  
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  const handleInstallClick = () => {
    if (!installPrompt) {
      return;
    }
    // The type assertion is needed because 'prompt' is not in the default Event type
    (installPrompt as any).prompt();
    (installPrompt as any).userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setInstallPrompt(null);
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-card">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Mai più una scadenza dimenticata.
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Pittima è l'app intelligente che ti aiuta a gestire
                  assicurazioni, bollette, abbonamenti e tasse. Tutto in un
                  unico posto.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg">
                  <Link href="/signup">Registrati Gratis</Link>
                </Button>
                {installPrompt && (
                  <Button
                    onClick={handleInstallClick}
                    variant="outline"
                    size="lg"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Scarica Pittima App
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Caratteristiche Principali
                </div>
                <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl">
                  Semplice, Potente, Efficace.
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Abbiamo progettato Pittima per essere intuitivo e facile da
                  usare, senza rinunciare alle funzionalità avanzate di cui hai
                  bisogno.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pittima Story Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-card">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center space-y-4">
               <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  L'Origine del Nome
                </div>
              <h2 className="text-3xl font-bold font-headline tracking-tighter md:text-4xl/tight flex items-center justify-center gap-3">
                <History className="h-8 w-8 text-primary" />
                Perché "Pittima"?
              </h2>
              <div className="space-y-4 text-left md:text-center text-muted-foreground md:text-lg">
                <p>
                  Nella Repubblica di Venezia, la "pittima" era una figura incaricata dai creditori di seguire i debitori ovunque andassero, ricordando loro costantemente e pubblicamente il debito non pagato. Era un promemoria umano, implacabile e impossibile da ignorare.
                </p>
                <p>
                  La nostra app si ispira a questa figura storica, ma con uno scopo moderno e positivo: essere il tuo **promemoria digitale instancabile**. Ci prendiamo carico del "fastidio" di dover ricordare, avvisandoti al momento giusto e con l'insistenza necessaria, così tu puoi vivere senza l'ansia di dimenticare una scadenza importante.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* AI Feature Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold font-headline tracking-tighter md:text-4xl/tight">
                Il tuo Riepilogo Intelligente con AI
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Sfrutta l'intelligenza artificiale per ottenere un riepilogo
                mensile che non solo elenca le scadenze, ma le prioritizza in
                base al loro impatto reale. Così sai sempre su cosa
                concentrarti prima.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-4">
                <Wand2 className="h-8 w-8 text-primary mt-1" />
                <div>
                  <h3 className="text-lg font-bold">Priorità Automatiche</h3>
                  <p className="text-sm text-muted-foreground">
                    L'AI capisce la differenza tra una tassa e un abbonamento a
                    un servizio di streaming, mettendoti in guardia sulle cose
                    importanti.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <BarChart className="h-8 w-8 text-primary mt-1" />
                <div>
                  <h3 className="text-lg font-bold">Visione d'Insieme</h3>
                  <p className="text-sm text-muted-foreground">
                    Un report chiaro e conciso che ti dà una visione completa
                    del mese corrente e di quello successivo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-card">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <blockquote className="text-lg font-semibold leading-snug lg:text-xl lg:leading-normal xl:text-2xl">
                “Finalmente un'app che mette ordine nel caos delle mie
                scadenze. Semplice, potente e mi ha già salvato da una multa!”
              </blockquote>
              <div className="mt-4">
                <p className="font-semibold">Utente Soddisfatto</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold font-headline tracking-tighter md:text-4xl/tight flex items-center justify-center gap-3">
                <Rocket className="h-8 w-8 text-primary" />
                Pronto a mettere ordine, per sempre?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Inizia gratis con le prime 6 scadenze. Quando sei pronto per un controllo totale, passa a Pro per soli **12€ all'anno** e aggiungi scadenze illimitate.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <Button asChild size="lg" className="w-full">
                <Link href="/signup">Inizia Gratis e Aggiungi 6 Scadenze</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Pittima App. Tutti i diritti
          riservati.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6 items-center">
          <a
            href="mailto:infopittima@zannalabs.com"
            className="text-xs hover:underline underline-offset-4 flex items-center gap-1"
          >
            <Mail className="h-3 w-3" />
            Contatti
          </a>
          <Link
            href="/terms"
            className="text-xs hover:underline underline-offset-4"
          >
            Termini di Servizio
          </Link>
          <Link
            href="/privacy"
            className="text-xs hover:underline underline-offset-4"
          >
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
