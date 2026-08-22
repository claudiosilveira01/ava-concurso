// Firebase Admin SDK — usado apenas em API routes (server-side).
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getDatabase, type Database } from "firebase-admin/database";

let adminApp: App | null = null;

export const firebaseAdminConfigurado = Boolean(
  process.env.FIREBASE_ADMIN_SDK_KEY && process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
);

function getAdminApp(): App {
  if (adminApp) return adminApp;
  if (!firebaseAdminConfigurado) {
    throw new Error("Firebase Admin não configurado (FIREBASE_ADMIN_SDK_KEY / NEXT_PUBLIC_FIREBASE_DATABASE_URL ausentes)");
  }
  if (getApps().length) {
    adminApp = getApps()[0];
    return adminApp;
  }
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY as string);
  adminApp = initializeApp({
    credential: cert(serviceAccount),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
  return adminApp;
}

export function getAdminDatabase(): Database {
  return getDatabase(getAdminApp());
}
