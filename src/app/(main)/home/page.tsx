
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  AlertCircle,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  Type,
  Upload,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useFormStatus } from 'react-dom';

import AnalysisResult from '@/components/home/analysis-result';
import TrendingReports from '@/components/home/trending-reports';
import ReportContent from '@/components/home/report-content';
import { useContentChecker } from '@/contexts/content-checker-context';
import { auth } from '@/lib/firebase/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
    >
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Check Content
    </Button>
  );
}

function ContentChecker() {
    const { analysisState, formAction } = useContentChecker();
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('text');
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);
  
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      setImageError(null);
      if (file) {
        if (file.size > 4 * 1024 * 1024) {
          // 4MB limit
          setImageError('File is too large. Maximum size is 4MB.');
          setImagePreview(null);
          event.target.value = ''; // Reset file input
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
    };
  
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Check Content
            </CardTitle>
            <CardDescription>
              Analyze text, a link, or an image for potential misinformation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction}>
                {user && <input type="hidden" name="userId" value={user.uid} />}
              <Tabs
                defaultValue="text"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="text">
                    <Type className="mr-2 h-4 w-4" />
                    Text
                  </TabsTrigger>
                  <TabsTrigger value="link">
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Link
                  </TabsTrigger>
                  <TabsTrigger value="image">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Image
                  </TabsTrigger>
                </TabsList>
  
                <input type="hidden" name="contentType" value={activeTab} />
                <div className="mt-4 min-h-[148px] flex items-center justify-center">
                    <>
                      <TabsContent value="text" className="w-full mt-0">
                        <Textarea
                          name="content"
                          placeholder="Paste text here to check it for misinformation..."
                          rows={5}
                        />
                      </TabsContent>
                      <TabsContent value="link" className="w-full mt-0">
                        <Input name="content" placeholder="https://example.com/article" />
                      </TabsContent>
                      <TabsContent value="image" className="w-full mt-0">
                        <input
                          type="hidden"
                          name="content"
                          value={imagePreview || ''}
                        />
                        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 text-center">
                          <Input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="sr-only"
                          />
                          <label
                            htmlFor="image-upload"
                            className="cursor-pointer space-y-2"
                          >
                            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="font-semibold text-primary">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PNG, JPG, GIF up to 4MB
                            </p>
                          </label>
                          {imagePreview && (
                            <div className="mt-4 relative w-full max-w-xs rounded-md border p-2">
                              <Image
                                src={imagePreview}
                                alt="Image preview"
                                width={200}
                                height={200}
                                className="mx-auto h-auto w-full max-h-48 rounded-sm object-contain"
                              />
                            </div>
                          )}
                          {imageError && (
                            <p className="mt-2 text-sm text-destructive">
                              {imageError}
                            </p>
                          )}
                        </div>
                      </TabsContent>
                    </>
                </div>
              </Tabs>
              <div className="mt-6">
                <SubmitButton />
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

export default function AppRootPage() {
  const { analysisState } = useContentChecker();
  
  return (
      <div className="container mx-auto max-w-7xl p-4 md:p-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 xl:grid-cols-4">
          <div className="lg:col-span-2 xl:col-span-3 space-y-8">
            <ContentChecker />
            
            {analysisState.status === 'error' && analysisState.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{analysisState.error}</AlertDescription>
              </Alert>
            )}
      
            {analysisState.status === 'success' && analysisState.verdict && (
              <AnalysisResult
                verdict={analysisState.verdict}
                explanation={analysisState.explanation}
                evidence={analysisState.evidence}
              />
            )}

            <ReportContent />
          </div>
          <div className="lg:col-span-1 xl:col-span-1">
            <TrendingReports />
          </div>
        </div>
      </div>
  );
}
