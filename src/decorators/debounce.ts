/**
 * Debounce decorator that delays method execution until after wait milliseconds
 * have elapsed since the last time it was invoked.
 *
 * @param wait - The number of milliseconds to delay
 * @param options - Configuration options
 * @param options.leading - Execute on the leading edge (default: false)
 * @param options.trailing - Execute on the trailing edge (default: true)
 */
export function Debounce(wait: number, options: { leading?: boolean; trailing?: boolean } = {}) {
  return function (_, __, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const { leading = false, trailing = true } = options;

    // Store timeout IDs per instance
    const timeoutMap = new WeakMap<any, NodeJS.Timeout>();
    const lastCallMap = new WeakMap<any, number>();

    descriptor.value = function (this: any, ...args: any[]) {
      const context = this;
      const now = Date.now();

      const existingTimeout = timeoutMap.get(context);
      const lastCall = lastCallMap.get(context);

      // Clear existing timeout
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Execute on leading edge if enabled and it's the first call
      if (leading && !existingTimeout) {
        originalMethod.apply(context, args);
        lastCallMap.set(context, now);
      }

      // Set up trailing execution
      if (trailing) {
        const timeout = setTimeout(() => {
          if (!leading || (leading && lastCall && now - lastCall >= wait)) {
            originalMethod.apply(context, args);
          }
          timeoutMap.delete(context);
          lastCallMap.delete(context);
        }, wait);

        timeoutMap.set(context, timeout);
      }
    };

    return descriptor;
  };
}
