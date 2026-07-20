import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
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
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-950">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center gap-8 lg:grid-cols-[1fr_1fr]">
        <section className="hidden text-white lg:block">
          <div className="mb-6 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
            Create your profile
          </div>
          <h1 className="max-w-xl text-5xl font-black leading-tight tracking-tight">
            Start posting, following, chatting, and discovering in minutes.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
            Built for a premium social experience with responsive design and real-time interactions.
          </p>
        </section>

        <div className="w-full max-w-md justify-self-center">
        <div className="app-card mb-4 p-8">
          <div className="mb-7 text-center">
            <h1 className="text-4xl font-black tracking-tight bg-insta-gradient bg-clip-text text-transparent">
              Insta
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Sign up to see photos and videos from your friends.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">{error}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <input
              {...register('email', { required: true })}
              type="email"
              placeholder="Email"
              className="field"
            />
            <input
              {...register('fullName', { required: true })}
              type="text"
              placeholder="Full Name"
              className="field"
            />
            <input
              {...register('username', { required: true })}
              type="text"
              placeholder="Username"
              className="field"
            />
            <input
              {...register('password', { required: true, minLength: 6 })}
              type="password"
              placeholder="Password"
              className="field"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full"
            >
              {isSubmitting ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
        </div>

        <div className="app-card p-6 text-center text-sm text-slate-600">
          Have an account?{' '}
          <Link to="/login" className="font-bold text-insta-pink">Log in</Link>
        </div>
        </div>
      </div>
    </div>
  );
}
