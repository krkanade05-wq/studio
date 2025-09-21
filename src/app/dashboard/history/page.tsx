
'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, History as HistoryIcon } from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';

type HistoryItem = {
  id: string;
  verdict: 'Likely True' | 'Likely False' | 'Unverifiable';
  explanation: string;
  timestamp: Timestamp;
  text?: string;
  url?: string;
};

const getVerdictBadgeVariant = (
  verdict: HistoryItem['verdict']
): 'default' | 'destructive' | 'secondary' => {
  switch (verdict) {
    case 'Likely True':
      return 'default';
    case 'Likely False':
      return 'destructive';
    case 'Unverifiable':
      return 'secondary';
  }
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, `users/${user.uid}/history`),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const items: HistoryItem[] = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as HistoryItem);
        });
        setHistory(items);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError('Failed to load history.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const renderQuery = (item: HistoryItem) => {
    if (item.text) {
      return <p className="text-sm text-muted-foreground truncate">Text: {item.text}</p>;
    }
    if (item.url) {
      return <p className="text-sm text-muted-foreground truncate">URL: <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{item.url}</a></p>;
    }
    return <p className="text-sm text-muted-foreground">Image Analysis</p>;
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-transparent p-4 md:p-8">
      <main className="mx-auto w-full max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <HistoryIcon className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Check History</h1>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {!loading && error && (
          <Card className="bg-destructive/10 border-destructive">
            <CardHeader className="flex-row items-center gap-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <CardTitle className="text-destructive">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && history.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No History Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You haven&apos;t checked any content yet. Your history will appear here.
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && history.length > 0 && (
          <div className="space-y-4">
            {history.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="mb-1">{renderQuery(item)}</CardTitle>
                      <CardDescription>
                        {item.timestamp?.toDate().toLocaleString()}
                      </CardDescription>
                    </div>
                    <Badge variant={getVerdictBadgeVariant(item.verdict)}>
                      {item.verdict}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.explanation}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
