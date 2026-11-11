import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import hand from "@/assets/hand-line.png";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/letters")({
  head: () => ({
    meta: [
      { title: "Hand Letters — Signa" },
      { name: "description", content: "Browse the sign language alphabet from A to Z." },
      { property: "og:title", content: "Hand Letters — Signa" },
      { property: "og:description", content: "Browse the sign language alphabet from A to Z." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Letters,
});

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const tips: Record<string, string> = {
  A: "Closed fist, thumb resting against the side.", B: "Flat hand, fingers together, thumb folded in.",
  C: "Curve fingers and thumb into a C shape.", D: "Index up, other fingers touch the thumb.",
  E: "Fingertips bent down to touch the thumb.", L: "Index up and thumb out, forming an L.",
  O: "All fingertips meet the thumb in a circle.", V: "Index and middle finger up in a V.",
  Y: "Thumb and pinky out, other fingers folded.",
};

function Letters() {
  const [i, setI] = useState(0);
  const l = letters[i] ?? "A";
  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col gap-6 p-6">
      <section className="relative flex flex-1 items-center justify-center overflow-hidden rounded-[2rem] border border-border bg-stage">
        <span className="pointer-events-none absolute font-display text-[18rem] font-bold leading-none text-gradient opacity-25">{l}</span>
        <img key={l} src={hand} alt={`Hand sign for ${l}`} width={640} height={1280}
          className="relative h-[80%] w-auto drop-shadow-[0_0_25px_var(--primary)] brightness-150 animate-in fade-in zoom-in-95 duration-300"
          style={{ transform: `rotate(${(i % 7) * 8 - 24}deg) scaleX(${i % 2 ? -1 : 1})` }} />
        <div className="absolute bottom-5 left-5 max-w-xs glass rounded-2xl p-4">
          <p className="font-display text-2xl font-bold">Letter {l}</p>
          <p className="text-sm text-muted-foreground">{tips[l] ?? "Watch the hand shape and copy it slowly."}</p>
        </div>
      </section>
      <div className="flex items-center gap-2 glass rounded-full p-2 shadow-soft">
        <button onClick={() => setI((v) => Math.max(0, v - 1))} aria-label="Previous" className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-muted"><ChevronLeft className="h-4 w-4" /></button>
        <div className="no-scrollbar flex flex-1 gap-1.5 overflow-x-auto scroll-smooth">
          {letters.map((x, idx) => (
            <button key={x} onClick={() => setI(idx)}
              className={cn("h-11 min-w-11 shrink-0 rounded-full font-display text-lg font-bold transition", idx === i ? "scale-110 bg-gradient-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
              {x}
            </button>
          ))}
        </div>
        <button onClick={() => setI((v) => Math.min(25, v + 1))} aria-label="Next" className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-muted"><ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
