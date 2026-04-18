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

  // Initialize Firebase Admin (Optional: only if Service Account is provided)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log("Firebase Admin initialized successfully.");
    } catch (err) {
      console.error("Failed to initialize Firebase Admin:", err);
    }
  }

  // Initialize Midtrans
  const snap = new midtransClient.Snap({
    isProduction: false, // Set to true for production later
    serverKey: process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-placeholder',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-placeholder'
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
            "name": "Dyfalogy Pro Lifetime"
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

  async function updateUserDetails(userId: string) {
    if (!admin.apps.length) return;
    
    try {
      const db = admin.firestore();
      await db.collection('users').doc(userId).update({
        isPro: true,
        proSince: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`User ${userId} upgraded to Pro via Webhook.`);
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
