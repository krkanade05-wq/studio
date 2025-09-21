
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Construction } from 'lucide-react';

export default function LearnPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-transparent p-4 md:p-8">
      <main className="w-full max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>Learn to Spot Misinformation</CardTitle>
            <CardDescription>
              This section will provide educational resources to help users identify false information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <Construction className="h-4 w-4" />
              <AlertTitle>Under Construction</AlertTitle>
              <AlertDescription>
                This page is currently being built. Check back soon!
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
