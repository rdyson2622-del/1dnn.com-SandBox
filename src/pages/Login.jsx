import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { appClient, supabase } from '@/api/appClient';
import { useAuth } from '@/lib/AuthContext';

export default function Login() {
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    const redirectTo = `${window.location.origin}/login`;
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
    setBusy(false);
    setMessage(error ? error.message : 'Check your email for a secure sign-in link.');
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-2xl border border-amber-400/30 bg-zinc-900 p-8 shadow-2xl">
        <img src="/assets/dyson-logo.png" alt="Dyson & Dyson" className="h-24 w-auto mx-auto mb-6" />
        <h1 className="text-2xl font-semibold text-center">1DNN Sandbox</h1>
        <p className="text-zinc-400 text-center mt-2 mb-6">Private sign-in for Bob and Jay</p>
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm">
            Email address
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-amber-400"
            />
          </label>
          <button disabled={busy} className="w-full rounded-lg bg-amber-400 px-4 py-3 font-semibold text-black disabled:opacity-50">
            {busy ? 'Sending…' : 'Email me a sign-in link'}
          </button>
        </form>
        {message && <p className="mt-4 text-sm text-center text-zinc-300">{message}</p>}
        <p className="mt-6 text-xs text-zinc-500 text-center">Backend: {appClient.mode}</p>
      </section>
    </main>
  );
}
