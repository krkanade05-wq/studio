
'use server';

/**
 * @fileOverview AI flows for the misinformation detection game.
 *
 * - generateStatement - Generates a new true/false statement.
 * - verifyStatement - Verifies a user's guess and provides an explanation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';


// Schema for generating a statement
const StatementOutputSchema = z.object({
  statement: z.string().describe('A short, clear statement that may be either true or false. It should be 1-2 sentences long and not too complex. Randomly vary between real and fake statements.'),
});
export type StatementOutput = z.infer<typeof StatementOutputSchema>;

// Schema for verifying a statement
const VerificationInputSchema = z.object({
    statement: z.string().describe('The original statement that was shown to the user.'),
    userGuess: z.enum(['Real', 'Fake']).describe("The user's guess."),
});
export type VerificationInput = z.infer<typeof VerificationInputSchema>;

const VerificationOutputSchema = z.object({
    isCorrect: z.boolean().describe('Whether the user\'s guess was correct.'),
    correctAnswer: z.enum(['Real', 'Fake']).describe('The correct answer for the statement.'),
    explanation: z.string().describe('A short explanation (2-3 lines) of why the statement is real or fake, or why it is a common scam/misinformation tactic.'),
});
export type VerificationOutput = z.infer<typeof VerificationOutputSchema>;


// Exported function to generate a statement
export async function generateStatement(): Promise<StatementOutput> {
  return generateStatementFlow();
}

// Exported function to verify a statement
export async function verifyStatement(input: VerificationInput): Promise<VerificationOutput> {
    return verifyStatementFlow(input);
}


// Prompt for generating a statement
const generateStatementPrompt = ai.definePrompt({
  name: 'generateStatementPrompt',
  output: { schema: StatementOutputSchema },
  prompt: `You are the Question Generator for a misinformation-detection game. Generate a single, short, clear statement that is either true ('Real') or false ('Fake').
  The statements should be related to common online misinformation, spam, scams, or misleading facts.
  - Topics can include fake health claims, phishing email characteristics, social media rumors, or common financial scams.
  - The statement should be 1-2 sentences long and not too complex.
  - Randomly vary between real and fake statements.
  - Do not reveal the answer.
  
  Example Fake Statement: "You can get a free government grant by providing your bank details on a linked website."
  Example Real Statement: "Your bank will never ask for your password or full debit card number over email."`,
});


// Prompt for verifying a statement
const verifyStatementPrompt = ai.definePrompt({
    name: 'verifyStatementPrompt',
    input: { schema: VerificationInputSchema },
    output: { schema: VerificationOutputSchema },
    prompt: `You are the Answer-Checker for a misinformation-detection game.
    The user was shown the following statement:
    "{{{statement}}}"

    The user guessed that the statement is: {{{userGuess}}}

    First, determine if the statement is 'Real' (a true fact or legitimate practice) or 'Fake' (a piece of misinformation, a scam, or a false claim).
    Then, determine if the user's guess was correct.
    Finally, provide a short, simple explanation (2-3 lines) for the correct answer. The explanation should be educational and help the user spot similar issues in the future.
    Do not start the explanation with "The statement is...".`,
});

// Flow to generate a statement
const generateStatementFlow = ai.defineFlow(
  {
    name: 'generateStatementFlow',
    outputSchema: StatementOutputSchema,
  },
  async () => {
    const { output } = await generateStatementPrompt();
    return output!;
  }
);


// Flow to verify a statement
const verifyStatementFlow = ai.defineFlow(
    {
        name: 'verifyStatementFlow',
        inputSchema: VerificationInputSchema,
        outputSchema: VerificationOutputSchema,
    },
    async (input) => {
        const { output } = await verifyStatementPrompt(input);
        return output!;
    }
);
