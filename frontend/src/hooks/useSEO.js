/**
 * V10.7 — useSEO hook
 *
 * Hook reutilizabil pentru per-route SEO meta + JSON-LD.
 * Centralizează ce făcea IndustrySeoPage manual, astfel încât orice pagină
 * publică să beneficieze de Google rich snippets cu un singur apel.
 *
 * Usage:
 *   useSEO({
 *     title: "Pricing · Energy Project Design",
 *     description: "...",
 *     canonical: "https://www.energyprojectdesign.com/pricing",
 *     keywords: "pricing, abonament, planuri",
 *     ogImage: "https://.../og-pricing.jpg",
 *     jsonLd: { "@type": "Product", ... },           // optional
 *     breadcrumbs: [{ name: "Home", url: "/" }, ...] // optional
 *   });
 */
import { useEffect } from 'react';

const SITE_URL = 'https://www.energyprojectdesign.com';
const DEFAULT_OG = `${SITE_URL}/branding/epd_hero_banner.png`;

function _setMeta(name, content, isProp = false) {
  if (!content) return;
  const sel = isProp ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let el = document.querySelector(sel);
  if (!el) {
    el = document.createElement('meta');
    if (isProp) el.setAttribute('property', name);
    else el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function _setCanonical(url) {
  if (!url) return;
  let canon = document.querySelector('link[rel="canonical"]');
  if (!canon) {
    canon = document.createElement('link');
    canon.rel = 'canonical';
    document.head.appendChild(canon);
  }
  canon.setAttribute('href', url);
}

function _injectJsonLd(id, payload) {
  if (!payload) return null;
  // Remove any previous version with same id
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = id;
  script.text = JSON.stringify(payload);
  document.head.appendChild(script);
  return script;
}

/**
 * SEO hook — applies meta tags and structured data when a page mounts,
 * and cleans up the per-page JSON-LD scripts on unmount so the next page
 * doesn't accumulate stale rich snippets.
 */
export default function useSEO({
  title,
  description,
  canonical,
  keywords,
  ogImage = DEFAULT_OG,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  jsonLd = null,
  breadcrumbs = null, // [{ name, url }]
  noindex = false,
} = {}) {
  useEffect(() => {
    if (title) document.title = title;

    _setMeta('description', description);
    _setMeta('keywords', keywords);

    if (noindex) {
      _setMeta('robots', 'noindex, nofollow');
    } else {
      _setMeta('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    }

    // Open Graph
    _setMeta('og:title', title, true);
    _setMeta('og:description', description, true);
    _setMeta('og:url', canonical, true);
    _setMeta('og:type', ogType, true);
    _setMeta('og:image', ogImage, true);
    _setMeta('og:site_name', 'Energy Project Design', true);

    // Twitter
    _setMeta('twitter:card', twitterCard);
    _setMeta('twitter:title', title);
    _setMeta('twitter:description', description);
    _setMeta('twitter:image', ogImage);

    // Canonical
    _setCanonical(canonical);

    // Per-page JSON-LD payload (Service, Product, Article, etc.)
    const pageScript = jsonLd ? _injectJsonLd('page-jsonld', jsonLd) : null;

    // Breadcrumbs — separate JSON-LD block
    let breadcrumbScript = null;
    if (breadcrumbs && breadcrumbs.length > 0) {
      breadcrumbScript = _injectJsonLd('breadcrumb-jsonld', {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((b, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: b.name,
          item: b.url?.startsWith('http') ? b.url : `${SITE_URL}${b.url || ''}`,
        })),
      });
    }

    return () => {
      // Clean up injected per-page scripts; meta tags persist as fallback
      pageScript?.remove();
      breadcrumbScript?.remove();
    };
  }, [title, description, canonical, keywords, ogImage, ogType, twitterCard, jsonLd, breadcrumbs, noindex]);
}

export { SITE_URL, DEFAULT_OG };
