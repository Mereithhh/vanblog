/** Fixture stand-in for next/router (NavBar reads asPath). */
export function useRouter() {
  return {
    asPath: '/',
    push(href: string) {
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', href);
      }
    },
  };
}
