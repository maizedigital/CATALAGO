import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  canonical?: string;
  noindex?: boolean;
}

const DEFAULT_TITLE = 'NV';

export function useSEO({ title, description, image, canonical, noindex }: SEOProps) {
  useEffect(() => {
    document.title = title;

    const setMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    if (description) {
      setMeta('description', description);
      setMeta('og:description', description, 'property');
      setMeta('twitter:description', description);
    }

    setMeta('og:title', title, 'property');
    setMeta('twitter:title', title);

    if (image) {
      setMeta('og:image', image, 'property');
      setMeta('twitter:image', image);
    }

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonical;
    }

    setMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow');

    return () => {
      if (title !== DEFAULT_TITLE) {
        document.title = DEFAULT_TITLE;
      }
    };
  }, [title, description, image, canonical, noindex]);
}
