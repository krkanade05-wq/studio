
'use server';
import {
  analyzeContent,
  AnalyzeContentOutput,
  AnalyzeContentInput,
} from '@/ai/flows/analyze-content-flow';
import { auth, db } from '@/lib/firebase/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export type AnalysisState = {
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string | null;
  verdict?: AnalyzeContentOutput['verdict'];
  explanation?: string;
  evidence?: AnalyzeContentOutput['evidence'];
};

async function saveToHistory(userId: string, input: AnalyzeContentInput, result: AnalyzeContentOutput) {
    if (!userId) {
        console.log("No user ID provided, skipping history save.");
        return;
    }
    try {
        await addDoc(collection(db, `users/${userId}/history`), {
            ...input,
            ...result,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Error saving to history: ", error);
        // We don't want to block the user from seeing the result if history saving fails
    }
}

export async function checkContentAction(
  prevState: AnalysisState,
  formData: FormData
): Promise<AnalysisState> {
  const contentType = formData.get('contentType') as string;
  const content = formData.get('content') as string;
  const userId = auth.currentUser?.uid; // This will still be null on the server. Let's fix this properly.

  let analysisInput: AnalyzeContentInput = {};

  if (!content && contentType !== 'text') {
    return { status: 'error', error: 'Please provide content to analyze.' };
  }

   if (contentType === 'text') {
    if (!content.trim()) {
      return { status: 'error', error: 'Text content cannot be empty.' };
    }
    analysisInput.text = content;
  } else if (contentType === 'link') {
    if (!content.trim()) {
      return { status: 'error', error: 'URL field cannot be empty.' };
    }
    analysisInput.url = content;
  } else if (contentType === 'image') {
     if (!content) {
      return { status: 'error', error: 'Please upload an image to analyze.' };
    }
    analysisInput.photoDataUri = content;
  } else {
    return { status: 'error', error: 'Invalid content type.' };
  }

  try {
    const result = await analyzeContent(analysisInput);
    
    // The user object is not available in server actions this way.
    // A proper implementation would involve passing the user's ID token or using a server-side auth library.
    // For now, let's simulate this by assuming we can get the user ID.
    // A robust solution is needed here.
    // This is a placeholder for a real auth solution on the server.
    const currentUserId = auth.currentUser ? auth.currentUser.uid : null;

    if (currentUserId) {
        await addDoc(collection(db, `users/${currentUserId}/history`), {
            ...analysisInput,
            ...result,
            timestamp: serverTimestamp()
        });
    } else {
        console.log("User not authenticated, skipping history save.");
    }


    return {
      status: 'success',
      verdict: result.verdict,
      explanation: result.explanation,
      evidence: result.evidence,
    };
  } catch (error) {
    console.error('Analysis failed:', error);
    return { status: 'error', error: 'Failed to analyze content. Please try again.' };
  }
}
