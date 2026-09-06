import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Sparkles, Heart, Film } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    setError('');
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-pink-50/40 px-4 py-12 text-slate-900">
      {/* Background Decorative Gradient Orbs */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-pink-200/40 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-indigo-200/40 blur-[100px]" />

      <div className="relative z-10 grid w-full max-w-5xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left Professional Hero Section */}
        <section className="hidden space-y-6 lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-pink-50/80 px-4 py-2 text-xs font-extrabold text-app-primary shadow-xs">
            <Sparkles className="h-4 w-4 text-app-primary" />
            Social moments, refined & reimagined
          </div>
          
          <h1 className="text-5xl font-black leading-[1.15] tracking-tight text-slate-950">
            Share moments with a cleaner, faster social experience.
          </h1>
          
          <p className="max-w-md text-sm leading-relaxed text-slate-600">
            Enjoy rich chronological feeds, 24h stories, vertical video Reels, real-time messaging, and interactive profiles built for creators.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-app-primary">
                <Heart className="h-5 w-5 fill-app-primary" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-900">Double Tap Hearts</p>
                <p className="text-[11px] text-slate-500">Interactive post feedback</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                <Film className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-900">Vertical Reels</p>
                <p className="text-[11px] text-slate-500">Short video feeds</p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Light Login Card */}
        <div className="w-full max-w-md justify-self-center">
          <div className="mb-4 rounded-[28px] border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/60">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-gradient text-2xl font-black text-white shadow-active transition duration-300 hover:scale-105">
                N
              </div>
              <h1 className="bg-primary-gradient bg-clip-text text-3xl font-black tracking-tight text-transparent">
                Nexora
              </h1>
              <p className="mt-1.5 text-xs font-bold text-slate-500">
                Welcome back! Log in to view your feed.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-center text-xs font-bold text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-extrabold text-slate-700">
                  Username or Email Address
                </label>
                <input
                  {...register('email', { required: true })}
                  type="text"
                  placeholder="Username or email"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 transition focus:border-app-primary focus:bg-white focus:ring-4 focus:ring-pink-500/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-extrabold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register('password', { required: true })}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-12 text-xs font-medium text-slate-900 placeholder:text-slate-400 transition focus:border-app-primary focus:bg-white focus:ring-4 focus:ring-pink-500/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-400 transition hover:text-slate-700"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <div className="mt-2 text-right">
                  <Link to="/forgot-password" className="text-xs font-extrabold text-app-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full h-12 rounded-2xl text-xs font-extrabold shadow-fab mt-2"
              >
                {isSubmitting ? 'Logging in...' : 'Log In'}
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 text-center text-xs font-bold text-slate-600 shadow-sm">
            Don't have an account?{' '}
            <Link to="/register" className="font-extrabold text-app-primary hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
