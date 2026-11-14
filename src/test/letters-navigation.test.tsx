import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Letters } from "@/routes/_shell.letters";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Alphabet navigation", () => {
  it("scrolls P into the strip after fifteen next-arrow presses", () => {
    const scrollTo = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollTo", { configurable: true, value: scrollTo });
    render(<Letters />);
    const strip = screen.getByRole("group", { name: "Alphabet" });
    const p = screen.getByRole("button", { name: "P", exact: true });
    Object.defineProperty(strip, "clientWidth", { configurable: true, value: 250 });
    Object.defineProperty(p, "offsetLeft", { configurable: true, value: 750 });
    Object.defineProperty(p, "offsetWidth", { configurable: true, value: 44 });
    for (let n = 0; n < 15; n++) fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(p).toHaveAttribute("aria-pressed", "true");
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 647, behavior: "smooth" });
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(screen.getByRole("button", { name: "O", exact: true })).toHaveAttribute("aria-pressed", "true");
  });
});