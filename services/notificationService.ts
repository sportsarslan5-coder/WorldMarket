
import { GoogleGenAI, Type } from "@google/genai";
import { Seller, Order, AdminNotification } from "../types.ts";

export const generateAdminNotification = async (
  type: 'NEW_SELLER' | 'NEW_ORDER',
  data: Seller | Order
): Promise<AdminNotification> => {
  // Named parameter initialization
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let prompt = "";
  if (type === 'NEW_SELLER') {
    const seller = data as Seller;
    prompt = `GLOBAL ADMIN ALERT: A new international vendor has registered.
       VENDOR DETAILS:
       Name: ${seller.fullName}
       Email: ${seller.email}
       Phone: ${seller.phoneNumber}
       Payout Method: ${seller.payoutInfo?.method || 'Not Set'}
       
       Draft a professional English notification for the Global Admin Console. Use a sophisticated tone.`;
  } else {
    const order = data as Order;
    prompt = `URGENT ORDER ALERT: A global customer placed a new order.
       ORDER DETAILS:
       Order ID: ${order.id}
       Store: ${order.shopName}
       Total: Rs. ${order.totalAmount.toLocaleString()}
       
       Draft a notification message for logistics dispatch. Mention the platform fee calculation.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            whatsapp: {
              type: Type.STRING,
              description: 'Notification message.'
            },
            email: {
              type: Type.STRING,
              description: 'Email summary.'
            }
          },
          required: ["whatsapp", "email"]
        }
      }
    });

    // Correct property access
    const responseText = response.text;
    if (!responseText) throw new Error("No response text from AI");
    
    const content = JSON.parse(responseText.trim());

    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      timestamp: new Date().toISOString(),
      content: {
        whatsapp: content.whatsapp || "New global activity detected.",
        email: content.email || "Platform event logged in Master Node."
      },
      sent: true
    };
  } catch (error) {
    console.error("Failed to generate AI notification:", error);
    return {
      id: 'f-' + Date.now(),
      type,
      timestamp: new Date().toISOString(),
      content: {
        whatsapp: `ADMIN ALERT: ${type} registered. ID: ${data.id}.`,
        email: `System alert for ${type}.`
      },
      sent: false
    };
  }
};
