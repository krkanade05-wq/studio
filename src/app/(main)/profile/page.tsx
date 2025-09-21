
'use client';

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser, User } from 'firebase/auth';
import { app, db } from '@/lib/firebase/firebase';
import { doc, getDoc, setDoc, collection, getCountFromServer } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

type UserProfile = {
  mobile?: string;
  address?: string;
};

type DialogState = {
    isOpen: boolean;
    title: string;
    description: string;
    isError?: boolean;
};

export default function ProfilePage() {
  const auth = getAuth(app);
  const { toast } = useToast();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [profileData, setProfileData] = useState<UserProfile>({});
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [totalChecks, setTotalChecks] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [dialog, setDialog] = useState<DialogState>({ isOpen: false, title: '', description: '' });
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setName(currentUser.displayName || '');
        setEmail(currentUser.email || '');
        await fetchHistoryCount(currentUser.uid);
        await fetchUserProfile(currentUser.uid);
      } else {
        router.push('/sign-in');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, router]);

  const fetchHistoryCount = async (userId: string) => {
    try {
        const historyCollection = collection(db, `users/${userId}/history`);
        const snapshot = await getCountFromServer(historyCollection);
        setTotalChecks(snapshot.data().count);
    } catch (error) {
        console.error("Error fetching history count:", error);
    }
  }

  const fetchUserProfile = async (userId: string) => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setProfileData(data);
        setMobile(data.mobile || '');
        setAddress(data.address || '');
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // If canceling, reset fields to their original state
      setName(user?.displayName || '');
      setMobile(profileData.mobile || '');
      setAddress(profileData.address || '');
    }
    setIsEditing(!isEditing);
  };
  
  const handlePasswordEditToggle = () => {
    if (isEditingPassword) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
    setIsEditingPassword(!isEditingPassword);
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdating(true);
    try {
      // Update display name in Auth
      if (name !== user.displayName) {
        await updateProfile(user, { displayName: name });
      }

      // Update mobile and address in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { mobile, address }, { merge: true });

      await fetchUserProfile(user.uid);
      
      // Manually update user displayName in local state to re-render layout
      if (auth.currentUser) {
        // Create a new object to force re-render
        setUser({ ...auth.currentUser });
      }
      
      toast({
        title: 'Success',
        description: 'Your profile has been updated.',
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: 'Error updating profile',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };


  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;

    if (newPassword !== confirmPassword) {
      setDialog({
        isOpen: true,
        title: 'Password Mismatch',
        description: 'The new and confirmed passwords do not match. Please try again.',
        isError: true,
      });
      return;
    }
    
    setIsUpdating(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      setDialog({
        isOpen: true,
        title: 'Success',
        description: 'Your password has been changed successfully.',
        isError: false,
      });

    } catch (error: any) {
      let description = 'An unexpected error occurred. Please try again.';
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        description = 'The current password you entered is incorrect.';
         setDialog({
            isOpen: true,
            title: 'Incorrect Password',
            description: description,
            isError: true,
        });
      } else {
         toast({
            title: 'Error changing password',
            description: description,
            variant: 'destructive',
        });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !user.email) return;

    setIsDeleting(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await deleteUser(user);
      toast({
        title: 'Account Deleted',
        description: 'Your account has been permanently deleted.',
      });
      router.push('/sign-up');
    } catch (error: any) {
      let description = 'An unexpected error occurred. Please try again.';
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        description = 'The password you entered is incorrect.';
      }
      toast({
        title: 'Error deleting account',
        description: description,
        variant: 'destructive',
      });
      setIsDeleting(false);
    } 
  };
  
  const closeDialog = () => {
    if (!dialog.isError) {
        handlePasswordEditToggle();
    }
    setDialog({ isOpen: false, title: '', description: '' });
  }

  if (loading) {
    return (
        <div className="flex min-h-[calc(100vh-theme(spacing.16))] w-full flex-col items-center justify-center bg-transparent p-4 md:p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-transparent p-4 md:p-8">
      <main className="w-full max-w-2xl space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Card>
                <CardHeader>
                    <CardTitle>Total Checks</CardTitle>
                    <CardDescription>Content items analyzed.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{totalChecks}</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Member Since</CardTitle>
                    <CardDescription>Date your account was created.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">
                        {user?.metadata.creationTime ? format(new Date(user.metadata.creationTime), 'MMM yyyy') : 'N/A'}
                    </div>
                </CardContent>
            </Card>
        </div>


        <Card>
            <CardHeader className='flex-row items-center justify-between'>
                <div>
                    <CardTitle>User Profile</CardTitle>
                    <CardDescription>Manage your account information.</CardDescription>
                </div>
                {!isEditing && (
                    <Button type="button" onClick={handleEditToggle}>
                        Edit Profile
                    </Button>
                )}
            </CardHeader>
            <CardContent>
            {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={email} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="mobile">Mobile Number</Label>
                        <Input id="mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Enter your mobile number" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter your address" />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={isUpdating}>
                            {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Changes'}
                        </Button>
                        <Button type="button" variant="outline" onClick={handleEditToggle}>
                            Cancel
                        </Button>
                    </div>
                </form>
            ) : (
                 <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={name} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={email} disabled />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="mobile">Mobile Number</Label>
                        <Input id="mobile" value={mobile} placeholder="Not set" disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" value={address} placeholder="Not set" disabled />
                    </div>
                </div>
            )}
          </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>Change Password</CardTitle>
                  {!isEditingPassword && <CardDescription>Update your password for better security.</CardDescription>}
                </div>
                 {!isEditingPassword && (
                    <Button type="button" onClick={handlePasswordEditToggle}>
                        Change Password
                    </Button>
                )}
            </CardHeader>
          <CardContent>
             {isEditingPassword ? (
                 <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={isUpdating}>
                            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Password
                        </Button>
                         <Button type="button" variant="outline" onClick={handlePasswordEditToggle}>
                            Cancel
                        </Button>
                    </div>
                </form>
             ) : (
                <div className="text-sm text-muted-foreground">
                    Your password can be changed here.
                </div>
             )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delete Account</CardTitle>
            <CardDescription>
              Permanently delete your account and all associated data. This action cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account.
                    Please enter your current password to confirm.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                 <div className="space-y-2">
                    <Label htmlFor="delete-confirm-password">Current Password</Label>
                    <Input id="delete-confirm-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => { setIsDeleting(false); setCurrentPassword('')}}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting || !currentPassword}>
                     {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm Deletion
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </main>

        <AlertDialog open={dialog.isOpen} onOpenChange={(isOpen) => !isOpen && closeDialog()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{dialog.title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {dialog.description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={closeDialog}>
                        OK
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    </div>
  );
}
