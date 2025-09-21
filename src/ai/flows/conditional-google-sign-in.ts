// This file is conditionally included based on the detected country of the user.
// If the country is supported, Google Sign In button is shown.
'use server';

/**
 * @fileOverview Implements conditional Google Sign-In based on user location.
 *
 * - shouldOfferGoogleSignIn - Determines whether to offer Google Sign-In based on the user's location.
 * - ShouldOfferGoogleSignInInput - The input type for the shouldOfferGoogleSignIn function.
 * - ShouldOfferGoogleSignInOutput - The return type for the shouldOfferGoogleSignIn function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ShouldOfferGoogleSignInInputSchema = z.object({
  countryCode: z
    .string()
    .describe(
      'The ISO 3166-1 alpha-2 country code of the user (e.g., US, CA, DE).'
    ),
});
export type ShouldOfferGoogleSignInInput = z.infer<
  typeof ShouldOfferGoogleSignInInputSchema
>;

const ShouldOfferGoogleSignInOutputSchema = z.object({
  offerGoogleSignIn: z
    .boolean()
    .describe(
      'Whether or not to offer Google Sign-In to the user based on their location.'
    ),
  reason: z
    .string()
    .optional()
    .describe('The reason for the decision, if applicable.'),
});
export type ShouldOfferGoogleSignInOutput = z.infer<
  typeof ShouldOfferGoogleSignInOutputSchema
>;

export async function shouldOfferGoogleSignIn(
  input: ShouldOfferGoogleSignInInput
): Promise<ShouldOfferGoogleSignInOutput> {
  return shouldOfferGoogleSignInFlow(input);
}

const prompt = ai.definePrompt({
  name: 'shouldOfferGoogleSignInPrompt',
  input: {schema: ShouldOfferGoogleSignInInputSchema},
  output: {schema: ShouldOfferGoogleSignInOutputSchema},
  prompt: `You are an AI assistant that determines whether to offer Google Sign-In to a user based on their country code.

  Consider regulations, data privacy standards, and any other relevant factors.

  Given the user's country code: {{{countryCode}}}

  Respond with a JSON object indicating whether to offer Google Sign-In (offerGoogleSignIn: true/false) and a brief reason (reason: string) if not offering.
`,
});

const shouldOfferGoogleSignInFlow = ai.defineFlow(
  {
    name: 'shouldOfferGoogleSignInFlow',
    inputSchema: ShouldOfferGoogleSignInInputSchema,
    outputSchema: ShouldOfferGoogleSignInOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
