
// Fixed to follow @google/genai guidelines: use Type for schema, responseSchema, and property access.
import { GoogleGenAI, Type } from "@google/genai";
import { Seller, Order, AdminNotification } from "../types.ts";

export const generateAdminNotification = async (
  type: 'NEW_SELLER' | 'NEW_ORDER',
  data: Seller | Order
): Promise<AdminNotification> => {
  // Always use the API key from process.env.API_KEY directly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = type === 'NEW_SELLER' 
    ? `CRITICAL ADMIN ALERT: A new vendor has registered on PK-MART.
       VENDOR PII:
       Name: ${(data as Seller).fullName}
       Email: ${(data as Seller).email}
       Phone: ${(data as Seller).phoneNumber}
       Shop Name: ${(data as Seller).shopName || 'New Shop'}
       Payout: ${(data as Seller).payoutMethod} - ${(data as Seller).accountNumber}
       
       Draft a WhatsApp message and a formal Email for the Admin to review this vendor.`
    : `URGENT ORDER ALERT: A customer placed an order.
       ORDER DETAILS:
       Order ID: ${(data as Order).id}
       Shop: ${(data as Order).sellerName || 'Partner Shop'}
       Customer: ${(data as Order).customerName} (${(data as Order).customerPhone})
       Address: ${(data as Order).customerAddress}
       Amount: Rs. ${(data as Order).totalAmount}
       
       Draft a WhatsApp message and an Email for the Admin to initiate logistics.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        // Using responseSchema for robust JSON extraction
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

    // Access .text property directly (not as a method)
    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response text from AI");
    }
    
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
    // Return a structured fallback notification
    const title = type === 'NEW_SELLER' ? 'New Vendor' : 'New Order';
    return {
      id: 'f-' + Date.now(),
      type: type as any,
      timestamp: new Date().toISOString(),
      content: {
        whatsapp: `ADMIN ALERT: ${title} registered. ID: ${data.id}. Please check your dashboard for details.`,
        email: `System alert for ${type}. Check Master Logs.`
      },
      sent: false
    };
  }
};
