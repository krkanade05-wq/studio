
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';

export function LoadingPopup({ isOpen }: { isOpen: boolean }) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center justify-center text-center">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            Loading Page...
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center pt-2">
            Please wait a moment.
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [previousPath, setPreviousPath] = useState(pathname);

  useEffect(() => {
    if (pathname !== previousPath) {
      setLoading(true);
    }
  }, [pathname, previousPath]);
  
  useEffect(() => {
      // This effect runs after the page component has rendered.
      // We can safely turn off the loading indicator here.
      if (loading) {
          setLoading(false);
          setPreviousPath(pathname);
      }
  }, [pathname, loading]);


  return (
    <>
      <LoadingPopup isOpen={loading} />
      <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
        {children}
      </div>
    </>
  );
}
