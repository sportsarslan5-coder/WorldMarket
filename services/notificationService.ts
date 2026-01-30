
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
    prompt = `CORPORATE ADMIN ALERT: A new Original Design Manufacturer (ODM) has registered for the AMZ PRIME platform.
       MERCHANT DETAILS:
       Name: ${seller.fullName || seller.name}
       Email: ${seller.email}
       Phone: ${seller.phoneNumber || seller.phone}
       Bank/Gateway: ${seller.payoutInfo?.method || '2Checkout'}
       
       Draft a high-level corporate notification for the Dashboard. Use a sophisticated US business tone.`;
  } else {
    const order = data as Order;
    prompt = `TRANSACTION ALERT: A new order was processed on AMZ PRIME.
       ORDER DETAILS:
       Order ID: ${order.id}
       Merchant: ${order.shopName || order.sellerName}
       Total: $${(order.totalAmount || order.productPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
       Gateway: ${order.paymentMethod || 'Credit Card'}
       
       Draft a technical notification for the fulfillment department. Focus on PCI-DSS compliance and priority shipping logistics.`;
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
              description: 'Dashboard short alert text.'
            },
            email: {
              type: Type.STRING,
              description: 'Executive internal email summary.'
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
        whatsapp: content.whatsapp || "New platform activity detected.",
        email: content.email || "System log generated in secure node."
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
        whatsapp: `SECURE ALERT: ${type} identified in system. ID: ${data.id}.`,
        email: `Prime Node system alert for ${type}.`
      },
      sent: false
    };
  }
};
