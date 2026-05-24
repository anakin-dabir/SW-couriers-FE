/**
 * Hero content configuration for public layout pages
 */
export interface HeroContent {
  title: string;
  description: string;
}

/**
 * Hero content constants for different public pages
 */
export const HERO_CONTENT: Record<string, HeroContent> = {
  register: {
    title: 'Create your account',
    description:
      'Join thousands of businesses using SW Couriers to streamline their logistics and manage deliveries efficiently.',
  },
  'forgot-password': {
    title: 'Reset your password',
    description:
      'Securely reset your password and regain access to your SW Couriers account in just a few steps.',
  },
  login: {
    title: 'Sign in to your account',
    description:
      'Track deliveries in real time, manage invoices with ease, and keep complete control of your logistics — all in one secure portal.',
  },
};

/**
 * Routes that should have gradient on the right side
 */
export const RIGHT_GRADIENT_ROUTES = ['/register', '/forgot-password'];
