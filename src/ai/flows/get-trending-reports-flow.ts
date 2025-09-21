
'use server';

/**
 * @fileOverview A Genkit flow to get trending reported content.
 *
 * - getTrendingReports - A function that fetches and aggregates reports.
 * - TrendingReport - The output type for a single trending report.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';

const TrendingReportSchema = z.object({
  content: z.string().describe('The reported content (text or URL).'),
  count: z.number().describe('The number of times this content was reported.'),
});

export type TrendingReport = z.infer<typeof TrendingReportSchema>;

const GetTrendingReportsOutputSchema = z.array(TrendingReportSchema);

export async function getTrendingReports(): Promise<TrendingReport[]> {
  return getTrendingReportsFlow();
}

const getTrendingReportsFlow = ai.defineFlow(
  {
    name: 'getTrendingReportsFlow',
    outputSchema: GetTrendingReportsOutputSchema,
  },
  async () => {
    // 1. Calculate the timestamp for 24 hours ago
    const twentyFourHoursAgo = Timestamp.fromMillis(
      Date.now() - 24 * 60 * 60 * 1000
    );

    // 2. Query the 'reports' collection for documents in the last 24 hours
    const q = query(
      collection(db, 'reports'),
      where('timestamp', '>=', twentyFourHoursAgo)
    );
    const querySnapshot = await getDocs(q);

    // 3. Aggregate the report counts
    const reportCounts: { [content: string]: number } = {};
    querySnapshot.forEach((doc) => {
      const content = doc.data().content;
      if (content) {
        reportCounts[content] = (reportCounts[content] || 0) + 1;
      }
    });

    // 4. Convert to an array, sort by count, and take the top 5
    const sortedReports = Object.entries(reportCounts)
      .map(([content, count]) => ({ content, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return sortedReports;
  }
);

    