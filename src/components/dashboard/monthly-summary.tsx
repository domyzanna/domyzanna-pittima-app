'use client';
import { useState, useEffect, useRef } from 'react';
import { askPittima } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Wand2, Send, Bot } from 'lucide-react';
import { Icons } from '@/components/icons';
import type { ProcessedDeadline } from '@/lib/types';
import { Textarea } from '../ui/textarea';
import { detectBrowser, isStandalone } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  addMonths,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from 'date-fns';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type BrowserInfo = {
  browser: ReturnType<typeof detectBrowser>;
  isStandalone: boolean;
  hasNativeInstall: boolean;
};

export function MonthlySummary({ deadlines }: { deadlines: ProcessedDeadline[] }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Ciao! Sono Pittima, il tuo assistente. Posso aiutarti con:\n• Come installare l'app\n• Come funziona Pittima\n• Un riepilogo delle tue scadenze",
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Detect browser info on mount
    const info: BrowserInfo = {
      browser: detectBrowser(),
      isStandalone: isStandalone(),
      hasNativeInstall: false, // will be updated by event listener
    };

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setBrowserInfo((prev) => ({ ...(prev as BrowserInfo), hasNativeInstall: true }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    setBrowserInfo(info);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>, quickAction?: string) => {
    if (e) e.preventDefault();
    const messageToSend = quickAction || userInput.trim();
    if (!messageToSend || isLoading || !browserInfo) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: messageToSend }];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    // Prepare context for the AI
    const now = new Date();
    const currentMonthInterval = { start: startOfMonth(now), end: endOfMonth(now) };
    const nextMonthInterval = { start: startOfMonth(addMonths(now, 1)), end: endOfMonth(addMonths(now, 1)) };

    const formatForAI = (d: ProcessedDeadline) => ({
      name: d.name,
      category: d.category.name,
      dueDate: new Date(d.expirationDate).toISOString().split('T')[0],
      urgency: d.urgency,
      daysRemaining: d.daysRemaining,
    });

    const currentMonthDeadlines = deadlines.filter((d) => isWithinInterval(new Date(d.expirationDate), currentMonthInterval)).map(formatForAI);
    const nextMonthDeadlines = deadlines.filter((d) => isWithinInterval(new Date(d.expirationDate), nextMonthInterval)).map(formatForAI);
    const overdueDeadlines = deadlines.filter((d) => d.urgency === 'scaduto').map(formatForAI);
    const conversationHistory = newMessages.slice(-7, -1).map(m => `${m.role}: ${m.content}`).join('\n');

    try {
      const result = await askPittima({
        message: messageToSend,
        ...browserInfo,
        conversationHistory,
        currentMonthDeadlines: JSON.stringify(currentMonthDeadlines),
        nextMonthDeadlines: JSON.stringify(nextMonthDeadlines),
        overdueDeadlines: JSON.stringify(overdueDeadlines),
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: result.response }]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Si è verificato un errore sconosciuto.';
      setMessages((prev) => [...prev, { role: 'assistant', content: `Spiacente, c'è stato un errore: ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleQuickAction = (action: string) => {
    handleSubmit(undefined, action);
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Bot className="text-primary" />
          Assistente Pittima
        </CardTitle>
        <CardDescription>
          Chiedimi aiuto per installare l'app, per capire come funziona o per un riepilogo.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 gap-4">
        <div ref={scrollAreaRef} className="flex-1 space-y-4 overflow-y-auto pr-2 -mr-2 max-h-[400px]">
          {messages.map((msg, index) => (
            <div key={index} className={cn('flex items-start gap-3', msg.role === 'user' && 'justify-end')}>
              {msg.role === 'assistant' && (
                <div className="bg-primary rounded-full p-2 text-primary-foreground">
                  <Bot size={16} />
                </div>
              )}
              <div className={cn('rounded-lg px-3 py-2 text-sm max-w-[85%]', msg.role === 'assistant' ? 'bg-muted' : 'bg-primary text-primary-foreground')}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="bg-primary rounded-full p-2 text-primary-foreground">
                <Bot size={16} />
              </div>
              <div className="bg-muted rounded-lg px-3 py-2 text-sm flex items-center">
                 <Icons.spinner className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>

        {messages.length <= 1 && (
            <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => handleQuickAction("Come installo l'app?")}>
                    Come installo l'app?
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickAction("Come funziona Pittima?")}>
                    Come funziona Pittima?
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickAction("Riepilogo delle mie scadenze")}>
                    Riepilogo Scadenze
                </Button>
            </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-4 border-t">
          <Textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Chiedi a Pittima..."
            className="flex-1 resize-none min-h-[40px]"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !userInput.trim()}>
            {isLoading ? <Icons.spinner className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Invia</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
