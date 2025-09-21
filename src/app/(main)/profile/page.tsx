

'use client';

import { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser, User } from 'firebase/auth';
import { app, db, storage } from '@/lib/firebase/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { collection, getDocs } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Loader2, UploadCloud } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import imageCompression from 'browser-image-compression';

export default function ProfilePage() {
  const auth = getAuth(app);
  const { toast } = useToast();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [totalChecks, setTotalChecks] = useState(0);

  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setName(currentUser.displayName || '');
        setEmail(currentUser.email || '');
        setImagePreview(currentUser.photoURL || null);
        fetchHistoryCount(currentUser.uid);
      } else {
        router.push('/sign-in');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, router]);

  const fetchHistoryCount = async (userId: string) => {
     try {
        const querySnapshot = await getDocs(collection(db, `users/${userId}/history`));
        setTotalChecks(querySnapshot.size);
    } catch (error) {
        console.error("Error fetching history count: ", error);
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdating(true);
    try {
      await updateProfile(user, { displayName: name });
      toast({
        title: 'Success',
        description: 'Your profile has been updated.',
      });
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleImageUpload = async () => {
    if (!imageFile || !user) return;

    setIsUploading(true);

    const options = {
      maxSizeMB: 0.5, // (max file size in MB)
      maxWidthOrHeight: 400, // (max width or height in pixels)
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(imageFile, options);
      const storageRef = ref(storage, `profile_pictures/${user.uid}`);
      
      await uploadBytes(storageRef, compressedFile);
      const photoURL = await getDownloadURL(storageRef);
      await updateProfile(user, { photoURL });
      
      // Force refresh user to get new photoURL
      await auth.currentUser?.reload();
      setUser(auth.currentUser); // This will trigger re-render

      toast({
          title: 'Success',
          description: 'Profile picture updated successfully.'
      });
      setImageFile(null); // Clear the selected file
    } catch (error: any) {
        toast({
            title: 'Upload Failed',
            description: error.message,
            variant: 'destructive',
        });
    } finally {
        setIsUploading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsUpdating(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      toast({
        title: 'Success',
        description: 'Your password has been changed.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: 'Error changing password',
        description: error.message,
        variant: 'destructive',
      });
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
      toast({
        title: 'Error deleting account',
        description: error.message,
        variant: 'destructive',
      });
      setIsDeleting(false);
    } 
  };

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

        <Card>
            <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>Update your avatar.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center gap-6 text-center">
                    <Avatar className="h-28 w-28">
                        <AvatarImage src={imagePreview ?? user?.photoURL ?? undefined} />
                        <AvatarFallback>
                            <span className="text-3xl">{user?.displayName?.[0] ?? 'U'}</span>
                        </AvatarFallback>
                    </Avatar>
                     <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        onChange={handleImageSelect}
                        accept="image/png, image/jpeg"
                    />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Select Image
                    </Button>
                </div>
            </CardContent>
            {imageFile && (
                 <CardFooter>
                    <Button className="w-full" onClick={handleImageUpload} disabled={isUploading}>
                        {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Upload and Save
                    </Button>
                </CardFooter>
            )}
        </Card>
        
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
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Manage your account information.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} disabled />
              </div>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Profile
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password for better security.</CardDescription>
          </CardHeader>
          <CardContent>
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
              <Button type="submit" disabled={isUpdating}>
                 {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Password
              </Button>
            </form>
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
                  <AlertDialogCancel onClick={() => setIsDeleting(false)}>Cancel</AlertDialogCancel>
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
    </div>
  );
}


