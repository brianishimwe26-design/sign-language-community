import { createFileRoute } from "@tanstack/react-router";
import { useSignLanguage } from '@/components/sign-language-provider';
import { signLanguages } from '@/lib/sign-language';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const { language, setLanguage } = useSignLanguage();
  const listed = signLanguages.some((value) => value === language);
  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="font-display text-4xl font-extrabold text-gradient">Settings</h1>
      <p className="mt-2 text-muted-foreground">Adjust signing speed, voice and appearance.</p>
      <div className="mt-6 space-y-3 border-b border-border pb-6">
        <label className="text-sm font-medium" htmlFor="sign-language">Sign language</label>
        <Select value={listed ? language : 'custom'} onValueChange={(value) => setLanguage(value === 'custom' ? 'Other sign language' : value)}>
          <SelectTrigger id="sign-language" className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>{signLanguages.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}<SelectItem value="custom">Other sign language</SelectItem></SelectContent>
        </Select>
        {!listed && <input aria-label="Other sign language" value={language} onChange={(event) => setLanguage(event.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />}
      </div>
      <div className="mt-6 divide-y glass rounded-2xl">{["Signing speed","Voice recognition","Show captions"].map((s) => (<label key={s} className="flex items-center justify-between p-5 text-sm">{s}<input type="checkbox" defaultChecked className="h-5 w-5 accent-primary" /></label>))}</div>
    </div>
  );
}
