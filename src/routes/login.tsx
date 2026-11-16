import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import hand from "@/assets/hand-line.png";
import { cn } from "@/lib/utils";
import { Aurora } from "@/components/aurora";
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/password-input';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { LovableMark } from '@lovable.dev/cloud-auth-js/react';
import { useAccount } from '@/components/account-provider';

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Signa" },
      { name: "description", content: "Log in or create your Signa account to start signing." },
      { property: "og:title", content: "Log in — Signa" },
      { property: "og:description", content: "Log in or create your Signa account to start signing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Login,
});

function Login() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const navigate = useNavigate();
  const account = useAccount();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const submit = async () => {
    setBusy(true); setError(''); setMessage('');
    try {
      const result = mode === 'signup'
        ? await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim() }, emailRedirectTo: window.location.origin } })
        : await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (result.error) { setError(result.error.message); return; }
      if (result.data.session) await navigate({ to: '/' });
      else setMessage('Check your email to confirm your account, then log in.');
    } catch { setError('Unable to connect. Please try again.'); }
    finally { setBusy(false); }
  };
  const socialSignIn = async (provider: 'google' | 'lovable') => {
    setError(''); setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
      if (result.error) { setError(result.error.message); return; }
      if (!result.redirected) await navigate({ to: '/' });
    } catch { setError('Sign-in could not be completed. Please try again.'); }
    finally { setBusy(false); }
  };
  const field = "w-full rounded-xl border bg-input/40 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30";
  return (
    <div className="relative flex min-h-screen items-center justify-center isolate overflow-hidden px-4">
      <Aurora />
      <img src={hand} alt="" aria-hidden width={640} height={1280} className="pointer-events-none absolute left-[calc(50%-25rem)] top-1/2 hidden h-[85vh] w-auto -translate-x-1/2 -translate-y-1/2 -rotate-12 animate-floaty opacity-90 brightness-150 drop-shadow-[0_0_30px_var(--primary-glow)] md:block" />
      <img src={hand} alt="" aria-hidden width={640} height={1280} className="pointer-events-none absolute left-[calc(50%+25rem)] top-1/2 hidden h-[85vh] w-auto -translate-x-1/2 -translate-y-1/2 rotate-12 -scale-x-100 animate-floaty opacity-90 brightness-150 drop-shadow-[0_0_30px_var(--primary-glow)] md:block" />
      <div className="relative w-full max-w-sm glass rounded-[2rem] p-8 shadow-soft">
        <h1 className="font-display text-3xl font-extrabold">{mode === "login" ? <>Welcome <span className="text-gradient">back</span></> : <>Join <span className="text-gradient">Signa</span></>}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Learn to speak with your hands.</p>
        <div className="mt-6 grid grid-cols-2 rounded-full bg-muted p-1 text-sm">
          {(["login", "signup"] as const).map((m) => (
            <Button variant="ghost" key={m} onClick={() => { setMode(m); setError(''); setMessage(''); }} className={cn("rounded-full py-2 font-medium transition", mode === m ? "bg-gradient-primary text-primary-foreground shadow-soft" : "text-muted-foreground")}>
              {m === "login" ? "Log in" : "Sign up"}
            </Button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); void submit(); }} className="mt-6 space-y-3">
          {mode === "signup" && <input required aria-label="Full name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={field} />}
          <input required type="email" aria-label="Email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={field} />
          <PasswordInput required aria-label="Password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={mode === 'signup' ? 8 : undefined} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={field} />
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          {message && <p role="status" className="text-sm text-primary">{message}</p>}
          <Button disabled={busy} className="h-12 w-full rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
            {busy ? 'Please wait…' : mode === "login" ? "Log in" : "Create account"}
          </Button>
        </form>
        <div className="mt-4 space-y-2">
          <Button disabled={busy} variant="outline" className="google-sign-in h-11 w-full rounded-xl" onClick={() => void socialSignIn('google')}>
            <svg aria-hidden="true" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
            Continue with Google
          </Button>
          <Button disabled={busy} variant="outline" className="h-11 w-full rounded-xl" onClick={() => void socialSignIn('lovable')}><LovableMark />Continue with Lovable</Button>
        </div>
        {account.user && <Link to="/" className="mt-4 block truncate text-center text-sm text-primary">Continue as {account.name}</Link>}
        <Link to="/" className="mt-4 block text-center text-xs text-muted-foreground hover:text-primary">Continue as guest</Link>
      </div>
    </div>
  );
}
