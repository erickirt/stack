// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { getBrowserCompatibilityProblems } from "@stackframe/stack-shared/dist/utils/browser-compat";
import { nicify } from "@stackframe/stack-shared/dist/utils/strings";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  ignoreErrors: [
		// React throws these errors when used with some browser extensions (eg. Google Translate)
		"NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
		"NotFoundError: Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node.",
	],

  normalizeDepth: 5,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  enabled: process.env.NODE_ENV !== "development" && !process.env.CI,

  replaysOnErrorSampleRate: 1.0,

  replaysSessionSampleRate: 1.0,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],

  // Add exception metadata to the event
  beforeSend(event, hint) {
    const error = hint.originalException;
    let nicified;
    try {
      nicified = nicify(error, { maxDepth: 8 });
    } catch (e) {
      nicified = `Error occurred during nicification: ${e}`;
    }
    if (error instanceof Error) {
      event.extra = {
        ...event.extra,
        cause: error.cause,
        errorProps: {
          ...error,
        },
        nicifiedError: nicified,
        clientBrowserCompatibility: getBrowserCompatibilityProblems(),
      };
    }
    return event;
  },
});
