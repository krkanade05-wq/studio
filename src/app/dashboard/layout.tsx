

'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  LifeBuoy,
  User,
  PanelLeft,
  ShieldCheck,
  Loader2,
  Home,
  LogOut,
  History,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  createContext,
  useContext,
  useState,
  useTransition,
  useEffect,
} from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '@/lib/firebase/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

type LoadingContextType = {
  isLoading: boolean;
  showLoading: (href: string) => void;
  hideLoading: () => void;
};

const LoadingContext = createContext<LoadingContextType | null>(null);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const showLoading = (href: string) => {
    if (href !== pathname) {
      setIsLoading(true);
      startTransition(() => {
        router.push(href);
      });
    }
  };

  const hideLoading = () => {
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isPending) {
        setIsLoading(false);
    }
  }, [isPending, pathname]);


  return (
    <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading }}>
      {children}
      <LoadingPopup
        isOpen={isLoading}
        onCancel={hideLoading}
      />
    </LoadingContext.Provider>
  );
}

function LoadingPopup({
  isOpen,
  onCancel,
}: {
  isOpen: boolean;
  onCancel: () => void;
}) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center justify-center text-center">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            Loading Page...
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center pt-2">
            Please wait while we navigate to the next page.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-center">
            <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

const NavButton = ({ href, children, tooltip }: { href: string; children: React.ReactNode, tooltip: {children: string} }) => {
  const pathname = usePathname();
  const { showLoading } = useLoading();
  const isActive = pathname.startsWith(href);


  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (pathname !== href) {
      showLoading(href);
    }
  };

  return (
    <SidebarMenuButton
      asChild
      isActive={isActive}
      tooltip={tooltip}
      onClick={handleClick}
    >
      <Link href={href}>
        {children}
      </Link>
    </SidebarMenuButton>
  );
};


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 overflow-y-auto">{children}</div>
  );
}
