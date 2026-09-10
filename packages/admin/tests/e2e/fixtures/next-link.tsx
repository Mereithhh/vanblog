import { ReactNode } from 'react';

/** Fixture stand-in for next/link so PageNav can bundle without Next.js. */
export default function Link({
  href,
  children,
  ...rest
}: {
  href: string;
  children?: ReactNode;
  [key: string]: unknown;
}) {
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}
