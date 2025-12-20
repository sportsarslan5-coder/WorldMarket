
import { GoogleGenAI } from "@google/genai";
import { Seller, Order, AdminNotification } from "../types.ts";

/**
 * Generates an admin notification using Gemini.
 * Initializes the AI inside the function to ensure the API key is current.
 */
export const generateAdminNotification = async (
  type: 'NEW_SELLER' | 'NEW_ORDER',
  data: Seller | Order
): Promise<AdminNotification> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.warn("API_KEY is missing. Falling back to default notification content.");
    return createFallbackNotification(type, data);
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = type === 'NEW_SELLER' 
    ? `Draft a professional WhatsApp message and an Email for an Admin. A new seller has joined PK-Mart. 
       Details: Name: ${(data as Seller).fullName}, Shop: ${(data as Seller).shopName}, 
       Phone: ${(data as Seller).phoneNumber}, Payout: ${(data as Seller).payoutMethod} (${(data as Seller).accountNumber}).
       Format your response as strictly valid JSON only: { "whatsapp": "string", "email": "string" }`
    : `Draft a professional WhatsApp message and an Email for an Admin. A new order has been placed on PK-Mart.
       Details: Order ID: ${(data as Order).id}, Customer: ${(data as Order).customerName}, 
       Shop: ${(data as Order).sellerName}, Amount: Rs. ${(data as Order).totalAmount}.
       Format your response as strictly valid JSON only: { "whatsapp": "string", "email": "string" }`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const responseText = response.text || "";
    // Robust JSON cleaning
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const content = JSON.parse(cleanJson);

    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      timestamp: new Date().toISOString(),
      content: {
        whatsapp: content.whatsapp || "New activity detected on platform.",
        email: content.email || "New activity detected on platform."
      },
      sent: true
    };
  } catch (error) {
    console.error("Gemini generation failed, using fallback:", error);
    return createFallbackNotification(type, data);
  }
};

const createFallbackNotification = (type: string, data: any): AdminNotification => {
  const title = type === 'NEW_SELLER' ? 'New Vendor Registration' : 'New Customer Order';
  const id = data.id || 'N/A';
  return {
    id: 'f-' + Date.now(),
    type: type as any,
    timestamp: new Date().toISOString(),
    content: {
      whatsapp: `PK-Mart Alert: ${title} (ID: ${id}). Please review in the admin panel.`,
      email: `A ${type.toLowerCase()} event occurred. Details: ${JSON.stringify(data)}`
    },
    sent: false
  };
};
