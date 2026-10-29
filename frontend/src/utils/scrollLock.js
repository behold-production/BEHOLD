/* ─────────────────────────────────────────────────────────────────────────────
 * Background scroll lock for overlays
 *
 * Every dialog on the public site used to lock the page its own way — some set
 * `document.body.style.overflow`, some toggled the `.no-scroll` class, several
 * didn't lock at all. The failure modes were:
 *
 *   • Nested dialogs (booking → auth → date picker) each restored the lock on
 *     unmount, so closing the inner one unfroze the page under the outer one.
 *   • `overflow: hidden` on `body` alone is ignored by iOS Safari, so the page
 *     behind the sheet still rubber-banded.
 *   • The old `.no-scroll` rule forced `height: 100vh` and `touch-action: none`,
 *     which killed touch scrolling *inside* the dialog and jumped the page to
 *     the top when the dialog closed.
 *
 * This module keeps a reference count and parks the document with
 * `position: fixed` at its current offset, so the lock is airtight on touch
 * devices and the scroll position is restored byte-for-byte on release.
 * ──────────────────────────────────────────────────────────────────────────── */

import { useEffect } from 'react';

let lockCount = 0;
let parkedTop = 0;

export function lockBodyScroll() {
  if (typeof document === 'undefined') return () => {};

  lockCount += 1;
  if (lockCount > 1) {
    // A shallower dialog already parked the page; just fall out when it closes.
    return () => unlockBodyScroll();
  }

  parkedTop = window.scrollY || document.documentElement.scrollTop || 0;

  const { documentElement: html } = document;
  const scrollbarWidth = window.innerWidth - html.clientWidth;

  html.style.setProperty('position', 'fixed', 'important');
  html.style.setProperty('top', `-${parkedTop}px`, 'important');
  html.style.setProperty('left', '0', 'important');
  html.style.setProperty('right', '0', 'important');
  html.style.setProperty('width', '100%', 'important');
  if (scrollbarWidth > 0) {
    document.body.style.setProperty('padding-right', `${scrollbarWidth}px`, 'important');
  }
  document.body.style.setProperty('overflow', 'hidden', 'important');

  // The navbar and any other fixed chrome measure scrollY to decide their
  // scrolled state; while parked it reads 0, so tell CSS we are locked.
  html.classList.add('scroll-locked');

  return () => unlockBodyScroll();
}

export function unlockBodyScroll() {
  if (typeof document === 'undefined') return;

  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;

  const { documentElement: html } = document;

  html.style.removeProperty('position');
  html.style.removeProperty('top');
  html.style.removeProperty('left');
  html.style.removeProperty('right');
  html.style.removeProperty('width');
  document.body.style.removeProperty('overflow');
  document.body.style.removeProperty('padding-right');
  html.classList.remove('scroll-locked');

  window.scrollTo(0, parkedTop);
  parkedTop = 0;
}

/**
 * Hook form used by every dialog. Keeps the lock tied to `isOpen` and to
 * mount/unmount, so a route change that tears down an overlay can never leave
 * the page frozen.
 */
export function useScrollLock(isOpen) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const release = lockBodyScroll();
    return release;
  }, [isOpen]);
}
