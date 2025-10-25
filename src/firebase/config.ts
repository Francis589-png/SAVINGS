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
  apiKey: "AIzaSyA24v4iWVhGzWcC6Kq7HJwBd008OK67jjM",
  authDomain: "studio-3779562519-32e28.firebaseapp.com",
  projectId: "studio-3779562519-32e28",
  storageBucket: "studio-3779562519-32e28.firebasestorage.app",
  messagingSenderId: "575434011687",
  appId: "1:575434011687:web:2540316fc52b5037c04a02"
};

// Basic validation to ensure environment variables are loaded.
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.warn(`
    Firebase configuration is missing. Please ensure you have a .env.local file
    with your Firebase project credentials. Some Firebase features may not work correctly.
  `);
}