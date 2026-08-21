'use client';

import { useRouter, usePathname, useParams as useNextParams } from 'next/navigation';
import { useCallback, useMemo, useEffect, useState, forwardRef } from 'react';
import NextLink from 'next/link';

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
  const [search, setSearch] = useState('');
  const [hash, setHash] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSearch(window.location.search || '');
      setHash(window.location.hash || '');
    }
  }, [pathname]);

  return useMemo(() => ({
    pathname,
    search: typeof window !== 'undefined' ? window.location.search : search,
    hash: typeof window !== 'undefined' ? window.location.hash : hash,
    state: null
  }), [pathname, search, hash]);
}

export function useParams() {
  const params = useNextParams();
  return params || {};
}

export function useSearchParams() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchParams, setSearchParamsState] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams();
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSearchParamsState(new URLSearchParams(window.location.search));
    }
  }, [pathname]);

  const setSearchParams = useCallback((newParams) => {
    const params = new URLSearchParams(newParams);
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname]);

  return [searchParams, setSearchParams];
}

export function Navigate({ to, replace = true }) {
  const router = useRouter();
  useEffect(() => {
    if (to) {
      if (replace) router.replace(to);
      else router.push(to);
    }
  }, [router, to, replace]);
  return null;
}

export const Link = forwardRef(function Link({ to, href, children, ...props }, ref) {
  const target = to || href || '#';
  return (
    <NextLink ref={ref} href={target} {...props}>
      {children}
    </NextLink>
  );
});

export const NavLink = forwardRef(function NavLink({ to, href, className, children, ...props }, ref) {
  const pathname = usePathname();
  const target = to || href || '#';
  const isActive = pathname === target;
  const computedClassName = typeof className === 'function' ? className({ isActive }) : className;

  return (
    <NextLink ref={ref} href={target} className={computedClassName} {...props}>
      {children}
    </NextLink>
  );
});

export function Routes({ children }) {
  return <>{children}</>;
}

export function Route({ element }) {
  return element || null;
}

