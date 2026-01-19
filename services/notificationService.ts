
import { GoogleGenAI, Type } from "@google/genai";
import { Seller, Order, AdminNotification } from "../types.ts";

export const generateAdminNotification = async (
  type: 'NEW_SELLER' | 'NEW_ORDER',
  data: Seller | Order
): Promise<AdminNotification> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let prompt = "";
  if (type === 'NEW_SELLER') {
    const seller = data as Seller;
    prompt = `LOCAL ADMIN ALERT: A new Pakistani merchant has registered for PK MART.
       MERCHANT DETAILS:
       Name: ${seller.fullName}
       Email: ${seller.email}
       WhatsApp: ${seller.phoneNumber}
       Payout Method: ${seller.payoutInfo?.method || 'Easypaisa'}
       
       Draft a professional notification for the PK MART Admin Console. Use a polite and formal Pakistani business tone.`;
  } else {
    const order = data as Order;
    prompt = `URGENT ORDER ALERT: A customer placed a new order on PK MART.
       ORDER DETAILS:
       Order ID: ${order.id}
       Store: ${order.shopName}
       Total: Rs. ${order.totalAmount.toLocaleString()}
       
       Draft a notification for the dispatch team. Mention the local COD logistics and the 5% platform fee in PKR.`;
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

    const responseText = response.text;
    if (!responseText) throw new Error("No response text from AI");
    
    const content = JSON.parse(responseText.trim());

    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      timestamp: new Date().toISOString(),
      content: {
        whatsapp: content.whatsapp || "New PK MART activity detected.",
        email: content.email || "System alert logged in local hub."
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
        whatsapp: `ADMIN ALERT: ${type} registered on PK MART. ID: ${data.id}.`,
        email: `Local system alert for ${type}.`
      },
      sent: false
    };
  }
};
