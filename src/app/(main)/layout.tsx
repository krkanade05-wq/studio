

'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
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
  Gamepad2,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  createContext,
  useContext,
  useState,
  useTransition,
  useEffect,
  useRef,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';


type LoadingContextType = {
  isLoading: boolean;
  showLoading: (href: string) => void;
  hideLoading: () => void;
};

const LoadingContext = createContext<LoadingContextType | null>(null);

const AuthContext = createContext<{ user: FirebaseUser | null }>({ user: null });

const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

function AuthProvider({ children }: { children: React.ReactNode }) {
    const auth = getAuth(app);
    const router = useRouter();
    const { toast } = useToast();
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const hasShownWelcomeToast = useRef(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                if (!hasShownWelcomeToast.current) {
                    const creationTime = new Date(user.metadata.creationTime || 0).getTime();
                    const lastSignInTime = new Date(user.metadata.lastSignInTime || 0).getTime();

                    const isNewUser = Math.abs(creationTime - lastSignInTime) < 2000; // Check if times are within 2s

                    if (isNewUser) {
                        toast({
                            title: 'Account Created!',
                            description: `Welcome, ${user.displayName || 'User'}!`,
                        });
                    } else {
                        toast({
                            title: 'Sign In Successful',
                            description: `Welcome back, ${user.displayName || 'User'}!`,
                        });
                    }
                    hasShownWelcomeToast.current = true;
                }
            } else {
                router.push('/sign-in');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [auth, router, toast]);

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

    return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
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
  const isActive = pathname === href || (href !== '/home' && pathname.startsWith(href));


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


function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const auth = getAuth(app);
  const { user } = useAuth();

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
            <SidebarProvider>
            <Sidebar>
                <SidebarContent>

                {user && (
                    <div className="p-4 border-b border-sidebar-border">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
                                <AvatarFallback>{user.displayName?.[0] ?? 'U'}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium text-sidebar-primary">{user.displayName}</p>
                                <p className="text-xs text-sidebar-foreground/70">{user.email}</p>
                            </div>
                        </div>
                    </div>
                )}

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
                        <NavButton href="/history" tooltip={{ children: 'History' }}>
                            <History />
                            History
                        </NavButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <NavButton href="/game" tooltip={{ children: 'Game' }}>
                            <Gamepad2 />
                            Game
                        </NavButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <NavButton href="/profile" tooltip={{ children: 'Profile' }}>
                            <User />
                            Profile
                        </NavButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <div className='mt-auto'>
                    <SidebarMenu>
                    <SidebarMenuItem>
                        <NavButton href="/help-and-support" tooltip={{ children: 'Help & Support' }}>
                            <LifeBuoy />
                            Help & Support
                        </NavButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <Button onClick={handleSignOut} variant="ghost" className="w-full justify-start">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                        </Button>
                    </SidebarMenuItem>
                    </SidebarMenu>
                    <Separator className="my-1" />
                     <div className="p-2 text-xs text-center text-sidebar-foreground/50">
                        &copy; 2025 MythBuster AI
                    </div>
                </div>
                </SidebarContent>
            </Sidebar>
            <SidebarInset>
                <header className="flex h-14 items-center justify-between border-b bg-card px-4">
                <div className="flex items-center gap-2 font-semibold">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                    <span className="">MythBuster AI</span>
                </div>
                <div className="md:hidden">
                    <SidebarTrigger>
                        <PanelLeft />
                    </SidebarTrigger>
                </div>
                </header>
                <div className="flex-1 overflow-y-auto">{children}</div>
            </SidebarInset>
            </SidebarProvider>
  );
}

export default function RootAuthLayout({ children }: {children: React.Node}) {
    return (
        <AuthProvider>
            <LoadingProvider>
                <ContentCheckerProvider>
                    <MainLayout>
                        {children}
                    </MainLayout>
                </ContentCheckerProvider>
            </LoadingProvider>
        </AuthProvider>
    );
}
