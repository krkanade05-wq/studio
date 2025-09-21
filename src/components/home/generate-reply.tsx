
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, BotMessageSquare, ClipboardCopy, Loader2 } from 'lucide-react';
import {
  generateReplyAction,
  type ReplyState,
} from '@/app/actions/generate-reply-action';
import type {
  AnalysisState,
} from '@/app/actions/check-content-action';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useToast } from '@/hooks/use-toast';

type GenerateReplyProps = {
  originalContent?: AnalysisState['originalContent'];
  verdict?: AnalysisState['verdict'];
  explanation?: string;
};

function GenerateButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        'Generate Reply'
      )}
    </Button>
  );
}

export default function GenerateReply({
  originalContent,
  verdict,
  explanation,
}: GenerateReplyProps) {
  const initialState: ReplyState = { status: 'idle' };
  const [state, formAction] = useActionState(generateReplyAction, initialState);
  const { toast } = useToast();

  const handleCopy = () => {
    if (state.reply) {
      navigator.clipboard.writeText(state.reply);
      toast({
        title: 'Copied to Clipboard',
        description: 'The reply has been copied to your clipboard.',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <BotMessageSquare />
            Corrective Reply Generator
        </CardTitle>
        <CardDescription>
          Generate a polite and factual reply to share.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input
            type="hidden"
            name="originalContent"
            value={originalContent ? JSON.stringify(originalContent) : ''}
          />
          <input type="hidden" name="verdict" value={verdict} />
          <input type="hidden" name="explanation" value={explanation} />
          
          <GenerateButton />

          {state.status === 'error' && state.error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {state.status === 'success' && state.reply && (
            <div className="space-y-2 pt-4">
                <div className="relative">
                    <Textarea
                        readOnly
                        value={state.reply}
                        className="min-h-[120px] bg-muted pr-12"
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 h-8 w-8"
                        onClick={handleCopy}
                        type='button'
                    >
                        <ClipboardCopy className="h-4 w-4" />
                        <span className="sr-only">Copy to clipboard</span>
                    </Button>
                </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
