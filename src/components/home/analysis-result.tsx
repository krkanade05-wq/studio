
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  BookCheck,
} from 'lucide-react';

type Verdict = 'Likely True' | 'Likely False' | 'Unverifiable';
type Evidence = {
  source: string;
  title: string;
  url: string;
};

interface AnalysisResultProps {
  verdict: Verdict;
  explanation?: string;
  evidence?: Evidence[];
}

const getVerdictIcon = (verdict: Verdict) => {
  switch (verdict) {
    case 'Likely True':
      return <CheckCircle className="h-10 w-10 text-green-500" />;
    case 'Likely False':
      return <XCircle className="h-10 w-10 text-red-500" />;
    case 'Unverifiable':
      return <AlertCircle className="h-10 w-10 text-yellow-500" />;
    default:
      return null;
  }
};

export default function AnalysisResult({
  verdict,
  explanation,
  evidence,
}: AnalysisResultProps) {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Verdict</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 rounded-lg bg-muted p-4">
            {getVerdictIcon(verdict)}
            <div>
              <h3 className="text-xl font-bold">{verdict}</h3>
            </div>
          </div>
        </CardContent>
      </Card>

      {explanation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Explanation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{explanation}</p>
          </CardContent>
        </Card>
      )}

      {evidence && evidence.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookCheck className="h-5 w-5" />
              Evidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {evidence.map((item, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {item.title}
                    </a>
                    <p className="text-sm text-muted-foreground">
                      {item.source}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
