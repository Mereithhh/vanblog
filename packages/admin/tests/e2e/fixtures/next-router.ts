/** Fixture stand-in for next/router (PageNav jump uses useRouter). */
export function useRouter() {
  return {
    push(href: string) {
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', href);
      }
    },
  };
}
