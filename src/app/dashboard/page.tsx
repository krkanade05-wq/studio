'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '@/lib/firebase/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, CheckCircle, XCircle, AlertCircle, BarChart, FileText, Link as LinkIcon } from 'lucide-react';

export default function DashboardPage() {
  const auth = getAuth(app);
  const router = useRouter();
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/sign-in');
    } catch (error) {
      console.error('Sign Out Error', error);
    }
  };

  const handleCheck = async () => {
    setIsLoading(true);
    // AI logic will go here
    // For now, simulate a result
    setTimeout(() => {
      setAnalysisResult({
        verdict: 'Likely False',
        confidence: 85,
        explanation: 'The claims in the text are not supported by evidence from reputable sources. The language used is emotionally charged and uses several logical fallacies.',
        evidence: [
          { source: 'FactCheck.org', title: 'Article debunking similar claims', url: '#' },
          { source: 'Reuters', title: 'Fact Check: Viral image is digitally altered', url: '#' },
        ]
      });
      setIsLoading(false);
    }, 2000);
  }

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'Likely True':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'Likely False':
        return <XCircle className="h-12 w-12 text-red-500" />;
      case 'Unverifiable':
        return <AlertCircle className="h-12 w-12 text-yellow-500" />;
      default:
        return null;
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4 md:p-8">
      <header className="w-full max-w-5xl flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Content Checker</h1>
        <Button onClick={handleSignOut} variant="outline">
          Sign Out
        </Button>
      </header>

      <main className="w-full max-w-5xl grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Check Content</CardTitle>
              <CardDescription>
                Paste text, enter a URL, or upload an image to analyze its
                veracity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="text"><FileText className="h-4 w-4 mr-2"/>Text</TabsTrigger>
                  <TabsTrigger value="url"><LinkIcon className="h-4 w-4 mr-2"/>URL</TabsTrigger>
                  <TabsTrigger value="image"><Upload className="h-4 w-4 mr-2"/>Image</TabsTrigger>
                </TabsList>
                <TabsContent value="text" className="mt-4">
                  <Textarea
                    placeholder="Paste your text here..."
                    className="min-h-[200px]"
                  />
                </TabsContent>
                <TabsContent value="url" className="mt-4">
                  <Input
                    type="url"
                    placeholder="https://example.com"
                  />
                </TabsContent>
                <TabsContent value="image" className="mt-4">
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-muted-foreground">PNG, JPG, or GIF (MAX. 800x400px)</p>
                            </div>
                            <input id="dropzone-file" type="file" className="hidden" />
                        </label>
                    </div> 
                </TabsContent>
              </Tabs>
              <Button onClick={handleCheck} disabled={isLoading} className="w-full mt-6">
                {isLoading ? 'Analyzing...' : 'Check'}
              </Button>
            </CardContent>
          </Card>

          {analysisResult && (
            <Card>
              <CardHeader>
                <CardTitle>Analysis Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4 p-4 rounded-lg bg-muted">
                  {getVerdictIcon(analysisResult.verdict)}
                  <div>
                    <h3 className="text-2xl font-bold">{analysisResult.verdict}</h3>
                    <p className="text-lg text-muted-foreground">Confidence: {analysisResult.confidence}%</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-2">Explanation</h4>
                  <p className="text-muted-foreground">{analysisResult.explanation}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-2">Evidence</h4>
                  <ul className="space-y-2">
                    {analysisResult.evidence.map((item: any, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-medium underline hover:text-primary">
                            {item.title}
                          </a>
                          <p className="text-sm text-muted-foreground">{item.source}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button variant="destructive" className="w-full">Report as Spam</Button>
              </CardContent>
            </Card>
          )}

        </div>

        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="h-5 w-5 mr-2" />
                Trending Reports
              </CardTitle>
              <CardDescription>
                Most reported content in the last 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Feature Coming Soon!</AlertTitle>
                <AlertDescription>
                  The trending reports panel is under construction.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
