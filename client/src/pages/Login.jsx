import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    setError('');
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-950">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden text-white lg:block">
          <div className="mb-6 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
            Professional social media starter
          </div>
          <h1 className="max-w-xl text-5xl font-black leading-tight tracking-tight">
            Share moments with a cleaner, faster Insta experience.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
            A polished feed, real-time messages, stories, reels, and profiles built on a modern MERN stack.
          </p>
        </section>

        <div className="w-full max-w-md justify-self-center">
        <div className="app-card mb-4 p-8">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-black tracking-tight bg-insta-gradient bg-clip-text text-transparent">
              Insta
            </h1>
            <p className="mt-2 text-sm text-slate-500">Welcome back. Your feed is waiting.</p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">{error}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input
              {...register('email', { required: true })}
              type="email"
              placeholder="Email"
              className="field"
            />
            <input
              {...register('password', { required: true })}
              type="password"
              placeholder="Password"
              className="field"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full"
            >
              {isSubmitting ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        </div>

        <div className="app-card p-6 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-insta-pink">Sign up</Link>
        </div>
        </div>
      </div>
    </div>
  );
}
