'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { app } from '@/lib/firebase/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const auth = getAuth(app);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/sign-in');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/sign-in');
    } catch (error) {
      console.error('Sign Out Error', error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Or a redirect component
  }
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
            <AvatarFallback className="text-3xl">
              {getInitials(user.displayName)}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl font-headline">Welcome!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-lg">
            <p>Hello, <span className="font-semibold">{user.displayName || 'User'}</span>!</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <Button onClick={handleSignOut} className="w-full max-w-xs mx-auto">
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
