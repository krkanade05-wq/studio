
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, useLayoutEffect } from 'react';
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

  // Use useLayoutEffect to immediately trigger state change before the browser paints
  useLayoutEffect(() => {
    if (pathname !== previousPath) {
      setLoading(true);
      // Update previousPath here to ensure it's set for the next navigation
      setPreviousPath(pathname);
    }
  }, [pathname, previousPath]);
  
  useEffect(() => {
      // This effect runs after the page component has rendered and painted.
      // We can safely turn off the loading indicator here.
      if (loading) {
          setLoading(false);
      }
  }, [pathname, loading]); // This effect depends on the pathname, so it runs after navigation


  return (
    <>
      <LoadingPopup isOpen={loading} />
      <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
        {children}
      </div>
    </>
  );
}
