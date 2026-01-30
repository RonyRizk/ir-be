import { getElement, ComponentInterface } from '@stencil/core';
import { HTMLStencilElement } from '@stencil/core/internal';

/**
 * Decorator: call on a method that *acquires* an overflow lock for the host under a specific tag.
 * Example:
 *   @OverflowAdd('modal')
 *   openModal() { ... }
 */
export function OverflowAdd(tag: string = 'data-ir-overflow') {
  return (_proto: ComponentInterface, _methodName: string, descriptor: PropertyDescriptor) => {
    const original = descriptor?.value;

    descriptor.value = function (...args: any[]) {
      const host = getOverflowHost(this);
      if (host) {
        addOverflowForHost(host, tag);
      }

      return original?.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Decorator: call on a method that *releases* an overflow lock for the host under a specific tag.
 * Example:
 *   @OverflowRelease('modal')
 *   closeModal() { ... }
 */
export function OverflowRelease(tag: string = 'data-ir-overflow') {
  return (_proto: ComponentInterface, _methodName: string, descriptor: PropertyDescriptor) => {
    const original = descriptor?.value;

    descriptor.value = function (...args: any[]) {
      const host = getOverflowHost(this);
      if (host) {
        removeOverflowForHost(host, tag);
      }

      return original?.apply(this, args);
    };

    return descriptor;
  };
}

/** Host augmentation so we can track how many locks this host has per tag. */
export interface HTMLOverflowHostElement extends HTMLStencilElement {
  __overflowTags__?: Map<string, number>;
}

interface TagRegistryEntry {
  hosts: Set<HTMLElement>;
  count: number;
}

/* ---------------------- Core registry & body lock logic --------------------- */

const TAG_REGISTRY: Map<string, TagRegistryEntry> = new Map();
// Attribute on <body> that holds a space-separated list of active tags
const BODY_ATTR = 'data-overflow-locks';
// Style element id prefix for per-tag CSS
const STYLE_ID_PREFIX = 'overflow-style-';

/** Ensure a <style> for this tag exists (once) and targets the body attr token. */
function ensureStyleForTag(tag: string) {
  if (!isDomAvailable()) return;

  const styleId = STYLE_ID_PREFIX + tag;
  if (document.getElementById(styleId)) return;

  // Determine if page has vertical overflow
  const hasOverflow = document.documentElement.scrollHeight > window.innerHeight;

  // Calculate scrollbar width (0 if no overflow)
  const scrollbarWidth = hasOverflow ? window.innerWidth - document.documentElement.clientWidth : 0;

  const css = `
    /* Auto-inserted overflow lock for "${tag}" */
    body[${BODY_ATTR}~="${tag}"] {
      overflow: hidden !important;
      /* margin-inline-end respects LTR/RTL direction */
      margin-inline-end: ${scrollbarWidth}px !important;
    }
  `.trim();

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = css;
  document.head.appendChild(style);
}

/** Add the tag token to body’s data-overflow-locks (space-separated tokens). */
function addBodyTag(tag: string) {
  if (!isDomAvailable()) return;

  ensureStyleForTag(tag);

  const body = document.body;
  const current = (body.getAttribute(BODY_ATTR) || '').trim();
  const tokens = new Set(current ? current.split(/\s+/) : []);
  if (!tokens.has(tag)) {
    tokens.add(tag);
    body.setAttribute(BODY_ATTR, Array.from(tokens).join(' '));
  }
}

/** Remove the tag token from body’s data-overflow-locks. */
function removeBodyTag(tag: string) {
  if (!isDomAvailable()) return;

  const body = document.body;
  const current = (body.getAttribute(BODY_ATTR) || '').trim();
  if (!current) return;

  const tokens = new Set(current.split(/\s+/));
  if (tokens.delete(tag)) {
    const next = Array.from(tokens).join(' ');
    if (next) body.setAttribute(BODY_ATTR, next);
    else body.removeAttribute(BODY_ATTR);
  }
}

/** Register a host under a tag, and lock the body for that tag if it’s the first. */
function addOverflowForHost(host: HTMLOverflowHostElement, tag: string) {
  if (!host || !isDomAvailable()) return;

  // Track on host
  host.__overflowTags__ ||= new Map<string, number>();
  const counts = host.__overflowTags__;
  const previous = counts.get(tag) ?? 0;
  counts.set(tag, previous + 1);

  // Track globally
  let entry = TAG_REGISTRY.get(tag);
  if (!entry) {
    entry = { hosts: new Set<HTMLElement>(), count: 0 };
    TAG_REGISTRY.set(tag, entry);
  }

  if (previous === 0) {
    entry.hosts.add(host as any);
  }

  entry.count += 1;

  // If this is the first active lock for this tag, lock the body for this tag
  if (entry.count === 1) {
    addBodyTag(tag);
  }

  // Safety: auto-clean on detach
  attachDisconnectCleanup(host);
}

/** Unregister a host from a tag, and possibly unlock the body for that tag. */
function removeOverflowForHost(host: HTMLOverflowHostElement, tag: string) {
  if (!host || !isDomAvailable()) return;

  // Update host
  const counts = host.__overflowTags__;
  if (!counts) return;

  const current = counts.get(tag);
  if (!current) return;

  if (current > 1) {
    counts.set(tag, current - 1);
  } else {
    counts.delete(tag);
    if (counts.size === 0) {
      delete host.__overflowTags__;
    }
  }

  // Update global registry
  const entry = TAG_REGISTRY.get(tag);
  if (!entry) return;

  entry.count = Math.max(0, entry.count - 1);

  if (current === 1) {
    entry.hosts.delete(host as any);
  }

  if (entry.count === 0) {
    TAG_REGISTRY.delete(tag);
    removeBodyTag(tag);
    // Optional: also remove the injected style node if you prefer cleanup:
    // const style = document.getElementById(STYLE_ID_PREFIX + tag);
    // style?.remove();
  }
}

/** If a host is removed from the DOM without calling release, auto-clean its tags. */
function attachDisconnectCleanup(host: HTMLOverflowHostElement) {
  if (!host || !isDomAvailable() || typeof MutationObserver === 'undefined') return;
  // Don’t attach multiple observers to the same host
  if ((host as any).__overflowObserver__) return;

  const obs = new MutationObserver(() => {
    // If host is no longer connected, clear all tags it owned
    if (!host.isConnected) {
      const tagEntries = host.__overflowTags__ ? Array.from(host.__overflowTags__.entries()) : [];
      tagEntries.forEach(([tag, count]) => {
        for (let i = 0; i < count; i += 1) {
          removeOverflowForHost(host, tag);
        }
      });
      obs.disconnect();
      delete (host as any).__overflowObserver__;
    }
  });

  obs.observe(document.documentElement, { childList: true, subtree: true });
  (host as any).__overflowObserver__ = obs;
}

function getOverflowHost(instance: any): HTMLOverflowHostElement | null {
  if (!isDomAvailable()) return null;

  try {
    return getElement(instance) as HTMLOverflowHostElement;
  } catch {
    return null;
  }
}

function isDomAvailable(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}
