'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export function SentryInitializer() {
  useEffect(() => {
    // Always initialize Sentry in development, or if NEXT_PUBLIC_SENTRY_ENABLED is true, or in production
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_SENTRY_ENABLED === 'true') {
      Sentry.init({
        dsn: "https://3179da9c078565b8682aa3f466390b16@o4509331430113280.ingest.de.sentry.io/4509474585116752",
        debug: true, // Always enable debug mode in development, can be conditional for production
        tracesSampleRate: 1.0, // Capture 100% of transactions for performance monitoring
        // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
        tracePropagationTargets: ["localhost", /^https:\/\/your- Produktions-domain\.com\/api/], // Adjust your production domain
        // Capture Replay for 10% of all sessions,
        // plus for 100% of sessions with an error
        replaysSessionSampleRate: 0.1, // Adjust as needed
        replaysOnErrorSampleRate: 1.0, // Capture all error sessions
        
        // You can add integrations here if needed, e.g.
        // integrations: [
        //   Sentry.replayIntegration(),
        // ],

        // We recommend adjusting this value in production, or using tracesSampler
        // for finer control
        environment: process.env.NODE_ENV || 'development', // 'development' or 'production'
      });
      console.log(`✅ Global Sentry SDK Initialized for environment: ${process.env.NODE_ENV || 'development'}`);
    } else {
      // This else block might not be reached if NODE_ENV is always 'development' or 'production' locally/deployed
      console.log('ℹ️ Sentry SDK not initialized (conditions not met)');
    }
  }, []);

  return null; // This component does not render anything
}
