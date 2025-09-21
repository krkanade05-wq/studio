
'use server';

/**
 * @fileOverview An AI flow for analyzing content veracity.
 *
 * - analyzeContent - A function that handles the content analysis process.
 * - AnalyzeContentInput - The input type for the analyzeContent function.
 * - AnalyzeContentOutput - The return type for the analyzeContent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeContentInputSchema = z.object({
  text: z.string().optional().describe('The text content to analyze.'),
  url: z.string().optional().describe('The URL of the content to analyze.'),
  photoDataUri: z.string().optional().describe("A photo of the content, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type AnalyzeContentInput = z.infer<typeof AnalyzeContentInputSchema>;


const EvidenceSchema = z.object({
    source: z.string().describe('The name of the trusted source, e.g., "FactCheck.org" or "Reuters".'),
    title: z.string().describe('The title of the evidence article or page.'),
    url: z.string().describe('The URL to the evidence source.')
});

const AnalyzeContentOutputSchema = z.object({
  verdict: z.enum(['Likely True', 'Likely False', 'Unverifiable']).describe('The overall verdict on the content\'s veracity.'),
  confidence: z.number().min(0).max(100).optional().describe('The confidence level of the verdict, from 0 to 100.'),
  explanation: z.string().describe('A summary explaining why the content may be misleading and the reasoning behind the verdict.'),
  evidence: z.array(EvidenceSchema).optional().describe('A list of trusted sources that support the analysis.'),
});
export type AnalyzeContentOutput = z.infer<typeof AnalyzeContentOutputSchema>;


export async function analyzeContent(input: AnalyzeContentInput): Promise<AnalyzeContentOutput> {
  return analyzeContentFlow(input);
}


const analyzeContentPrompt = ai.definePrompt({
    name: 'analyzeContentPrompt',
    input: { schema: AnalyzeContentInputSchema },
    output: { schema: AnalyzeContentOutputSchema },
    prompt: `You are an expert fact-checker. Your task is to analyze the provided content and determine its veracity.

    Analyze the following content:
    {{#if text}}
    Text: {{{text}}}
    {{/if}}
    {{#if url}}
    URL: {{{url}}}
    {{/if}}
    {{#if photoDataUri}}
    Image: {{media url=photoDataUri}}
    {{/if}}

    Based on your analysis, provide a verdict ('Likely True', 'Likely False', or 'Unverifiable').
    
    Also, provide a confidence score for your verdict (0-100). If the verdict is 'Unverifiable', you may omit the confidence score.

    Provide a detailed explanation for your verdict. Summarize why the content may be misleading and the reasoning that led to your conclusion.
    
    If possible, provide a list of 2-3 pieces of evidence from reputable, neutral sources (like established news organizations, scientific bodies, or fact-checking organizations) that support your analysis. For each piece of evidence, include the source name, title, and a direct URL. If no direct evidence is found, provide an empty array.
    `,
});


const analyzeContentFlow = ai.defineFlow(
  {
    name: 'analyzeContentFlow',
    inputSchema: AnalyzeContentInputSchema,
    outputSchema: AnalyzeContentOutputSchema,
  },
  async (input) => {

    if (!input.text && !input.url && !input.photoDataUri) {
        throw new Error('At least one input (text, url, or photoDataUri) must be provided.');
    }

    const { output } = await analyzeContentPrompt(input);
    return output!;
  }
);
