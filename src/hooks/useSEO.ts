import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
}

export function useSEO({ title, description, image }: SEOProps) {
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
  }, [title, description, image]);
}
