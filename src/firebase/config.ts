
// This configuration uses environment variables for security and flexibility.
// For local development, you must create a `.env.local` file in the root of your
// project and add your Firebase project's configuration there.
//
// Example .env.local:
// NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
// NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
// NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
// NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
// NEXT_PUBLIC_FIREBASE_APP_ID="..."

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Basic validation to ensure environment variables are loaded.
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.warn(`
    Firebase configuration is missing. Please ensure you have a .env.local file
    with your Firebase project credentials. Some Firebase features may not work correctly.
  `);
}
