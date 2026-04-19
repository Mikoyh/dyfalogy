import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import midtransClient from 'midtrans-client';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Firebase Admin
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log("Firebase Admin initialized with Service Account.");
    } catch (err) {
      console.error("Failed to initialize Firebase Admin with secret:", err);
    }
  } else if (!admin.apps.length) {
    try {
      // Try initializing with Default Credentials (for Cloud Run/App Engine)
      admin.initializeApp();
      console.log("Firebase Admin initialized with Default Credentials.");
    } catch (err) {
      console.error("Failed to initialize Firebase Admin with default credentials:", err);
    }
  }

  // Initialize Midtrans
  const snap = new midtransClient.Snap({
    isProduction: false, // Set to true for production later
    serverKey: process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-placeholder',
    clientKey: process.env.VITE_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-placeholder'
  });

  app.use(express.json());

  // API Routes
  
  // 1. Create Transaction Token
  app.post("/api/create-payment", async (req, res) => {
    try {
      const { userId, userEmail, userName } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const orderId = `PRO-${userId}-${Date.now()}`;
      
      const parameter = {
        "transaction_details": {
          "order_id": orderId,
          "gross_amount": 5000
        },
        "customer_details": {
          "first_name": userName || "Student",
          "email": userEmail || ""
        },
        "item_details": [
          {
            "id": "pro_model",
            "price": 5000,
            "quantity": 1,
            "name": "Dyfalogy Pro Subscription (1 Month)"
          }
        ],
        "callbacks": {
          "finish": `${req.protocol}://${req.get('host')}/pro-model?status=finish`,
          "error": `${req.protocol}://${req.get('host')}/pro-model?status=error`
        }
      };

      const transaction = await snap.createTransaction(parameter);
      res.json({ token: transaction.token, orderId });
    } catch (error: any) {
      console.error("Midtrans Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 2. Midtrans Webhook Notification
  app.post("/api/payment-webhook", async (req, res) => {
    try {
      const notification = req.body;
      const statusResponse = await snap.transaction.notification(notification);

      const orderId = statusResponse.order_id;
      const transactionStatus = statusResponse.transaction_status;
      const fraudStatus = statusResponse.fraud_status;

      console.log(`Transaction ID: ${orderId}, Status: ${transactionStatus}`);

      if (transactionStatus === 'settlement') {
        if (fraudStatus === 'challenge') {
          // Handle challenge
        } else if (fraudStatus === 'accept') {
          // Success! Update User status
          const userId = orderId.split('-')[1];
          await updateUserDetails(userId);
        }
      } else if (transactionStatus === 'capture') {
        if (fraudStatus === 'challenge') {
          // Handle challenge
        } else if (fraudStatus === 'accept') {
          // Success!
          const userId = orderId.split('-')[1];
          await updateUserDetails(userId);
        }
      }

      res.status(200).send("OK");
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).send("Error");
    }
  });

  // 3. Cancel Subscription (Test/Demo Endpoint)
  app.post("/api/cancel-subscription", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: "User ID required" });

      if (admin.apps.length) {
        const db = admin.firestore();
        await db.collection('users').doc(userId).update({
          isPro: false,
          proUntil: null,
          subscriptionId: null
        });
        console.log(`User ${userId} subscription cancelled via API.`);
        res.json({ message: "Subscription cancelled successfully" });
      } else {
        console.error("Cancellation failed: Firebase Admin not initialized.");
        res.status(500).json({ error: "Firebase Admin not initialized. Please set FIREBASE_SERVICE_ACCOUNT in Secrets." });
      }
    } catch (error: any) {
      console.error("Cancellation error:", error);
      res.status(500).json({ error: error.message || "Failed to update Firestore" });
    }
  });

  async function updateUserDetails(userId: string) {
    if (!admin.apps.length) return;
    
    try {
      const db = admin.firestore();
      const proUntil = new Date();
      proUntil.setDate(proUntil.getDate() + 30); // 30 days subscription

      await db.collection('users').doc(userId).update({
        isPro: true,
        proSince: admin.firestore.FieldValue.serverTimestamp(),
        proUntil: admin.firestore.Timestamp.fromDate(proUntil),
        subscriptionId: `SUB-${Date.now()}`
      });
      console.log(`User ${userId} upgraded to Pro for 30 days via Webhook.`);
    } catch (err) {
      console.error(`Failed to update user ${userId}:`, err);
    }
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
