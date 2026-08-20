'use client';

import { useRouter, usePathname, useSearchParams as useNextSearchParams, useParams as useNextParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export function useNavigate() {
  const router = useRouter();
  return useCallback((to, options = {}) => {
    if (typeof to === 'number') {
      if (to === -1) {
        if (typeof window !== 'undefined') window.history.back();
        else router.back();
      }
      return;
    }
    if (!to) return;
    if (options.replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [router]);
}

export function useLocation() {
  const pathname = usePathname() || '/';
  let search = '';
  try {
    const searchParams = useNextSearchParams();
    search = searchParams ? `?${searchParams.toString()}` : '';
  } catch {}

  return useMemo(() => ({
    pathname,
    search: search === '?' ? '' : search,
    hash: typeof window !== 'undefined' ? window.location.hash : '',
    state: null
  }), [pathname, search]);
}

export function useParams() {
  try {
    const params = useNextParams();
    return params || {};
  } catch {
    return {};
  }
}

export function useSearchParams() {
  const router = useRouter();
  const pathname = usePathname();
  let searchParams = null;
  try {
    searchParams = useNextSearchParams();
  } catch {}

  const setSearchParams = useCallback((newParams) => {
    const params = new URLSearchParams(newParams);
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname]);

  return [searchParams || new URLSearchParams(), setSearchParams];
}

export function Navigate({ to, replace = true }) {
  const router = useRouter();
  if (typeof window !== 'undefined' && to) {
    if (replace) router.replace(to);
    else router.push(to);
  }
  return null;
}

export function Routes({ children }) {
  return <>{children}</>;
}

export function Route({ element }) {
  return element || null;
}
