// Google Analytics 4 Helper Functions

declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

// Track page views
export const pageview = (url: string) => {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

// Track custom events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Predefined events
export const trackSignup = (method: string = 'email') => {
  event({
    action: 'sign_up',
    category: 'engagement',
    label: method,
  });
};

export const trackLogin = (method: string = 'email') => {
  event({
    action: 'login',
    category: 'engagement',
    label: method,
  });
};

export const trackPropertyAdded = () => {
  event({
    action: 'property_added',
    category: 'property_management',
    label: 'new_property',
  });
};

export const trackSubscription = (plan: string, value: number) => {
  event({
    action: 'purchase',
    category: 'ecommerce',
    label: plan,
    value: value,
  });
};

export const trackMaintenanceRequest = () => {
  event({
    action: 'maintenance_request',
    category: 'property_management',
    label: 'new_request',
  });
};
