
'use server';

/**
 * @fileOverview An AI flow for generating a corrective reply.
 *
 * - generateReply - A function that handles the reply generation process.
 * - GenerateReplyInput - The input type for the generateReply function.
 * - GenerateReplyOutput - The return type for the generateReply function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Re-define the schema here to avoid exporting non-function from 'use server' file
const AnalyzeContentInputSchema = z.object({
  text: z.string().optional().describe('The text content to analyze.'),
  url: z.string().optional().describe('The URL of the content to analyze.'),
  photoDataUri: z.string().optional().describe("A photo of the content, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});


const GenerateReplyInputSchema = z.object({
  originalContent: AnalyzeContentInputSchema.optional(),
  verdict: z.enum(['Likely True', 'Likely False', 'Unverifiable']),
  explanation: z.string(),
});
export type GenerateReplyInput = z.infer<typeof GenerateReplyInputSchema>;


const GenerateReplyOutputSchema = z.object({
  reply: z.string().describe('The generated corrective reply.'),
});
export type GenerateReplyOutput = z.infer<typeof GenerateReplyOutputSchema>;

export async function generateReply(input: GenerateReplyInput): Promise<GenerateReplyOutput> {
  return generateReplyFlow(input);
}


const generateReplyPrompt = ai.definePrompt({
    name: 'generateReplyPrompt',
    input: { schema: GenerateReplyInputSchema },
    output: { schema: GenerateReplyOutputSchema },
    prompt: `You are a helpful assistant that helps users craft polite and factual replies to correct misinformation online.

    The user has analyzed a piece of content and received the following verdict:
    Verdict: {{{verdict}}}
    Explanation: {{{explanation}}}

    The original content was:
    {{#if originalContent.text}}
    Text: {{{originalContent.text}}}
    {{/if}}
    {{#if originalContent.url}}
    URL: {{{originalContent.url}}}
    {{/if}}

    Based on this, generate a concise, polite, and neutral reply that the user can post to correct the information.
    - If the verdict is 'Likely False', the reply should gently correct the misinformation, referencing the explanation.
    - If the verdict is 'Unverifiable', the reply should express caution and point out that the claims are not well-supported.
    - If the verdict is 'Likely True', the reply should be a simple affirmation.

    Do not invent new facts. Stick to the provided explanation. The reply should be in the first person, as if the user is speaking. Start with something like "I looked into this..." or "Just a heads up...".
    `,
});


const generateReplyFlow = ai.defineFlow(
  {
    name: 'generateReplyFlow',
    inputSchema: GenerateReplyInputSchema,
    outputSchema: GenerateReplyOutputSchema,
  },
  async (input) => {
    const { output } = await generateReplyPrompt(input);
    return output!;
  }
);
