/**
 * client/src/utils/performance.js
 * Web Vitals monitoring, performance tracking, error boundary
 */

// ── Web Vitals reporting ──────────────────────────────────────
// Install: npm install web-vitals
export function reportWebVitals(onPerfEntry) {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);   // Cumulative Layout Shift
      getFID(onPerfEntry);   // First Input Delay
      getFCP(onPerfEntry);   // First Contentful Paint
      getLCP(onPerfEntry);   // Largest Contentful Paint
      getTTFB(onPerfEntry);  // Time to First Byte
    }).catch(() => {});
  }
}

// Send vitals to analytics endpoint
export function sendVitalsToAnalytics({ name, delta, id, rating }) {
  if (!navigator.sendBeacon) return;
  const body = JSON.stringify({ metric: name, value: Math.round(delta), id, rating, url: window.location.href, timestamp: Date.now() });
  navigator.sendBeacon('/api/analytics/vitals', body);
}

// ── Error Boundary component ──────────────────────────────────
const { Component } = require('react');

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log to error tracking service (Sentry, etc.)
    console.error('ErrorBoundary caught:', error, errorInfo);
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, { extra: errorInfo });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        require('react').createElement('div', {
          style: { textAlign:'center', padding:'80px 24px', fontFamily:'var(--font-sans)' },
        },
          require('react').createElement('div', { style:{ fontSize:64, marginBottom:16 } }, '⚠️'),
          require('react').createElement('h2', { style:{ fontFamily:'var(--font-serif)', fontSize:28, fontWeight:400, marginBottom:8 } }, 'Something went wrong'),
          require('react').createElement('p', { style:{ color:'var(--muted)', marginBottom:24 } }, 'We\'re sorry for the inconvenience. Please refresh the page.'),
          require('react').createElement('button', {
            onClick: () => window.location.reload(),
            style: { padding:'11px 28px', background:'var(--dark)', color:'white', border:'none', borderRadius:4, fontSize:12, letterSpacing:'1.5px', textTransform:'uppercase', cursor:'pointer', fontFamily:'var(--font-sans)' },
          }, 'Refresh Page')
        )
      );
    }
    return this.props.children;
  }
}

// ── Lazy image loading with Intersection Observer ─────────────
export function useLazyLoad(ref) {
  const { useState, useEffect } = require('react');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!ref.current || !('IntersectionObserver' in window)) {
      setLoaded(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setLoaded(true); observer.disconnect(); } },
      { rootMargin: '200px' }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  return loaded;
}

// ── Performance marks for custom timing ──────────────────────
export const perf = {
  mark:    (name)        => performance?.mark?.(name),
  measure: (name, start) => { try { performance?.measure?.(name, start); } catch {} },
  get:     (name)        => performance?.getEntriesByName?.(name)?.[0]?.duration,
};

// ── Memory usage check (Chrome only) ─────────────────────────
export function getMemoryUsage() {
  const mem = performance?.memory;
  if (!mem) return null;
  return {
    used:     Math.round(mem.usedJSHeapSize / 1048576),
    total:    Math.round(mem.totalJSHeapSize / 1048576),
    limit:    Math.round(mem.jsHeapSizeLimit / 1048576),
    unit:     'MB',
  };
}

// ── Image optimization helper ─────────────────────────────────
export function getOptimizedImageUrl(cloudinaryUrl, { width = 400, quality = 'auto', format = 'auto' } = {}) {
  if (!cloudinaryUrl?.includes('cloudinary.com')) return cloudinaryUrl;
  return cloudinaryUrl.replace('/upload/', `/upload/w_${width},q_${quality},f_${format}/`);
}

// ── Debounced window resize hook ──────────────────────────────
export function useWindowSize() {
  const { useState, useEffect } = require('react');
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    let timer;
    const handler = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setSize({ width: window.innerWidth, height: window.innerHeight }), 150);
    };
    window.addEventListener('resize', handler, { passive: true });
    return () => { clearTimeout(timer); window.removeEventListener('resize', handler); };
  }, []);

  return { ...size, isMobile: size.width < 640, isTablet: size.width < 1024, isDesktop: size.width >= 1024 };
}

// Add to client/src/index.js:
// import { reportWebVitals, sendVitalsToAnalytics } from './utils/performance';
// reportWebVitals(sendVitalsToAnalytics);