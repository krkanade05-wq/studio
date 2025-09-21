
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    AlertCircle,
    CheckCircle,
    FileText,
    HelpCircle,
    Loader2,
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

type HistoryItem = {
    id: string;
    verdict: 'Likely True' | 'Likely False' | 'Unverifiable';
    timestamp: Timestamp;
};

type MonthlyCheck = {
    month: string;
    count: number;
};

type MonthlyVerdict = {
    month: string;
    'Likely True': number;
    'Likely False': number;
    'Unverifiable': number;
}

const processHistoryData = (items: HistoryItem[]) => {
    const monthlyChecks: { [key: string]: number } = {};
    const monthlyVerdicts: { [key: string]: { 'Likely True': number; 'Likely False': number; 'Unverifiable': number; } } = {};

    items.forEach(item => {
        const date = item.timestamp.toDate();
        const month = date.toLocaleString('default', { month: 'short', year: '2-digit' });
        
        // Aggregate checks per month
        if (!monthlyChecks[month]) {
            monthlyChecks[month] = 0;
        }
        monthlyChecks[month]++;

        // Aggregate verdicts per month
        if (!monthlyVerdicts[month]) {
            monthlyVerdicts[month] = { 'Likely True': 0, 'Likely False': 0, 'Unverifiable': 0 };
        }
        monthlyVerdicts[month][item.verdict]++;
    });

    const sortedMonths = Object.keys(monthlyChecks).sort((a, b) => {
        const [aMonth, aYear] = a.split(' ');
        const [bMonth, bYear] = b.split(' ');
        if (aYear !== bYear) return parseInt(aYear) - parseInt(bYear);
        const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
    });

    const checksChartData: MonthlyCheck[] = sortedMonths.map(month => ({ month, count: monthlyChecks[month] }));
    const verdictsChartData: MonthlyVerdict[] = sortedMonths.map(month => ({ month, ...monthlyVerdicts[month] }));

    return { checksChartData, verdictsChartData };
};


const chartConfig = {
  count: {
    label: 'Checks',
    color: 'hsl(var(--primary))',
  },
  'Likely True': {
    label: 'Likely True',
    color: 'hsl(var(--chart-2))',
  },
  'Likely False': {
    label: 'Likely False',
    color: 'hsl(var(--destructive))',
  },
  'Unverifiable': {
    label: 'Unverifiable',
    color: 'hsl(var(--chart-4))',
  },
};

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [totalReports, setTotalReports] = useState(0);
    const [likelyTrue, setLikelyTrue] = useState(0);
    const [likelyFalse, setLikelyFalse] = useState(0);
    const [unverifiable, setUnverifiable] = useState(0);

    const { checksChartData, verdictsChartData } = processHistoryData(history);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(!currentUser);
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, `users/${user.uid}/history`));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const items: HistoryItem[] = [];
            let trueCount = 0;
            let falseCount = 0;
            let unverifiableCount = 0;

            querySnapshot.forEach((doc) => {
                const data = doc.data() as Omit<HistoryItem, 'id'>;
                items.push({ id: doc.id, ...data });
                if (data.verdict === 'Likely True') trueCount++;
                else if (data.verdict === 'Likely False') falseCount++;
                else if (data.verdict === 'Unverifiable') unverifiableCount++;
            });

            setHistory(items);
            setTotalReports(items.length);
            setLikelyTrue(trueCount);
            setLikelyFalse(falseCount);
            setUnverifiable(unverifiableCount);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    if (loading) {
        return (
            <div className="flex min-h-screen w-full flex-col items-center justify-center bg-transparent p-4 md:p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
  return (
    <div className="flex min-h-screen w-full flex-col bg-transparent">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Checks
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalReports}</div>
              <p className="text-xs text-muted-foreground">
                Total content checks performed.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Likely True
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{likelyTrue}</div>
               <p className="text-xs text-muted-foreground">
                Checks identified as likely true.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Likely False
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{likelyFalse}</div>
                <p className="text-xs text-muted-foreground">
                    Checks identified as likely false.
                </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Unverifiable
              </CardTitle>
              <HelpCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unverifiable}</div>
              <p className="text-xs text-muted-foreground">
                Checks that could not be verified.
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Checks by Month</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <BarChart data={checksChartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis />
                  <Tooltip
                    content={<ChartTooltipContent />}
                    cursor={false}
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--color-count)"
                    radius={4}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Verdicts Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <LineChart data={verdictsChartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis />
                  <Tooltip
                    content={<ChartTooltipContent />}
                    cursor={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Likely True"
                    stroke="var(--color-Likely True)"
                    strokeWidth={2}
                    dot={false}
                  />
                   <Line
                    type="monotone"
                    dataKey="Likely False"
                    stroke="var(--color-Likely False)"
                    strokeWidth={2}
                    dot={false}
                  />
                   <Line
                    type="monotone"
                    dataKey="Unverifiable"
                    stroke="var(--color-Unverifiable)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

    