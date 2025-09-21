

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Search, Scale, Newspaper, Users } from 'lucide-react';

const learningPoints = [
  {
    icon: <Search className="h-5 w-5 text-primary" />,
    title: 'Investigate the Source',
    content:
      'Always check the website, author, and publisher. Look for a clear "About Us" section and contact information. Be wary of unfamiliar sources or sites with a professional-looking but vague mission.',
    tags: ['Source Reliability', 'Credibility'],
  },
  {
    icon: <Newspaper className="h-5 w-5 text-primary" />,
    title: 'Read Beyond the Headline',
    content:
      "Headlines can be sensationalized to get clicks. Read the full article to understand the complete story. A misleading headline doesn't always mean the story is false, but it's a red flag.",
    tags: ['Clickbait', 'Context'],
  },
  {
    icon: <Users className="h-5 w-5 text-primary" />,
    title: 'Check for Bias',
    content:
      'Consider if the source is leaning towards a particular viewpoint. Emotional language, loaded words, and a one-sided perspective can indicate bias. Look for reporting that presents multiple viewpoints.',
    tags: ['Bias', 'Objectivity'],
  },
  {
    icon: <Scale className="h-5 w-5 text-primary" />,
    title: 'Look for Supporting Evidence',
    content:
      'Trustworthy articles cite their sources. Check if the story is being reported by other reputable news outlets. A lack of evidence or sources is a major warning sign.',
    tags: ['Evidence', 'Verification'],
  },
  {
    icon: <CheckCircle className="h-5 w-5 text-primary" />,
    title: 'Verify with Fact-Checkers',
    content:
      'When in doubt, use independent fact-checking organizations like Snopes, PolitiFact, or FactCheck.org to verify claims. This app uses AI to help with this process, but manual verification is a great skill.',
    tags: ['Fact-Checking', 'Third-Party'],
  },
];

export default function LearnPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-transparent">
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto w-full max-w-4xl">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-3xl font-bold">
                Learn to Spot Misinformation
              </CardTitle>
              <CardDescription>
                Empower yourself with the knowledge to identify false or
                misleading content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {learningPoints.map((point, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                      <div className="flex items-center gap-3">
                        {point.icon}
                        {point.title}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 px-2 pt-2 text-base text-muted-foreground">
                      <p>{point.content}</p>
                      <div className="flex flex-wrap gap-2">
                        {point.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

    