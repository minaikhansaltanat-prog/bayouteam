"use client";

import { useEffect } from "react";

// Radix Dialog/Sheet lock body scroll while open (via react-remove-scroll)
// and are expected to release it on close. Our dialogs are conditionally
// *mounted* (`{state && <Dialog .../>}`) rather than always-mounted with
// just `open` toggled — if the underlying state changes while a dialog is
// mid-transition (fast clicks, client-side navigation away from a page
// that had one open, etc.) the unlock can occasionally lose the race and
// leave `overflow: hidden` stuck on <html>/<body> with no dialog actually
// open. This watchdog self-heals that: if nothing with an open dialog role
// is present in the DOM but the lock styles are still set, clear them.
export function ScrollLockGuard() {
  useEffect(() => {
    function unstick() {
      const hasOpenOverlay = document.querySelector(
        '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]',
      );
      if (hasOpenOverlay) return;

      const html = document.documentElement;
      const body = document.body;
      const isLocked =
        html.hasAttribute("data-scroll-locked") ||
        body.hasAttribute("data-scroll-locked") ||
        body.style.overflow === "hidden" ||
        html.style.overflow === "hidden";

      if (!isLocked) return;

      html.removeAttribute("data-scroll-locked");
      body.removeAttribute("data-scroll-locked");
      html.style.removeProperty("overflow");
      body.style.removeProperty("overflow");
      body.style.removeProperty("padding-right");
      body.style.removeProperty("margin-right");
    }

    const interval = window.setInterval(unstick, 400);
    document.addEventListener("click", unstick, true);
    document.addEventListener("keydown", unstick, true);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("click", unstick, true);
      document.removeEventListener("keydown", unstick, true);
    };
  }, []);

  return null;
}
