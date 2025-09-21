
'use server';
import {
  analyzeContent,
  AnalyzeContentOutput,
  AnalyzeContentInput,
} from '@/ai/flows/analyze-content-flow';

export type AnalysisState = {
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string | null;
  verdict?: AnalyzeContentOutput['verdict'];
  explanation?: string;
  evidence?: AnalyzeContentOutput['evidence'];
};

export async function checkContentAction(
  prevState: AnalysisState,
  formData: FormData
): Promise<AnalysisState> {
  const contentType = formData.get('contentType') as string;
  const content = formData.get('content') as string;

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
