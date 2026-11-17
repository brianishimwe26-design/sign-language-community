import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mic, Send, Volume2 } from "lucide-react";
import avatar from "@/assets/signa-character.png.asset.json";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_shell/")({
  head: () => ({
    meta: [
      { title: "Chat — Signa Sign Language AI" },
      { name: "description", content: "Talk or type and watch your AI companion sign it back." },
      { property: "og:title", content: "Chat — Signa Sign Language AI" },
      { property: "og:description", content: "Talk or type and watch your AI companion sign it back." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Chat,
});

function Chat() {
  const [lastRequest, setLastRequest] = useState("");
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);

  const send = (t = text) => {
    if (!t.trim()) return;
    setLastRequest(t.trim());
    setText("");
  };

  return (
    <div className="grid h-[calc(100dvh-3.5rem)] grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-6 p-6 pb-28 md:grid-cols-2 md:grid-rows-1">
      <section className="flex min-h-0 flex-col gap-4">
        <div
          key={lastRequest || "empty"}
          className="animate-in fade-in slide-in-from-bottom-3 duration-500 glass relative rounded-3xl rounded-bl-md p-6 shadow-soft"
        >
          <span className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-primary">
            <Volume2 className="h-3.5 w-3.5" /> Interpreting
          </span>
          <p className="font-display text-2xl font-bold leading-snug md:text-3xl">
            {lastRequest || "Your words will appear here…"}
          </p>
        </div>
      </section>
      <section className="relative flex min-h-0 items-end justify-center">
        <img src={avatar.url} alt="AI sign language companion" width={1145} height={1374} className="animate-floaty h-full max-h-full w-auto max-w-full object-contain drop-shadow-[0_0_60px_color-mix(in_oklab,var(--primary)_35%,transparent)]" />
      </section>
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="absolute inset-x-6 bottom-6 mx-auto flex max-w-3xl items-center gap-2 glass rounded-full p-2 shadow-soft">
        <Button variant="ghost" size="icon" type="button" onClick={() => setListening((l) => !l)} aria-label="Voice input" className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-full transition", listening ? "animate-pulse bg-gradient-primary text-primary-foreground ring-4 ring-primary/30" : "bg-muted hover:bg-accent")}>
          <Mic className="h-5 w-5" />
        </Button>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={listening ? "Listening…" : "Type a word or sentence…"} className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground" />
        <Button size="icon" type="submit" aria-label="Send" disabled={!text.trim()} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-soft transition hover:scale-110 hover:rotate-12 disabled:opacity-40">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
