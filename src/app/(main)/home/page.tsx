

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
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  AlertCircle,
  Flag,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  Type,
  Upload,
  BarChart,
  Clock,
} from 'lucide-react';
import { useState, useEffect, useActionState, useRef } from 'react';
import Image from 'next/image';
import { useFormStatus } from 'react-dom';
import { usePathname } from 'next/navigation';

import AnalysisResult from '@/components/home/analysis-result';
import GenerateReply from '@/components/home/generate-reply';
import { useContentChecker } from '@/contexts/content-checker-context';
import { auth } from '@/lib/firebase/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { reportContentAction, ReportState } from '@/app/actions/report-content-action';
import { Label } from '@/components/ui/label';
import { getTrendingReports } from '@/ai/flows/get-trending-reports-flow';
import type { TrendingReport } from '@/ai/flows/get-trending-reports-flow';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { formatDistanceToNow } from 'date-fns';

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
    const { analysisState, formAction, resetAnalysis } = useContentChecker();
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('text');
    const [user, setUser] = useState<User | null>(null);

    const pathname = usePathname();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        // Reset analysis when navigating away
        return () => {
            if (pathname !== '/home') {
                resetAnalysis();
            }
        };
    }, [pathname, resetAnalysis]);

    const handleTabChange = (value: string) => {
      setActiveTab(value);
      resetAnalysis();
      setImagePreview(null);
      setImageError(null);
    };
  
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
                 {analysisState.originalContent && <input type="hidden" name="originalContent" value={JSON.stringify(analysisState.originalContent)} />}

              <Tabs
                defaultValue="text"
                value={activeTab}
                onValueChange={handleTabChange}
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

function ReportContent() {
    const initialState: ReportState = { status: 'idle' };
    const [state, formAction] = useActionState(reportContentAction, initialState);
    
    const [user, setUser] = useState<User | null>(null);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (state.status === 'success') {
            setShowSuccessDialog(true);
            formRef.current?.reset();
        }
    }, [state]);

    // useFormStatus needs to be used within a form
    function ReportButton() {
        const { pending } = useFormStatus();
        return (
             <Button type="submit" disabled={pending || !user} className="w-full">
                {pending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Flag className="mr-2 h-4 w-4" />
                )}
                Report
            </Button>
        )
    }

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Report Content</CardTitle>
        <CardDescription>
          If you believe content is misleading or spam, please report it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-4">
            {user && <input type="hidden" name="userId" value={user.uid} />}
            <div className="space-y-2">
                <Label htmlFor="report-content">Content to Report</Label>
                <Textarea
                    id="report-content"
                    name="content"
                    placeholder="Paste text, news URLs, etc."
                    className="min-h-[150px]"
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="report-description">Description (Optional)</Label>
                <Textarea
                    id="report-description"
                    name="description"
                    placeholder="Why do you want to report this content?"
                />
            </div>
            <ReportButton />
            {state.status === 'error' && state.message && (
                <p className="text-sm text-destructive">{state.message}</p>
            )}
        </form>
      </CardContent>
    </Card>

    <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Report Submitted</AlertDialogTitle>
                <AlertDialogDescription>
                    Thank you for reporting.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogAction onClick={() => setShowSuccessDialog(false)}>
                Close
            </AlertDialogAction>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}


function TrendingReports() {
  const [trending, setTrending] = useState<TrendingReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const reports = await getTrendingReports();
        setTrending(reports);
      } catch (err) {
        console.error('Error fetching trending reports:', err);
        setError('Could not load trending reports.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
    const interval = setInterval(fetchTrending, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp: string) => {
    if (timestamp) {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    }
    return 'N/A';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart className="mr-2 h-5 w-5" />
          Trending Reports
        </CardTitle>
        <CardDescription>
          Most reported content in the last 24 hours.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-24">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : trending.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Trending Reports</AlertTitle>
            <AlertDescription>
              There are no trending reports in the last 24 hours.
            </AlertDescription>
          </Alert>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {trending.map((report, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger>
                  <div className="flex w-full items-center justify-between pr-4 text-left">
                    <p className="flex-1 text-sm font-medium text-left break-all">
                      {report.content}
                    </p>
                    <Badge variant="secondary" className="ml-2 flex-shrink-0">{report.count} reports</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-1.5 h-3 w-3" />
                    Last reported: {formatTimestamp(report.lastReportedAt)}
                  </div>
                   <div className="space-y-3">
                    {report.details.map((detail, detailIndex) => (
                       detail.description ? (
                         <div key={detailIndex} className="text-sm text-muted-foreground border-l-2 pl-3">
                           <p className="italic">&quot;{detail.description}&quot;</p>
                           <p className="text-xs mt-1">{formatTimestamp(detail.reportedAt)}</p>
                         </div>
                       ) : null
                    ))}
                   </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
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
              <>
                <AnalysisResult
                  verdict={analysisState.verdict}
                  explanation={analysisState.explanation}
                  evidence={analysisState.evidence}
                />
                <GenerateReply
                  originalContent={analysisState.originalContent}
                  verdict={analysisState.verdict}
                  explanation={analysisState.explanation}
                />
              </>
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
