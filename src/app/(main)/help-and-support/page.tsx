
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Bot, LifeBuoy, Loader2, Send, User } from 'lucide-react';
import { chat, ChatInput, ChatOutput } from '@/ai/flows/chatbot-flow';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';


type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
};

export default function HelpAndSupportPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
        id: 'initial',
        text: 'Hello! I am the MythBuster AI assistant. How can I help you today?',
        sender: 'bot'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('div');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }, 0);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    scrollToBottom();
    
    try {
      const chatInput: ChatInput = { message: input };
      const result: ChatOutput = await chat(chatInput);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: result.response,
        sender: 'bot',
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, but I'm having trouble connecting. Please try again later.",
        sender: 'bot',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] w-full flex-col items-center p-4 md:p-8">
      <Card className="flex flex-col w-full max-w-2xl h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl font-bold">
            <LifeBuoy className="h-6 w-6" />
            Help & Support Chatbot
          </CardTitle>
          <CardDescription>
            Ask me anything about MythBuster AI or online safety.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
                <div className="space-y-6 pr-4">
                    {messages.map((message) => (
                    <div
                        key={message.id}
                        className={cn(
                        'flex items-start gap-3',
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                        )}
                    >
                        {message.sender === 'bot' && (
                            <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                                <AvatarFallback><Bot className='h-5 w-5'/></AvatarFallback>
                            </Avatar>
                        )}
                        <div
                        className={cn(
                            'max-w-xs rounded-lg px-4 py-2 text-sm sm:max-w-md md:max-w-lg',
                            message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                        >
                        {message.text}
                        </div>
                         {message.sender === 'user' && (
                            <Avatar className="h-8 w-8">
                                <AvatarFallback><User className='h-5 w-5' /></AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                    ))}
                    {isLoading && (
                        <div className='flex items-start gap-3 justify-start'>
                             <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                                <AvatarFallback><Bot className='h-5 w-5'/></AvatarFallback>
                            </Avatar>
                            <div className='max-w-xs rounded-lg px-4 py-2 text-sm sm:max-w-md md:max-w-lg bg-muted flex items-center'>
                                <Loader2 className="h-5 w-5 animate-spin" />
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </CardContent>
        <CardFooter className='pt-6'>
          <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              disabled={isLoading}
              autoComplete="off"
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send Message</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
