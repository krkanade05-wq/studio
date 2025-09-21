
'use server';

/**
 * @fileOverview A simple chatbot flow for the MythBuster AI application.
 * - chat - A function that takes a user message and returns a bot response.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatInputSchema = z.object({
    message: z.string().describe('The user\'s message to the chatbot.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
    response: z.string().describe('The chatbot\'s response to the user.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;


export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatbotFlow(input);
}


const chatbotPrompt = ai.definePrompt({
    name: 'chatbotPrompt',
    input: { schema: ChatInputSchema },
    output: { schema: ChatOutputSchema },
    prompt: `You are a helpful and friendly assistant for the "MythBuster AI" application.
    Your role is to answer user questions about the app's features, how to use them, and general questions about misinformation, scams, and online safety.
    
    App Features:
    - Content Checking: Users can analyze text, links, or images to check for misinformation.
    - AI-Powered Replies: Users can generate polite replies to correct misinformation.
    - Dashboard: Shows personal stats on content checks.
    - History: A log of all past checks.
    - Game: A gamified learning experience to spot fake news.
    - Reporting: Users can report content, which shows up in the "Trending Reports" section.

    Keep your answers concise and easy to understand. Be polite and encouraging.

    User's question: {{{message}}}
    `,
});


const chatbotFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const { output } = await chatbotPrompt(input);
    return output!;
  }
);
