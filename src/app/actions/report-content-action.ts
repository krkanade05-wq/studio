
'use server';

import { db } from '@/lib/firebase/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';

const ReportSchema = z.object({
    userId: z.string().min(1, { message: 'User ID is required.' }),
    content: z.string().min(1, { message: 'Content to report cannot be empty.' }),
    description: z.string().optional(),
});

export type ReportState = {
    status: 'idle' | 'success' | 'error';
    message?: string | null;
};

export async function reportContentAction(
  prevState: ReportState,
  formData: FormData
): Promise<ReportState> {
  const validatedFields = ReportSchema.safeParse({
    userId: formData.get('userId'),
    content: formData.get('content'),
    description: formData.get('description'),
  });

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: validatedFields.error.flatten().fieldErrors.content?.[0] || 'Invalid data provided.',
    };
  }
  
  const { userId, content, description } = validatedFields.data;

  try {
    // Save to a global 'reports' collection for trending analysis
    await addDoc(collection(db, `reports`), {
      userId,
      content,
      description,
      timestamp: serverTimestamp(),
    });

    return { status: 'success', message: 'Thank you for your feedback. Your report has been submitted.' };
  } catch (error) {
    console.error('Error saving report: ', error);
    return { status: 'error', message: 'Failed to submit report. Please try again.' };
  }
}

    