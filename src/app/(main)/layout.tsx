
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
  LayoutDashboard,
  Home,
  LifeBuoy,
  User,
  PanelLeft,
  ShieldCheck,
  Loader2,
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
import { Button } from '@/components/ui/button';
import { getAuth, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { app } from '@/lib/firebase/firebase';
import { useToast } from '@/hooks/use-toast';
import { ContentCheckerProvider } from '@/contexts/content-checker-context';


type LoadingContextType = {
  isLoading: boolean;
  showLoading: (href: string) => void;
  hideLoading: () => void;
};

const LoadingContext = createContext<LoadingContextType | null>(null);

function AuthGuard({ children }: { children: React.ReactNode }) {
    const auth = getAuth(app);
    const router = useRouter();
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            } else {
                router.push('/sign-in');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [auth, router]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    if (!user) {
        return null; // The redirect is handled in the effect
    }

    return <>{children}</>;
}


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


export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const auth = getAuth(app);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/sign-in');
    } catch (error) {
      console.error('Sign Out Error', error);
      toast({
        title: 'Error Signing Out',
        description: 'An unexpected error occurred.',
        variant: 'destructive'
      })
    }
  };

  return (
    <LoadingProvider>
        <AuthGuard>
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
                        <NavButton href="/home" tooltip={{ children: 'Home' }}>
                            <Home />
                            Home
                        </NavButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <NavButton href="/dashboard" tooltip={{ children: 'Dashboard' }}>
                            <LayoutDashboard />
                            Dashboard
                        </NavButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <NavButton href="/dashboard/history" tooltip={{ children: 'History' }}>
                            <History />
                            History
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
                <div className='mt-auto'>
                    <SidebarMenu>
                    <SidebarMenuItem>
                        <Button onClick={handleSignOut} variant="ghost" className="w-full justify-start">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                        </Button>
                    </SidebarMenuItem>
                    </SidebarMenu>
                </div>
                </SidebarContent>
            </Sidebar>
            <SidebarInset>
                <header className="flex h-14 items-center justify-between border-b bg-background px-4 md:hidden">
                <Link href="/home" className="flex items-center gap-2 font-semibold">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                    <span className="">Content Checker</span>
                </Link>
                <SidebarTrigger>
                    <PanelLeft />
                </SidebarTrigger>
                </header>
                <ContentCheckerProvider>
                    <div className="flex-1 overflow-y-auto">{children}</div>
                </ContentCheckerProvider>
            </SidebarInset>
            </SidebarProvider>
        </AuthGuard>
    </LoadingProvider>
  );
}
