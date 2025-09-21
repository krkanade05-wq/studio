
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
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  AlertCircle,
  History as HistoryIcon,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';

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
  const [allHistory, setAllHistory] = useState<HistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const [filterType, setFilterType] = useState('all');
  const [lastN, setLastN] = useState('5');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

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
        setAllHistory(items);
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

  useEffect(() => {
    let newFilteredHistory = [...allHistory];
    if (filterType === 'lastN') {
      newFilteredHistory = allHistory.slice(0, parseInt(lastN, 10));
    } else if (filterType === 'dateRange' && dateRange?.from && dateRange?.to) {
      newFilteredHistory = allHistory.filter((item) => {
        const itemDate = item.timestamp.toDate();
        return itemDate >= dateRange.from! && itemDate <= dateRange.to!;
      });
    }
    setFilteredHistory(newFilteredHistory);
  }, [allHistory, filterType, lastN, dateRange]);

  const renderQuery = (item: HistoryItem) => {
    if (item.text) {
      return (
        <p className="truncate text-sm text-muted-foreground">
          Text: {item.text}
        </p>
      );
    }
    if (item.url) {
      return (
        <p className="truncate text-sm text-muted-foreground">
          URL:{' '}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {item.url}
          </a>
        </p>
      );
    }
    return <p className="text-sm text-muted-foreground">Image Analysis</p>;
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-transparent p-4 md:p-8">
      <main className="mx-auto w-full max-w-4xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <HistoryIcon className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Check History</h1>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All History</SelectItem>
                <SelectItem value="lastN">Last N Checks</SelectItem>
                <SelectItem value="dateRange">Date Range</SelectItem>
              </SelectContent>
            </Select>
            {filterType === 'lastN' && (
              <Select value={lastN} onValueChange={setLastN}>
                <SelectTrigger className="w-full sm:w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Last 5</SelectItem>
                  <SelectItem value="10">Last 10</SelectItem>
                </SelectContent>
              </Select>
            )}
            {filterType === 'dateRange' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={'outline'}
                    className="w-full justify-start text-left font-normal sm:w-auto"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'LLL dd, y')} -{' '}
                          {format(dateRange.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(dateRange.from, 'LLL dd, y')
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        {loading && (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {!loading && error && (
          <Card className="border-destructive bg-destructive/10">
            <CardHeader className="flex-row items-center gap-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <CardTitle className="text-destructive">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && filteredHistory.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No History Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {filterType === 'all'
                  ? "You haven't checked any content yet. Your history will appear here."
                  : 'No history entries match your filter criteria.'}
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && filteredHistory.length > 0 && (
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
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
                  <p className="text-sm text-muted-foreground">
                    {item.explanation}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
