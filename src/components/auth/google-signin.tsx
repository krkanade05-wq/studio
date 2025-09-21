import { headers } from 'next/headers';
import { shouldOfferGoogleSignIn } from '@/ai/flows/conditional-google-sign-in';
import { GoogleSignInButton } from './google-signin-button';

export async function GoogleSignIn() {
  const headerList = headers();
  const countryCode = headerList.get('x-vercel-ip-country') || 'US';

  let offerGoogleSignIn = true;
  let reason = '';

  try {
    const result = await shouldOfferGoogleSignIn({ countryCode });
    offerGoogleSignIn = result.offerGoogleSignIn;
    reason = result.reason || '';
  } catch (error) {
    console.error('Failed to check Google Sign-In availability:', error);
    // Default to showing the button if the AI check fails, to not block users.
    offerGoogleSignIn = true;
  }

  if (!offerGoogleSignIn) {
    console.log(
      `Google Sign-In not offered for country ${countryCode}. Reason: ${reason}`
    );
  }

  return <GoogleSignInButton offerGoogleSignIn={offerGoogleSignIn} />;
}
