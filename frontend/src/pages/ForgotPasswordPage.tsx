import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { authService } from '../services/api';
import { useToast } from '../components/ui/Toast';
import loginBg from '../assets/images/Login_Img.png';

const schema = z.object({ email: z.string().email('Invalid email') });

export const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const toast = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: { email: string }) => {
    setLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setSent(true);
    } catch {
      toast.error('Failed', 'Could not send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/45 pointer-events-none" />
      <div className="relative z-10 w-full max-w-md">
    <Card>
      {sent ? (
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-4">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-navy-700 mb-2">Check Your Email</h2>
          <p className="text-slate-500 text-sm mb-6">If the email exists in our system, you will receive a password reset link shortly.</p>
          <Link to="/login">
            <Button variant="outline" className="w-full">Back to Login</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-navy-700">Forgot Password</h2>
            <p className="text-sm text-slate-500 mt-1">Enter your email to receive a reset link</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="driver@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              required
              {...register('email')}
            />
            <Button type="submit" size="lg" className="w-full" loading={loading}>
              Send Reset Link
            </Button>
            <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-navy-700">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </form>
        </>
      )}
    </Card>
      </div>
    </div>
  );
};
