import {
  DetailsHTMLAttributes,
  HTMLAttributes,
  PropsWithChildren,
  forwardRef,
} from 'react';

const Summary = ({
  children,
  className,
}: PropsWithChildren<HTMLAttributes<HTMLElement>>) => {
  return <summary {...{ className }}>{children}</summary>;
};

const DetailsWithRef = forwardRef<
  HTMLDetailsElement,
  PropsWithChildren<DetailsHTMLAttributes<HTMLDetailsElement>>
>(({ children, className, title, onToggle }, ref) => {
  return (
    <details ref={ref} {...{ className, title, onToggle }}>
      {children}
    </details>
  );
});
DetailsWithRef.displayName;

export const Details = Object.assign(DetailsWithRef, { Summary });
