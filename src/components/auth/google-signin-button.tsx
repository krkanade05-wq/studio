'use client';

import { useRouter } from 'next/navigation';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { app } from '@/lib/firebase/firebase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const GoogleIcon = () => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
  >
    <title>Google</title>
    <path
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 2.04-4.82 2.04-5.82 0-9.6-4.82-9.6-10.62s3.78-10.62 9.6-10.62c3.33 0 5.38 1.38 6.68 2.62l2.34-2.34C19.83 2.96 16.83 2 12.48 2 5.9 2 1 6.8 1 13.38s4.9 11.38 11.48 11.38c6.12 0 9.2-4.12 9.2-9.56 0-.75-.08-1.42-.2-2.08h-9z"
      fill="currentColor"
    />
  </svg>
);

export function GoogleSignInButton({
  offerGoogleSignIn,
}: {
  offerGoogleSignIn: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      // The signed-in user info.
      const user = result.user;
      
      toast({
        title: 'Sign In Successful',
        description: `Welcome, ${user.displayName || 'User'}!`,
      });
      router.push('/home');
    } catch (error: any) {
      console.error('Google Sign-In Error', error);
      // Handle specific errors
      let description = 'Could not sign in with Google. Please try again.';
      if (error.code === 'auth/popup-closed-by-user') {
        description = 'Sign-in popup was closed before completing. Please try again.';
      } else if (error.code === 'auth/network-request-failed') {
          description = 'A network error occurred. Please check your connection and try again.'
      }
      
      toast({
        title: 'Sign In Failed',
        description: description,
        variant: 'destructive',
      });
    }
  };

  if (!offerGoogleSignIn) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleSignIn}
    >
      <GoogleIcon />
      <span className="ml-2">Continue with Google</span>
    </Button>
  );
}
