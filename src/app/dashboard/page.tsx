
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
import { Upload, CheckCircle, XCircle, AlertCircle, BarChart, FileText, Link as LinkIcon, Loader2, Flag } from 'lucide-react';
import { analyzeContent, AnalyzeContentOutput } from '@/ai/flows/analyze-content-flow';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { toast } = useToast();
  const auth = getAuth(app);
  const router = useRouter();
  const [analysisResult, setAnalysisResult] = useState<AnalyzeContentOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('text');
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);


  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/sign-in');
    } catch (error) {
      console.error('Sign Out Error', error);
      toast({
        title: 'Error Signing Out',
        description: 'An unexpected error occurred.',
        variant: 'destructive'
      })
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleCheck = async () => {
    let input = {};
    if (activeTab === 'text' && textInput) {
      input = { text: textInput };
    } else if (activeTab === 'url' && urlInput) {
      input = { url: urlInput };
    } else if (activeTab === 'image' && imageFile) {
      try {
        const photoDataUri = await fileToDataUri(imageFile);
        input = { photoDataUri };
      } catch (error) {
        toast({ title: 'Error', description: 'Could not process image file.', variant: 'destructive' });
        return;
      }
    } else {
      toast({ title: 'Input Required', description: 'Please provide content to analyze.' });
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const result = await analyzeContent(input);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis Error', error);
      toast({ title: 'Analysis Failed', description: 'Could not analyze the content.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  const getVerdictIcon = (verdict?: string) => {
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
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
       <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
        <div className="flex w-full items-center justify-end">
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8 grid lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Check Content</CardTitle>
              <CardDescription>
                Paste text, enter a URL, or upload an image to analyze its
                veracity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="text" onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="text"><FileText className="h-4 w-4 mr-2"/>Text</TabsTrigger>
                  <TabsTrigger value="url"><LinkIcon className="h-4 w-4 mr-2"/>URL</TabsTrigger>
                  <TabsTrigger value="image"><Upload className="h-4 w-4 mr-2"/>Image</TabsTrigger>
                </TabsList>
                <TabsContent value="text" className="mt-4">
                  <Textarea
                    placeholder="Paste your text here..."
                    className="min-h-[200px] text-base"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                  />
                </TabsContent>
                <TabsContent value="url" className="mt-4">
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                </TabsContent>
                <TabsContent value="image" className="mt-4">
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                            {imagePreview ? (
                              <img src={imagePreview} alt="Preview" className="h-full w-full object-contain rounded-lg" />
                            ) : (
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                  <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                  <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP</p>
                              </div>
                            )}
                            <input id="dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
                        </label>
                    </div> 
                </TabsContent>
              </Tabs>
              <Button onClick={handleCheck} disabled={isLoading} className="w-full mt-6 text-lg py-6">
                {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...</> : 'Check'}
              </Button>
            </CardContent>
          </Card>

          {isLoading && !analysisResult && (
             <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Analysis in Progress</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center items-center py-16">
                 <Loader2 className="h-12 w-12 animate-spin text-primary"/>
              </CardContent>
            </Card>
          )}

          {analysisResult && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Analysis Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4 p-4 rounded-lg bg-muted">
                  {getVerdictIcon(analysisResult.verdict)}
                  <div>
                    <h3 className="text-xl font-bold">{analysisResult.verdict}</h3>
                    {analysisResult.confidence && <p className="text-muted-foreground">Confidence: {analysisResult.confidence}%</p>}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-2">Explanation</h4>
                  <p className="text-muted-foreground">{analysisResult.explanation}</p>
                </div>

                {analysisResult.evidence && analysisResult.evidence.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Evidence</h4>
                    <ul className="space-y-3">
                      {analysisResult.evidence.map((item, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                          <div>
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline-offset-4 hover:underline">
                              {item.title}
                            </a>
                            <p className="text-sm text-muted-foreground">{item.source}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive/5 hover:text-destructive">
                  <Flag className="mr-2 h-4 w-4" /> Report as Misinformation
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1 space-y-8">
          <Card className="shadow-sm">
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
