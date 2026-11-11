import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import hand from "@/assets/hand-line.png";
import { cn } from "@/lib/utils";

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
  const field = "w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30";
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-stage px-4">
      <img src={hand} alt="" aria-hidden width={640} height={1280} className="pointer-events-none absolute left-[calc(50%-25rem)] top-1/2 hidden h-[85vh] w-auto -translate-x-1/2 -translate-y-1/2 -rotate-12 opacity-80 md:block" />
      <img src={hand} alt="" aria-hidden width={640} height={1280} className="pointer-events-none absolute left-[calc(50%+25rem)] top-1/2 hidden h-[85vh] w-auto -translate-x-1/2 -translate-y-1/2 rotate-12 -scale-x-100 opacity-80 md:block" />
      <div className="relative w-full max-w-sm rounded-[2rem] border bg-card p-8 shadow-soft">
        <h1 className="font-display text-3xl font-bold">{mode === "login" ? "Welcome back" : "Join Signa"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Learn to speak with your hands.</p>
        <div className="mt-6 grid grid-cols-2 rounded-full bg-muted p-1 text-sm">
          {(["login", "signup"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={cn("rounded-full py-2 font-medium transition", mode === m ? "bg-card shadow-sm" : "text-muted-foreground")}>
              {m === "login" ? "Log in" : "Sign up"}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); navigate({ to: "/" }); }} className="mt-6 space-y-3">
          {mode === "signup" && <input required placeholder="Full name" className={field} />}
          <input required type="email" placeholder="Email" className={field} />
          <input required type="password" placeholder="Password" className={field} />
          <button className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
            {mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>
        <Link to="/" className="mt-4 block text-center text-xs text-muted-foreground hover:text-primary">Continue as guest</Link>
      </div>
    </div>
  );
}
