
'use server';

import {
  generateReply,
  GenerateReplyInput,
} from '@/ai/flows/generate-reply-flow';
import { z } from 'zod';

export type ReplyState = {
  status: 'idle' | 'success' | 'error';
  reply?: string;
  error?: string;
};

const ActionSchema = z.object({
  originalContent: z.string(),
  verdict: z.string(),
  explanation: z.string(),
});

export async function generateReplyAction(
  prevState: ReplyState,
  formData: FormData
): Promise<ReplyState> {
  try {
    const parseResult = ActionSchema.safeParse({
      originalContent: formData.get('originalContent'),
      verdict: formData.get('verdict'),
      explanation: formData.get('explanation'),
    });

    if (!parseResult.success) {
      return { status: 'error', error: 'Invalid input.' };
    }
    
    const { originalContent, verdict, explanation } = parseResult.data;

    const generateReplyInput: GenerateReplyInput = {
      originalContent: JSON.parse(originalContent),
      verdict: verdict as GenerateReplyInput['verdict'],
      explanation: explanation,
    };

    const result = await generateReply(generateReplyInput);

    return {
      status: 'success',
      reply: result.reply,
    };
  } catch (error) {
    console.error('Reply generation failed:', error);
    return { status: 'error', error: 'Failed to generate reply.' };
  }
}
