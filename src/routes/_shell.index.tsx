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

  const lastRequest = [...messages].reverse().find((m) => m.from === "you");

  return (
    <div className="grid h-[calc(100vh-3.5rem)] grid-cols-1 gap-6 p-6 pb-28 md:grid-cols-2">
      <section className="flex min-h-0 flex-col gap-4">
        <div
          key={lastRequest?.text ?? "empty"}
          className="animate-in fade-in slide-in-from-bottom-3 duration-500 glass relative rounded-3xl rounded-bl-md p-6 shadow-soft"
        >
          <span className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-primary">
            <Volume2 className="h-3.5 w-3.5" /> Interpreting
          </span>
          <p className="font-display text-2xl font-bold leading-snug md:text-3xl">
            {lastRequest ? lastRequest.text : "Your words will appear here…"}
          </p>
        </div>
        <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className={cn("max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-500 rounded-3xl px-5 py-3 text-sm", m.from === "you" ? "self-end rounded-br-md bg-gradient-primary text-primary-foreground shadow-soft" : "glass self-start rounded-bl-md")}>
              {m.text}
            </div>
          ))}
        </div>
      </section>
      <section className="relative hidden md:flex md:items-end md:justify-center">
        <img src={avatar} alt="AI sign language companion" width={896} height={1152} className="animate-floaty h-full max-h-full w-auto object-contain drop-shadow-[0_0_60px_color-mix(in_oklab,var(--primary)_35%,transparent)]" />
        <span className="absolute left-5 top-5 flex items-center gap-2 glass rounded-full px-3 py-1 text-xs font-medium backdrop-blur">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" /> Ready to sign
        </span>
      </section>
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="absolute inset-x-6 bottom-6 mx-auto flex max-w-3xl items-center gap-2 glass rounded-full p-2 shadow-soft">
        <button type="button" onClick={() => setListening((l) => !l)} aria-label="Voice input" className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-full transition", listening ? "animate-pulse bg-gradient-primary text-primary-foreground ring-4 ring-primary/30" : "bg-muted hover:bg-accent")}>
          <Mic className="h-5 w-5" />
        </button>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={listening ? "Listening…" : "Type a word or sentence…"} className="flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground" />
        <button type="submit" aria-label="Send" disabled={!text.trim()} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-soft transition hover:scale-110 hover:rotate-12 disabled:opacity-40">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
