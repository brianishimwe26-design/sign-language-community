import { createFileRoute } from "@tanstack/react-router";
import { Link } from '@tanstack/react-router';
import { useAccount } from '@/components/account-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute("/_shell/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Signa" },
      { name: "description", content: "Your learning progress and account details." },
      { property: "og:title", content: "Profile — Signa" },
      { property: "og:description", content: "Your learning progress and account details." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const account = useAccount();
  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="font-display text-4xl font-extrabold text-gradient">Profile</h1>
      <p className="mt-2 text-muted-foreground">Your learning progress and account details.</p>
      <div className="mt-6 flex items-center gap-4 border-y py-6">
        <Avatar className="h-16 w-16">
          {account.avatarUrl && <AvatarImage src={account.avatarUrl} alt={account.name} />}
          <AvatarFallback className="bg-gradient-primary text-primary-foreground">{account.initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0"><p className="break-words font-display text-xl font-bold">{account.loading ? 'Loading…' : account.name}</p><p className="break-all text-sm text-muted-foreground">{account.user?.email ?? 'Not signed in'}</p></div>
      </div>
      {!account.loading && !account.user && <Button asChild className="mt-6"><Link to="/login">Log in</Link></Button>}
    </div>
  );
}
