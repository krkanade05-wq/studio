
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Flag } from 'lucide-react';

export default function ReportContent() {
  const { toast } = useToast();

  const handleReport = () => {
    // TODO: Implement report submission logic
    toast({
      title: 'Report Submitted',
      description: 'Thank you for your feedback.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Content</CardTitle>
        <CardDescription>
          If you believe content is misleading or spam, please report it.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="report-content">Content to Report</Label>
          <Textarea
            id="report-content"
            placeholder="Paste text, news URLs, etc."
            className="min-h-[150px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="report-description">Description (Optional)</Label>
          <Textarea
            id="report-description"
            placeholder="Why do you want to report this content?"
          />
        </div>
        <Button onClick={handleReport} className="w-full">
          <Flag className="mr-2 h-4 w-4" />
          Report
        </Button>
      </CardContent>
    </Card>
  );
}
