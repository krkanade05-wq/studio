
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LoadingBar } from '@/components/ui/loading-bar';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // When the path changes, a navigation has started.
    setLoading(true);
    const timer = setTimeout(() => {
        // A small delay to allow the new page to render.
        setLoading(false);
    }, 500); // You can adjust the duration as needed

    // This cleanup function will run when the component unmounts
    // or before the effect runs again.
    return () => clearTimeout(timer);
  }, [pathname]);


  return (
    <>
      <LoadingBar loading={loading} />
      <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
        {children}
      </div>
    </>
  );
}
