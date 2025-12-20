
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
    ? `Draft a high-priority WhatsApp and Email alert for the platform Admin. 
       A NEW VENDOR has registered. 
       VENDOR PII:
       Name: ${(data as Seller).fullName}
       Email: ${(data as Seller).email}
       Phone: ${(data as Seller).phoneNumber}
       Shop: ${(data as Seller).shopName}
       Payout: ${(data as Seller).payoutMethod} - ${(data as Seller).accountNumber}
       
       Format as valid JSON: { "whatsapp": "string", "email": "string" }`
    : `Draft an URGENT WhatsApp and Email order notification for the Admin.
       ORDER DATA:
       ID: ${(data as Order).id}
       Shop: ${(data as Order).sellerName}
       Customer: ${(data as Order).customerName} (${(data as Order).customerPhone})
       Address: ${(data as Order).customerAddress}
       Amount: Rs. ${(data as Order).totalAmount}
       
       Format as valid JSON: { "whatsapp": "string", "email": "string" }`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const content = JSON.parse(response.text || '{"whatsapp":"", "email":""}');

    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      timestamp: new Date().toISOString(),
      content,
      sent: true
    };
  } catch (error) {
    console.error("AI Notification Error:", error);
    return createFallbackNotification(type, data);
  }
};

const createFallbackNotification = (type: string, data: any): AdminNotification => ({
  id: 'f-' + Date.now(),
  type: type as any,
  timestamp: new Date().toISOString(),
  content: {
    whatsapp: `ADMIN ALERT: ${type === 'NEW_SELLER' ? 'New Vendor' : 'New Order'} received. ID: ${data.id}`,
    email: `System Notification for ${type}. Please check your dashboard for PII details.`
  },
  sent: false
});
