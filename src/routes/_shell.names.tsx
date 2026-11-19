import { createFileRoute } from "@tanstack/react-router";
import { useSignLanguage } from "@/components/sign-language-provider";

export const Route = createFileRoute("/_shell/names")({
  head: () => ({
    meta: [
      { title: "Names — Signa" },
      { name: "description", content: "Fingerspell any name letter by letter." },
      { property: "og:title", content: "Names — Signa" },
      { property: "og:description", content: "Fingerspell any name letter by letter." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const { language } = useSignLanguage();
  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="font-display text-4xl font-extrabold text-gradient">Names</h1>
      <p className="mt-2 text-muted-foreground">Fingerspell any name letter by letter in <span className="text-primary">{language}</span>.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">{["Brian","Ishimwe","Amani","Keza"].map((n) => (<div key={n} className="glass rounded-2xl p-5 transition hover:shadow-soft"><p className="font-display text-xl font-bold">{n}</p><p className="mt-1 tracking-[0.4em] text-primary">{n.toUpperCase().split("").join(" ")}</p></div>))}</div>
    </div>
  );
}
