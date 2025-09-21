
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Link from 'next/link';
import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { app } from '@/lib/firebase/firebase';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { GoogleSignIn } from './google-signin';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { Loader2 } from 'lucide-react';

const FormSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters.',
  }),
});

export function SignUpForm() {
  const { toast } = useToast();
  const router = useRouter();
  const auth = getAuth(app);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(userCredential.user, {
        displayName: data.name
      });
      toast({
        title: 'Account Created',
        description: "You've successfully created an account.",
      });
      router.push('/home');
    } catch (error: any) {
      console.error("Sign Up Error", error);
       let description = "Could not create your account. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        description = 'This email is already in use. Please sign in instead.';
      }
      toast({
        title: 'Sign Up Failed',
        description: description,
        variant: 'destructive',
      });
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Create an account</CardTitle>
        <CardDescription>
          Enter your information to create an account.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="name@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create account
            </Button>
          </form>
        </Form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <Suspense fallback={<Skeleton className="h-10 w-full" />}>
          <GoogleSignIn />
        </Suspense>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/sign-in"
            className="underline"
          >
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
