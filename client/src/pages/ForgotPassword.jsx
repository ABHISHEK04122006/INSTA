import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import api from '../api';

export default function ForgotPassword() {
  const [step, setStep] = useState('request');
  const [identifier, setIdentifier] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const requestForm = useForm();
  const resetForm = useForm();

  const requestCode = async (data) => {
    setError('');
    setMessage('');
    try {
      const { data: response } = await api.post('/auth/forgot-password', { identifier: data.identifier });
      setIdentifier(data.identifier.trim());
      setMessage(response.message);
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send a reset code. Please try again.');
    }
  };

  const resetPassword = async (data) => {
    setError('');
    setMessage('');
    try {
      const { data: response } = await api.post('/auth/reset-password', { identifier, otp: data.otp, password: data.password });
      setMessage(response.message);
      setStep('complete');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reset your password. Please try again.');
    }
  };

  const resendCode = async () => {
    setError('');
    try {
      const { data: response } = await api.post('/auth/forgot-password', { identifier });
      setMessage(response.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send a new code. Please try again.');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-pink-50/40 px-4 py-12 text-slate-900">
      <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-pink-200/40 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-indigo-200/40 blur-[100px]" />

      <main className="relative z-10 w-full max-w-md">
        <Link to="/login" className="mb-5 inline-flex items-center gap-2 text-xs font-extrabold text-slate-600 transition hover:text-app-primary">
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        <section className="rounded-[28px] border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/60">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-gradient text-white shadow-active">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950">Reset your password</h1>
            <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500">
              {step === 'request'
                ? 'Enter your username or email and we’ll send a verification code to the email on your account.'
                : step === 'reset'
                  ? 'Enter the 6-digit code from your email and choose a new password.'
                  : 'Your password has been updated securely.'}
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-center text-xs font-bold text-red-600">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-center text-xs font-bold text-emerald-700">
              {message}
            </div>
          )}

          {step === 'request' && (
            <form onSubmit={requestForm.handleSubmit(requestCode)} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-extrabold text-slate-700">Username or Email Address</label>
                <input
                  {...requestForm.register('identifier', { required: 'Enter your username or email address' })}
                  type="text"
                  autoComplete="username"
                  placeholder="Username or email"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 transition focus:border-app-primary focus:bg-white focus:ring-4 focus:ring-pink-500/10"
                />
                {requestForm.formState.errors.identifier && <p className="mt-1.5 text-xs font-semibold text-red-600">{requestForm.formState.errors.identifier.message}</p>}
              </div>
              <button type="submit" disabled={requestForm.formState.isSubmitting} className="btn-primary h-12 w-full rounded-2xl text-xs font-extrabold shadow-fab">
                {requestForm.formState.isSubmitting ? 'Sending code...' : 'Email reset code'}
              </button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={resetForm.handleSubmit(resetPassword)} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-extrabold text-slate-700">Verification Code</label>
                <input
                  {...resetForm.register('otp', { required: 'Enter the 6-digit code', pattern: { value: /^\d{6}$/, message: 'Enter the 6-digit code' } })}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength="6"
                  placeholder="6-digit code"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-center text-sm font-bold tracking-[0.35em] text-slate-900 placeholder:tracking-normal placeholder:text-slate-400 transition focus:border-app-primary focus:bg-white focus:ring-4 focus:ring-pink-500/10"
                />
                {resetForm.formState.errors.otp && <p className="mt-1.5 text-xs font-semibold text-red-600">{resetForm.formState.errors.otp.message}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-extrabold text-slate-700">New Password</label>
                <div className="relative">
                  <input
                    {...resetForm.register('password', { required: 'Enter a new password', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-12 text-xs font-medium text-slate-900 placeholder:text-slate-400 transition focus:border-app-primary focus:bg-white focus:ring-4 focus:ring-pink-500/10"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-slate-400 transition hover:text-slate-700" aria-label="Toggle password visibility">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {resetForm.formState.errors.password && <p className="mt-1.5 text-xs font-semibold text-red-600">{resetForm.formState.errors.password.message}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-extrabold text-slate-700">Confirm New Password</label>
                <input
                  {...resetForm.register('confirmPassword', { required: 'Confirm your new password', validate: (value) => value === resetForm.getValues('password') || 'Passwords do not match' })}
                  type="password"
                  autoComplete="new-password"
                  placeholder="Re-enter your new password"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 transition focus:border-app-primary focus:bg-white focus:ring-4 focus:ring-pink-500/10"
                />
                {resetForm.formState.errors.confirmPassword && <p className="mt-1.5 text-xs font-semibold text-red-600">{resetForm.formState.errors.confirmPassword.message}</p>}
              </div>

              <button type="submit" disabled={resetForm.formState.isSubmitting} className="btn-primary h-12 w-full rounded-2xl text-xs font-extrabold shadow-fab">
                {resetForm.formState.isSubmitting ? 'Resetting password...' : 'Reset password'}
              </button>
              <button type="button" onClick={resendCode} className="w-full text-xs font-extrabold text-app-primary hover:underline">
                Send a new code
              </button>
            </form>
          )}

          {step === 'complete' && (
            <Link to="/login" className="btn-primary flex h-12 w-full items-center justify-center rounded-2xl text-xs font-extrabold shadow-fab">
              Continue to login
            </Link>
          )}
        </section>
      </main>
    </div>
  );
}
