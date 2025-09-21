'use client';

import { useEffect, useState } from 'react';
import { getGoogleSignInOffer } from '@/app/actions/auth';
import { GoogleSignInButton } from './google-signin-button';
import { Skeleton } from '../ui/skeleton';

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
    return (
      <Skeleton className="h-10 w-full" />
    );
  }

  return <GoogleSignInButton offerGoogleSignIn={offerGoogleSignIn} />;
}
