
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
    prompt = `CRITICAL ADMIN ALERT: A new vendor has registered on PK-MART.
       VENDOR DETAILS:
       Name: ${seller.fullName}
       Email: ${seller.email}
       Phone: ${seller.phoneNumber}
       Payout Method: ${seller.payoutInfo?.method || 'Not Set'}
       Account: ${seller.payoutInfo?.accountNumber || 'N/A'}
       
       Draft a professional Urdu-inflected English WhatsApp message and a formal Email for the Admin to review this vendor. Ensure the tone is urgent but professional.`;
  } else {
    const order = data as Order;
    prompt = `URGENT ORDER ALERT: A customer placed a new order.
       ORDER DETAILS:
       Order ID: ${order.id}
       Shop Name: ${order.shopName}
       Customer: ${order.customerName} (${order.customerPhone})
       Address: ${order.customerAddress}
       Amount: Rs. ${order.totalAmount.toLocaleString()}
       
       Draft a WhatsApp message and an Email for the Admin to initiate logistics. Include a reminder about the 5% platform commission.`;
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
              description: 'WhatsApp notification message.'
            },
            email: {
              type: Type.STRING,
              description: 'Email notification template.'
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
        email: content.email || "Platform event logged. Check Admin Dashboard."
      },
      sent: true
    };
  } catch (error) {
    console.error("Failed to generate AI notification:", error);
    const title = type === 'NEW_SELLER' ? 'New Vendor' : 'New Order';
    return {
      id: 'f-' + Date.now(),
      type,
      timestamp: new Date().toISOString(),
      content: {
        whatsapp: `ADMIN ALERT: ${title} registered. ID: ${data.id}. Please check your dashboard for details.`,
        email: `System alert for ${type}. Check Master Logs.`
      },
      sent: false
    };
  }
};
