import admin from "firebase-admin";
import serviceAccount from "./service-account.json";

export const credential = admin.credential.cert(serviceAccount as admin.ServiceAccount);

// add credentials
admin.initializeApp({
  credential
});