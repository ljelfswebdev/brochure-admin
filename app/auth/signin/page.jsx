'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function SignIn({ searchParams }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const cb = searchParams?.callbackUrl || '/admin';

  async function onSubmit(e){
    e.preventDefault();
    const res = await signIn('credentials', { redirect: true, email, password, callbackUrl: cb });
  }

  return (
    <section>
      <h1>Sign in</h1>
      <form onSubmit={onSubmit}>
        <div>
          <label>Email</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
        <button type="submit">Sign in</button>
      </form>
    </section>
  );
}
