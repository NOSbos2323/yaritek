import { useState, useEffect, useMemo, useCallback } from "react";

interface VirtualizationOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  threshold?: number;
}

export const useVirtualization = <T>(
  items: T[],
  options: VirtualizationOptions,
) => {
  const {
    itemHeight,
    containerHeight,
    overscan = 5,
    threshold = 0.1,
  } = options;
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  // Throttled scroll handler to improve performance
  const throttledSetScrollTop = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      let lastScrollTime = 0;

      return (newScrollTop: number) => {
        const now = Date.now();
        const timeSinceLastScroll = now - lastScrollTime;

        if (timeSinceLastScroll >= 16) {
          // ~60fps
          setScrollTop(newScrollTop);
          lastScrollTime = now;
        } else {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            setScrollTop(newScrollTop);
            lastScrollTime = Date.now();
          }, 16 - timeSinceLastScroll);
        }
      };
    })(),
    [],
  );

  const visibleRange = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / itemHeight) - overscan,
    );
    const endIndex = Math.min(
      items.length - 1,
      startIndex + visibleCount + overscan * 2,
    );

    return { startIndex, endIndex, visibleCount };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    if (items.length === 0) return [];

    return items
      .slice(visibleRange.startIndex, visibleRange.endIndex + 1)
      .map((item, index) => ({
        item,
        index: visibleRange.startIndex + index,
        key: `${visibleRange.startIndex + index}`,
      }));
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = event.currentTarget.scrollTop;
      throttledSetScrollTop(newScrollTop);

      if (!isScrolling) {
        setIsScrolling(true);
      }

      // Clear scrolling state after scroll ends
      clearTimeout(handleScroll.timeoutId);
      handleScroll.timeoutId = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    },
    [throttledSetScrollTop, isScrolling],
  ) as any;

  // Scroll to specific index
  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const scrollTop = index * itemHeight;
      return { scrollTop, behavior };
    },
    [itemHeight],
  );

  // Get item at specific scroll position
  const getItemAtScrollTop = useCallback(
    (scrollTop: number) => {
      return Math.floor(scrollTop / itemHeight);
    },
    [itemHeight],
  );

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    scrollToIndex,
    getItemAtScrollTop,
    isScrolling,
    visibleRange,
    itemsCount: items.length,
  };
};
