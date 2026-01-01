'use client';

import { useState } from 'react';

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

  return (
    <div className="glass-panel w-full max-w-md p-8">
      <h1 className="text-3xl mb-6" style={{ fontFamily: 'var(--font-space)' }}>
        Persona Platform
      </h1>
      <div className="space-y-4">
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
        <button className="neon-button w-full rounded-md py-3">Sign in</button>
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
      </div>
    </div>
  );
}
