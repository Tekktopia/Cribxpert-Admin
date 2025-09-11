// Performance utilities for listing management

// Debounce function for search and filtering
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return function debounced(this: unknown, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Throttle function for scroll events
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function throttled(this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Memoization utility for expensive calculations
export function memoize<T extends (...args: unknown[]) => unknown>(fn: T): T {
  const cache = new Map();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// Intersection Observer utility for lazy loading
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: "50px",
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver(callback, defaultOptions);
}

// Image preloader utility
export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
          img.src = url;
        })
    )
  );
}

// Virtual scrolling calculations
export interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  itemCount: number;
  overscan?: number;
}

export interface VirtualScrollResult {
  startIndex: number;
  endIndex: number;
  offsetY: number;
}

export function calculateVirtualScroll(
  scrollTop: number,
  config: VirtualScrollConfig
): VirtualScrollResult {
  const { itemHeight, containerHeight, itemCount, overscan = 3 } = config;

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const endIndex = Math.min(
    itemCount - 1,
    startIndex + visibleCount + overscan * 2
  );
  const offsetY = startIndex * itemHeight;

  return { startIndex, endIndex, offsetY };
}

// Performance monitoring utilities
export function measurePerformance<T>(name: string, fn: () => T): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();

  console.log(`${name} took ${end - start} milliseconds`);
  return result;
}

// Memory cleanup utility for component unmounting
export function createCleanupManager() {
  const cleanupFunctions: Array<() => void> = [];

  return {
    add: (cleanup: () => void) => {
      cleanupFunctions.push(cleanup);
    },

    cleanup: () => {
      cleanupFunctions.forEach((fn) => {
        try {
          fn();
        } catch (error) {
          console.error("Error during cleanup:", error);
        }
      });
      cleanupFunctions.length = 0;
    },
  };
}

// Optimized array filtering for large datasets with security validation
export function optimizedFilter<T>(
  items: T[],
  predicate: (item: T) => boolean,
  batchSize: number = 1000
): Promise<T[]> {
  return new Promise((resolve) => {
    const result: T[] = [];
    let index = 0;

    function processBatch() {
      const endIndex = Math.min(index + batchSize, items.length);

      for (let i = index; i < endIndex; i++) {
        // Ensure valid array bounds and type safety
        if (i >= 0 && i < items.length && Array.isArray(items)) {
          try {
            // Use safe array access method
            const item = items.at(i);
            if (item !== null && item !== undefined && predicate(item)) {
              result.push(item);
            }
          } catch (error) {
            // Skip invalid items
            console.warn("Skipping invalid item at index", i, error);
          }
        }
      }

      index = endIndex;

      if (index < items.length) {
        // Use setTimeout to yield control and prevent blocking
        setTimeout(processBatch, 0);
      } else {
        resolve(result);
      }
    }

    processBatch();
  });
}

// Request idle callback polyfill
export function requestIdleCallback(
  callback: (deadline: { timeRemaining: () => number }) => void,
  options: { timeout?: number } = {}
): number {
  if (typeof window.requestIdleCallback !== "undefined") {
    return window.requestIdleCallback(callback, options);
  }

  // Polyfill for browsers that don't support requestIdleCallback
  const timeout = options.timeout || 0;
  const startTime = Date.now();

  return setTimeout(() => {
    callback({
      timeRemaining: () => Math.max(0, 50 - (Date.now() - startTime)),
    });
  }, timeout) as unknown as number;
}
