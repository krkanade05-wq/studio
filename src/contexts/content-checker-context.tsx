
'use client';

import { createContext, useContext, useActionState } from 'react';
import { checkContentAction, type AnalysisState } from '@/app/actions/check-content-action';

type ContentCheckerContextType = {
  analysisState: AnalysisState;
  formAction: (payload: FormData) => void;
};

const ContentCheckerContext = createContext<ContentCheckerContextType | null>(
  null
);

export function ContentCheckerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [analysisState, formAction] = useActionState(checkContentAction, {
    status: 'idle',
  });

  return (
    <ContentCheckerContext.Provider value={{ analysisState, formAction }}>
      {children}
    </ContentCheckerContext.Provider>
  );
}

export function useContentChecker() {
  const context = useContext(ContentCheckerContext);
  if (!context) {
    throw new Error(
      'useContentChecker must be used within a ContentCheckerProvider'
    );
  }
  return context;
}
