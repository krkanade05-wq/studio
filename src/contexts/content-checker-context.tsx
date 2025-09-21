

'use client';

import { createContext, useContext, useActionState, useCallback } from 'react';
import * as React from 'react';
import { checkContentAction, type AnalysisState } from '@/app/actions/check-content-action';

const initialState: AnalysisState = {
  status: 'idle',
};

type ContentCheckerContextType = {
  analysisState: AnalysisState;
  formAction: (payload: FormData) => void;
  resetAnalysis: () => void;
};

const ContentCheckerContext = createContext<ContentCheckerContextType | null>(
  null
);


function ProviderWithReset({
  children,
}: {
  children: React.ReactNode;
}) {
  // Correct implementation using useState and useTransition to allow for imperative reset
  const [analysisState, setAnalysisState] = React.useState<AnalysisState>(initialState);
  const [pending, startTransition] = React.useTransition();

  const performAction = async (formData: FormData) => {
    const newState = await checkContentAction(analysisState, formData);
    setAnalysisState(newState);
  };
  
  const formActionWithTransition = (formData: FormData) => {
      startTransition(() => {
          performAction(formData);
      });
  };

  const resetAnalysis = () => {
      setAnalysisState(initialState);
  }

  const value = {
      analysisState: {...analysisState, status: pending ? 'loading' : analysisState.status} as AnalysisState,
      formAction: formActionWithTransition,
      resetAnalysis: resetAnalysis,
  }

  return (
    <ContentCheckerContext.Provider value={value}>
      {children}
    </ContentCheckerContext.Provider>
  );
}


export { ProviderWithReset as ContentCheckerProvider };


export function useContentChecker() {
  const context = useContext(ContentCheckerContext);
  if (!context) {
    throw new Error(
      'useContentChecker must be used within a ContentCheckerProvider'
    );
  }
  return context;
}
