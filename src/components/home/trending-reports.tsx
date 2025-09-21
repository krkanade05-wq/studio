
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, BarChart } from 'lucide-react';

export default function TrendingReports() {
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
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Feature Coming Soon!</AlertTitle>
          <AlertDescription>
            The trending reports panel is under construction.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
