import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Forgot Password | AuthZen',
    description: 'Reset your password.',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
