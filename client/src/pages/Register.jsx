import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, UserPlus, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    setError('');
    try {
      await registerUser(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-purple-50/40 px-4 py-12 text-slate-900">
      {/* Background Decorative Gradient Orbs */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-purple-200/40 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-pink-200/40 blur-[100px]" />

      <div className="relative z-10 grid w-full max-w-5xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left Hero Section */}
        <section className="hidden space-y-6 lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50/80 px-4 py-2 text-xs font-extrabold text-purple-700 shadow-xs">
            <UserPlus className="h-4 w-4 text-purple-600" />
            Create your creator account
          </div>
          
          <h1 className="text-5xl font-black leading-[1.15] tracking-tight text-slate-950">
            Share your story with the world in seconds.
          </h1>
          
          <p className="max-w-md text-sm leading-relaxed text-slate-600">
            Join the community to share photos, post vertical video Reels, publish stories, and message friends in real time.
          </p>

          <div className="flex items-center gap-6 pt-2 text-xs font-extrabold text-slate-600">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Instant Registration
            </span>
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-app-primary" /> Free Unlimited Posts
            </span>
          </div>
        </section>

        {/* Right Light Register Form */}
        <div className="w-full max-w-md justify-self-center">
          <div className="mb-4 rounded-[28px] border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/60">
            <div className="mb-7 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-gradient text-2xl font-black text-white shadow-active transition duration-300 hover:scale-105">
                N
              </div>
              <h1 className="bg-primary-gradient bg-clip-text text-3xl font-black tracking-tight text-transparent">
                Nexora
              </h1>
              <p className="mt-1.5 text-xs font-bold text-slate-500">
                Sign up to see photos and videos from friends.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-center text-xs font-bold text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              <div>
                <label className="mb-1 block text-xs font-extrabold text-slate-700">
                  Email Address
                </label>
                <input
                  {...register('email', { required: true })}
                  type="email"
                  placeholder="name@example.com"
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 transition focus:border-app-primary focus:bg-white focus:ring-4 focus:ring-pink-500/10"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold text-slate-700">
                  Full Name
                </label>
                <input
                  {...register('fullName', { required: true })}
                  type="text"
                  placeholder="John Doe"
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 transition focus:border-app-primary focus:bg-white focus:ring-4 focus:ring-pink-500/10"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold text-slate-700">
                  Username
                </label>
                <input
                  {...register('username', { required: true })}
                  type="text"
                  placeholder="johndoe"
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 transition focus:border-app-primary focus:bg-white focus:ring-4 focus:ring-pink-500/10"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register('password', { required: true, minLength: 6 })}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-12 text-xs font-medium text-slate-900 placeholder:text-slate-400 transition focus:border-app-primary focus:bg-white focus:ring-4 focus:ring-pink-500/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3 text-slate-400 transition hover:text-slate-700"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full h-12 rounded-2xl text-xs font-extrabold shadow-fab mt-2"
              >
                {isSubmitting ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 text-center text-xs font-bold text-slate-600 shadow-sm">
            Have an account?{' '}
            <Link to="/login" className="font-extrabold text-app-primary hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
