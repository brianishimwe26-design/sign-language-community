export function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="animate-drift absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-primary/25 blur-[120px]" />
      <div className="animate-drift absolute -bottom-40 right-0 h-[38rem] w-[38rem] rounded-full bg-primary-glow/25 blur-[130px] [animation-delay:-9s]" />
      <div className="absolute inset-0 bg-[radial-gradient(oklch(1_0_0/6%)_1px,transparent_1px)] [background-size:28px_28px]" />
    </div>
  );
}
