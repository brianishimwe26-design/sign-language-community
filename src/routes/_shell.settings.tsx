import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_shell/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Signa" },
      { name: "description", content: "Adjust signing speed, voice and appearance." },
      { property: "og:title", content: "Settings — Signa" },
      { property: "og:description", content: "Adjust signing speed, voice and appearance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="font-display text-3xl font-bold">Settings</h1>
      <p className="mt-2 text-muted-foreground">Adjust signing speed, voice and appearance.</p>
      <div className="mt-6 divide-y rounded-2xl border bg-card">{["Signing speed","Voice recognition","Show captions"].map((s) => (<label key={s} className="flex items-center justify-between p-5 text-sm">{s}<input type="checkbox" defaultChecked className="h-5 w-5 accent-primary" /></label>))}</div>
    </div>
  );
}
