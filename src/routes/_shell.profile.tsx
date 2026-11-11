import { createFileRoute } from "@tanstack/react-router";

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
  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="font-display text-3xl font-bold">Profile</h1>
      <p className="mt-2 text-muted-foreground">Your learning progress and account details.</p>
      <div className="mt-6 rounded-2xl border bg-card p-6"><p className="font-display text-xl font-bold">Ishimwe Brian</p><p className="text-sm text-muted-foreground">12 letters learned this week</p></div>
    </div>
  );
}
