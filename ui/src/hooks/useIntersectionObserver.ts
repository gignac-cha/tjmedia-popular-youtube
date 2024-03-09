import { useCallback, useMemo, useState } from 'react';

export const useIntersectionObserver = () => {
  const [isIntersected, setIntersected] = useState(false);
  const [target, setTarget] = useState<Element>();

  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const isIntersected = entries.some(
        (entry: IntersectionObserverEntry) => entry.isIntersecting,
      );
      if (isIntersected) {
        setIntersected(true);
      }
    },
    [],
  );

  const observer = useMemo(
    () => new IntersectionObserver(observerCallback),
    [observerCallback],
  );

  const observe = useCallback(
    (target: HTMLElement) => {
      observer.observe(target);
      setTarget(target);
    },
    [observer],
  );
  const unobserve = useCallback(() => {
    if (target) {
      observer.unobserve(target);
    }
  }, [observer, target]);

  return { isIntersected, observe, unobserve };
};
