'use server';

import { headers } from 'next/headers';
import {
  shouldOfferGoogleSignIn,
  ShouldOfferGoogleSignInOutput,
} from '@/ai/flows/conditional-google-sign-in';

export async function getGoogleSignInOffer(): Promise<ShouldOfferGoogleSignInOutput> {
  const headerList = headers();
  const countryCode = headerList.get('x-vercel-ip-country') || 'US';

  try {
    const result = await shouldOfferGoogleSignIn({ countryCode });
    return result;
  } catch (error) {
    console.error('Failed to check Google Sign-In availability:', error);
    // Default to showing the button if the AI check fails, to not block users.
    return { offerGoogleSignIn: true, reason: 'AI check failed' };
  }
}
