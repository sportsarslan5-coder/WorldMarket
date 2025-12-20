
import { GoogleGenAI } from "@google/genai";
import { Seller, Order, AdminNotification } from "../types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAdminNotification = async (
  type: 'NEW_SELLER' | 'NEW_ORDER',
  data: Seller | Order
): Promise<AdminNotification> => {
  const prompt = type === 'NEW_SELLER' 
    ? `Draft a WhatsApp message and an Email for an Admin. A new seller has joined PK-Mart. 
       Details: Name: ${(data as Seller).fullName}, Shop: ${(data as Seller).shopName}, 
       Phone: ${(data as Seller).phoneNumber}, Payout: ${(data as Seller).payoutMethod} (${(data as Seller).accountNumber}).
       Format as JSON: { "whatsapp": "string", "email": "string" }`
    : `Draft a WhatsApp message and an Email for an Admin. A new order has been placed.
       Details: Order ID: ${(data as Order).id}, Customer: ${(data as Order).customerName}, 
       Shop: ${(data as Order).sellerName}, Amount: Rs. ${(data as Order).totalAmount}.
       Format as JSON: { "whatsapp": "string", "email": "string" }`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const content = JSON.parse(response.text || '{"whatsapp": "Error", "email": "Error"}');

    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      timestamp: new Date().toISOString(),
      content,
      sent: true
    };
  } catch (error) {
    console.error("Failed to generate notification:", error);
    return {
      id: 'err-' + Date.now(),
      type,
      timestamp: new Date().toISOString(),
      content: { whatsapp: "Fallback Notification", email: "Fallback Notification" },
      sent: false
    };
  }
};
