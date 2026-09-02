import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useLocation } from 'react-router-dom';

interface TrackingContextValue {
  trackEvent: (eventType: string, eventData?: Record<string, unknown>, productName?: string) => void;
  getVisitorId: () => string;
  getWhatsappId: () => string | null;
  setWhatsappId: (whatsapp: string) => void;
}

const TrackingContext = createContext<TrackingContextValue | undefined>(undefined);

const VISITOR_KEY = 'mb_visitor_id';
const WHATSAPP_KEY = 'mb_whatsapp_id';

function generateVisitorId(): string {
  return `v_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function TrackingProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const visitorIdRef = useRef<string>('');

  // Initialize or load visitor ID
  useEffect(() => {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = generateVisitorId();
      localStorage.setItem(VISITOR_KEY, id);
    }
    visitorIdRef.current = id;

    // Register/update visitor
    (async () => {
      const whatsapp = localStorage.getItem(WHATSAPP_KEY);
      const { data: existing } = await supabase
        .from('visitors')
        .select('id, visit_count')
        .eq('visitor_id', id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('visitors')
          .update({
            last_visit: new Date().toISOString(),
            visit_count: (existing.visit_count || 1) + 1,
            whatsapp: whatsapp || null,
          })
          .eq('visitor_id', id);
      } else {
        await supabase.from('visitors').insert({
          visitor_id: id,
          whatsapp: whatsapp || null,
        });
      }
    })();
  }, []);

  // Track page views
  useEffect(() => {
    if (!visitorIdRef.current) return;
    const path = location.pathname;
    if (path.startsWith('/admin')) return;

    trackEvent('page_view', { path });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const getVisitorId = () => visitorIdRef.current;
  const getWhatsappId = () => localStorage.getItem(WHATSAPP_KEY);
  const setWhatsappId = (whatsapp: string) => localStorage.setItem(WHATSAPP_KEY, whatsapp);

  const trackEvent = (
    eventType: string,
    eventData: Record<string, unknown> = {},
    productName?: string
  ) => {
    const visitorId = visitorIdRef.current;
    if (!visitorId) return;
    const whatsapp = localStorage.getItem(WHATSAPP_KEY);

    supabase.from('customer_events').insert({
      visitor_id: visitorId,
      whatsapp: whatsapp || null,
      event_type: eventType,
      event_data: eventData,
      product_name: productName || null,
    }).then(() => {});
  };

  return (
    <TrackingContext.Provider value={{ trackEvent, getVisitorId, getWhatsappId, setWhatsappId }}>
      {children}
    </TrackingContext.Provider>
  );
}

export function useTracking() {
  const ctx = useContext(TrackingContext);
  if (!ctx) throw new Error('useTracking must be used within TrackingProvider');
  return ctx;
}
