import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mic, Send, Volume2 } from "lucide-react";
import avatar from "@/assets/ai-avatar.jpg";
import { cn } from "@/lib/utils";

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

const suggestions = ["Hello", "Thank you", "How are you?", "My name is", "Please", "Sorry"];

function Chat() {
  const [messages, setMessages] = useState<{ text: string; from: "you" | "ai" }[]>([
    { text: "Hi! Type or say something and I'll sign it for you.", from: "ai" },
  ]);
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);

  const send = (t = text) => {
    if (!t.trim()) return;
    setMessages((m) => [...m, { text: t, from: "you" }, { text: `Signing: "${t}"`, from: "ai" }]);
    setText("");
  };

  return (
    <div className="grid h-[calc(100vh-3.5rem)] grid-cols-1 gap-6 p-6 pb-28 md:grid-cols-[1fr_1.1fr]">
      <section className="flex min-h-0 flex-col gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">What would you like to say?</h1>
          <p className="mt-1 text-sm text-muted-foreground">Pick a word or start typing below.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button key={s} onClick={() => send(s)} className="rounded-full border bg-card px-4 py-1.5 text-sm transition hover:-translate-y-0.5 hover:border-primary hover:text-primary">
              {s}
            </button>
          ))}
        </div>
        <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className={cn("max-w-[85%] rounded-3xl px-5 py-3 text-sm shadow-sm", m.from === "you" ? "self-end rounded-br-md bg-primary text-primary-foreground" : "self-start rounded-bl-md border bg-card")}>
              {m.from === "ai" && <Volume2 className="mb-1 h-3.5 w-3.5 text-primary" />}
              {m.text}
            </div>
          ))}
        </div>
      </section>
      <section className="relative hidden overflow-hidden rounded-[2rem] bg-stage md:flex md:items-end md:justify-center">
        <img src={avatar} alt="AI sign language companion" width={896} height={1152} className="h-full w-auto object-contain mix-blend-multiply" />
        <span className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-card/80 px-3 py-1 text-xs font-medium backdrop-blur">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" /> Ready to sign
        </span>
      </section>
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="absolute inset-x-6 bottom-6 mx-auto flex max-w-3xl items-center gap-2 rounded-full border bg-card p-2 shadow-soft">
        <button type="button" onClick={() => setListening((l) => !l)} aria-label="Voice input" className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-full transition", listening ? "animate-pulse bg-primary text-primary-foreground" : "bg-muted hover:bg-accent")}>
          <Mic className="h-5 w-5" />
        </button>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={listening ? "Listening…" : "Type a word or sentence…"} className="flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground" />
        <button type="submit" aria-label="Send" disabled={!text.trim()} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition hover:scale-105 disabled:opacity-40">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
