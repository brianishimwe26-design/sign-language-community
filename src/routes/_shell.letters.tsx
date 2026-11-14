import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import hand from "@/assets/hand-line.png";
import handA from "@/assets/letter-a.asset.json";
import handB from "@/assets/letter-b.asset.json";
import handC from "@/assets/letter-c.asset.json";
import { Button } from "@/components/ui/button";
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
const handImages: Record<string, string> = { A: handA.url, B: handB.url, C: handC.url };
const tips: Record<string, string> = {
  A: "Closed fist, thumb resting against the side.", B: "Flat hand, fingers together, thumb folded in.",
  C: "Curve fingers and thumb into a C shape.", D: "Index up, other fingers touch the thumb.",
  E: "Fingertips bent down to touch the thumb.", L: "Index up and thumb out, forming an L.",
  O: "All fingertips meet the thumb in a circle.", V: "Index and middle finger up in a V.",
  Y: "Thumb and pinky out, other fingers folded.",
};

export function Letters() {
  const [i, setI] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const l = letters[i] ?? "A";

  useEffect(() => {
    const carousel = carouselRef.current;
    const selected = carousel?.children.item(i);
    if (!carousel || !(selected instanceof HTMLElement)) return;
    carousel.scrollTo({
      left: selected.offsetLeft - carousel.offsetLeft - (carousel.clientWidth - selected.offsetWidth) / 2,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }, [i]);

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] min-w-0 flex-col gap-6 p-4 sm:p-6">
      <section className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[2rem] border border-border bg-stage">
        <span className="pointer-events-none absolute font-display text-[18rem] font-bold leading-none text-gradient opacity-25">{l}</span>
        <img key={l} src={handImages[l] ?? hand} alt={handImages[l] ? `Hand sign for ${l}` : `Illustrative hand for letter ${l}`} 
          className="relative h-[80%] max-w-[80%] w-auto object-contain animate-in fade-in zoom-in-95 duration-300" />
        <div className="absolute bottom-5 left-5 max-w-xs glass rounded-2xl p-4">
          <p className="font-display text-2xl font-bold">Letter {l}</p>
          <p className="text-sm text-muted-foreground">{tips[l] ?? "Watch the hand shape and copy it slowly."}</p>
        </div>
      </section>
      <div className="flex min-w-0 items-center gap-2 glass rounded-full p-2 shadow-soft">
        <Button variant="ghost" size="icon" disabled={i === 0} onClick={() => setI((v) => Math.max(0, v - 1))} aria-label="Previous" className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-muted"><ChevronLeft className="h-4 w-4" /></Button>
        <div ref={carouselRef} role="group" aria-label="Alphabet" className="no-scrollbar relative flex min-w-0 flex-1 touch-pan-x gap-1.5 overflow-x-auto overscroll-x-contain py-2">
          {letters.map((x, idx) => (
            <Button variant="ghost" size="icon" key={x} onClick={() => setI(idx)} aria-pressed={idx === i}
              className={cn("h-11 min-w-11 shrink-0 rounded-full font-display text-lg font-bold transition", idx === i ? "scale-110 bg-gradient-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
              {x}
            </Button>
          ))}
        </div>
        <Button variant="ghost" size="icon" disabled={i === 25} onClick={() => setI((v) => Math.min(25, v + 1))} aria-label="Next" className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-muted"><ChevronRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
