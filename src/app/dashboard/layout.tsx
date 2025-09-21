
'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  FileText,
  LayoutDashboard,
  LifeBuoy,
  User,
  PanelLeft,
  ShieldCheck,
  Loader2,
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

type LoadingContextType = {
  isLoading: boolean;
  showLoading: (href: string) => void;
  hideLoading: () => void;
};

const LoadingContext = createContext<LoadingContextType | null>(null);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const showLoading = (href: string) => {
    if (href !== pathname) {
      setPendingRoute(href);
      setIsLoading(true);
      startTransition(() => {
        router.push(href);
      });
    }
  };

  const hideLoading = () => {
    // This is a simplified cancel. In a real scenario, you'd need to manage router events.
    setIsLoading(false);
    setPendingRoute(null);
  };

  useEffect(() => {
    if (!isPending) {
        setIsLoading(false);
        setPendingRoute(null);
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
  const isActive = pathname === href;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (!isActive) {
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
    <LoadingProvider>
        <SidebarProvider>
        <Sidebar>
            <SidebarContent>
            <SidebarHeader>
                <div className="flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold">Content Checker</h1>
                </div>
            </SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <NavButton href="/dashboard" tooltip={{ children: 'Dashboard' }}>
                        <LayoutDashboard />
                        Dashboard
                    </NavButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <NavButton href="/dashboard/report-content" tooltip={{ children: 'Report Content' }}>
                        <FileText />
                        Report Content
                    </NavButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                     <NavButton href="/dashboard/learn" tooltip={{ children: 'Learn' }}>
                        <LifeBuoy />
                        Learn
                    </NavButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <NavButton href="/dashboard/profile" tooltip={{ children: 'Profile' }}>
                        <User />
                        Profile
                    </NavButton>
                </SidebarMenuItem>
            </SidebarMenu>
            </SidebarContent>
        </Sidebar>
        <SidebarInset>
            <header className="flex h-14 items-center justify-between border-b bg-background px-4 md:hidden">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <span className="">Content Checker</span>
            </Link>
            <SidebarTrigger>
                <PanelLeft />
            </SidebarTrigger>
            </header>
            <div className="flex-1 overflow-y-auto">{children}</div>
        </SidebarInset>
        </SidebarProvider>
    </LoadingProvider>
  );
}
