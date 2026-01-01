'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setRefreshToken, setToken } from '@/lib/auth/client';

const demoUser = {
  email: 'demo@persona-platform.local',
  password: 'demo123'
};

const demoAdmin = {
  email: 'admin@persona-platform.local',
  password: 'admin123'
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setToken(data.token);
      setRefreshToken(data.refreshToken);
      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="glass-panel w-full max-w-md p-8">
      <h1 className="text-3xl mb-6" style={{ fontFamily: 'var(--font-space)' }}>
        Persona Platform
      </h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          className="w-full rounded-md bg-transparent border border-[var(--color-outline)] px-4 py-3"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          className="w-full rounded-md bg-transparent border border-[var(--color-outline)] px-4 py-3"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {error ? <p className="text-sm text-[var(--color-secondary)]">{error}</p> : null}
        <button className="neon-button w-full rounded-md py-3" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button
            className="neon-button w-full rounded-md py-2"
            onClick={() => {
              setEmail(demoUser.email);
              setPassword(demoUser.password);
            }}
            type="button"
          >
            Demo user
          </button>
          <button
            className="neon-button w-full rounded-md py-2"
            onClick={() => {
              setEmail(demoAdmin.email);
              setPassword(demoAdmin.password);
            }}
            type="button"
          >
            Demo admin
          </button>
        </div>
      </form>
    </div>
  );
}
