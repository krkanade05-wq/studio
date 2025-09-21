'use client';

import { useEffect, useState } from 'react';
import { getGoogleSignInOffer } from '@/app/actions/auth';
import { GoogleSignInButton } from './google-signin-button';

export function GoogleSignIn() {
  const [offerGoogleSignIn, setOfferGoogleSignIn] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    getGoogleSignInOffer().then((result) => {
      setOfferGoogleSignIn(result.offerGoogleSignIn);
      if (!result.offerGoogleSignIn) {
        console.log(
          `Google Sign-In not offered. Reason: ${result.reason}`
        );
      }
    });
  }, []);

  if (offerGoogleSignIn === null) {
    // You can render a skeleton or loader here
    return (
      <div className="h-10 w-full animate-pulse rounded-md bg-muted"></div>
    );
  }

  return <GoogleSignInButton offerGoogleSignIn={offerGoogleSignIn} />;
}
