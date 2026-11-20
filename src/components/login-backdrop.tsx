import backdrop from "@/assets/login-backdrop.webp";

/** Sign-language artwork sunk under a blue water wash behind the login card. */
export function LoginBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <img src={backdrop} alt="" width={1600} height={2200} className="absolute inset-0 h-full w-full object-cover" />
      {/* slow drifting glow — the vibrating blue behind the card */}
      <div className="animate-drift absolute -left-32 top-1/4 h-[32rem] w-[32rem] rounded-full bg-primary/20 blur-[120px]" />
      <div className="animate-drift absolute -right-24 bottom-0 h-[30rem] w-[30rem] rounded-full bg-primary-glow/25 blur-[130px] [animation-delay:-9s]" />
    </div>
  );
}
