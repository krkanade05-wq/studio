import { SignUpForm } from '@/components/auth/sign-up-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign Up | AuthZen',
    description: 'Create a new account.',
};

export default function SignUpPage() {
  return <SignUpForm />;
}
