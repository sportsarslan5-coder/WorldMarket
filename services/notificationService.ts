
import { GoogleGenAI } from "@google/genai";
import { Seller, Order, AdminNotification } from "../types.ts";

export const generateAdminNotification = async (
  type: 'NEW_SELLER' | 'NEW_ORDER',
  data: Seller | Order
): Promise<AdminNotification> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    return createFallbackNotification(type, data);
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = type === 'NEW_SELLER' 
    ? `CRITICAL ADMIN ALERT: A new vendor has registered on PK-MART.
       VENDOR PII (DO NOT SHARE WITH USER):
       Name: ${(data as Seller).fullName}
       Email: ${(data as Seller).email}
       Phone: ${(data as Seller).phoneNumber}
       Shop Name: ${(data as Seller).shopName}
       Payout: ${(data as Seller).payoutMethod} - ${(data as Seller).accountNumber}
       
       Draft a WhatsApp message and a formal Email for the Admin to review this vendor.
       Format as JSON: { "whatsapp": "string", "email": "string" }`
    : `URGENT ORDER ALERT: A customer placed an order.
       ORDER DETAILS:
       Order ID: ${(data as Order).id}
       Shop: ${(data as Order).sellerName}
       Customer: ${(data as Order).customerName} (${(data as Order).customerPhone})
       Address: ${(data as Order).customerAddress}
       Amount: Rs. ${(data as Order).totalAmount}
       
       Draft a WhatsApp message and an Email for the Admin to initiate logistics.
       Format as JSON: { "whatsapp": "string", "email": "string" }`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const responseText = response.text || "";
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const content = JSON.parse(cleanJson);

    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      timestamp: new Date().toISOString(),
      content: {
        whatsapp: content.whatsapp || "New platform activity detected.",
        email: content.email || "Platform event logged. Check Admin Dashboard."
      },
      sent: true
    };
  } catch (error) {
    console.error("Failed to generate AI notification:", error);
    return createFallbackNotification(type, data);
  }
};

const createFallbackNotification = (type: string, data: any): AdminNotification => {
  const title = type === 'NEW_SELLER' ? 'New Vendor' : 'New Order';
  return {
    id: 'f-' + Date.now(),
    type: type as any,
    timestamp: new Date().toISOString(),
    content: {
      whatsapp: `ADMIN ALERT: ${title} registered. ID: ${data.id}. Please check your dashboard for PII details.`,
      email: `System alert for ${type}. Check Master Logs.`
    },
    sent: false
  };
};
