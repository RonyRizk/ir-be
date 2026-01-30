import { getElement, ComponentInterface } from '@stencil/core';
import { HTMLStencilElement } from '@stencil/core/internal';

/**
 * Call this function as soon as the click outside of annotated method's host is done.
 * @example
```
@ClickOutside()
callback() {
  // this will run when click outside of element (host component) is done.
}
```
 */
export function ClickOutside() {
  return (proto: ComponentInterface, methodName: string, descriptor: PropertyDescriptor) => {
    const originalConnected = proto.connectedCallback;
    const originalDisconnected = proto.disconnectedCallback;
    const originalDidUnload = proto.componentDidUnload;

    proto.connectedCallback = function (...args: any[]) {
      const host = getClickOutsideHost(this);
      if (host) {
        const callback = (this as any)[methodName]?.bind(this);
        if (callback) {
          registerClickOutside(this, host, callback);
        }
      }

      return originalConnected?.apply(this, args);
    };

    proto.disconnectedCallback = function (...args: any[]) {
      const host = getClickOutsideHost(this);
      if (host) {
        unregisterClickOutside(host);
      }

      return originalDisconnected?.apply(this, args);
    };

    proto.componentDidUnload = function (...args: any[]) {
      const host = getClickOutsideHost(this);
      if (host) {
        unregisterClickOutside(host);
      }

      return originalDidUnload?.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Register callback function for HTMLElement to be executed when user clicks outside of element.
 * @example
```
<span 
    ref={spanEl => registerClickOutside(this, spanEl, () => this.test())}>
      Hello, World!
</span>;
```
 */
export function registerClickOutside(component: ComponentInterface, element: HTMLClickOutsideElement, callback: (event: Event) => void): void {
  if (!element || !isDomAvailable()) return;
  if (element.__irClickOutsideCleanup__) return;

  const handler = (event: Event) => {
    if (isEventInsideHost(element as any, event)) {
      return;
    }

    callback.call(component, event);
  };

  window.addEventListener('click', handler, true);

  element.__irClickOutsideCleanup__ = () => {
    window.removeEventListener('click', handler, true);
  };
}

export function unregisterClickOutside(element: HTMLClickOutsideElement | null | undefined): void {
  if (!element || !isDomAvailable()) return;
  element.__irClickOutsideCleanup__?.();
  delete element.__irClickOutsideCleanup__;
}

export interface HTMLClickOutsideElement extends HTMLStencilElement {
  __irClickOutsideCleanup__?: () => void;
}

function getClickOutsideHost(instance: any): HTMLClickOutsideElement | null {
  if (!isDomAvailable()) return null;

  try {
    return getElement(instance) as HTMLClickOutsideElement;
  } catch {
    return null;
  }
}

function isEventInsideHost(host: HTMLElement, event: Event): boolean {
  if (!event) return false;

  const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
  if (Array.isArray(path) && path.includes(host)) {
    return true;
  }

  const target = event.target as Node | null;
  if (!target) return false;

  if (host === target) return true;
  if (typeof (host as any).contains === 'function' && host.contains(target)) return true;

  return !!host.shadowRoot?.contains(target);
}

function isDomAvailable(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}
