import { SignupForm } from '@/components/auth/signup-form';
import { Icons } from '@/components/icons';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <>
      <div className="grid gap-2 text-center">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 mb-4"
        >
          <Icons.logo className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-headline font-bold text-foreground">
            Deadline Dynamo
          </h1>
        </Link>
        <p className="text-balance text-muted-foreground">
          Create an account to start tracking your deadlines
        </p>
      </div>
      <SignupForm />
      <div className="mt-4 text-center text-sm">
        Already have an account?{' '}
        <Link
          href="/login"
          className="underline text-primary hover:text-primary/80"
        >
          Login
        </Link>
      </div>
    </>
  );
}
