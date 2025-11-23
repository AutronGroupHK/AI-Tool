
import { GoogleGenAI } from "@google/genai";
import { MODEL_NAME } from "../constants";
import { Gender, Resolution } from "../types";

// Allow process.env fallback for broader compatibility
declare const process: { env: { [key: string]: string | undefined } };

interface GenerateHeadshotParams {
  imageBase64: string;
  mimeType: string;
  gender: Gender;
  clothing: string;
  resolution: Resolution;
  angleModifier?: string;
}

export const generateHeadshot = async ({
  imageBase64,
  mimeType,
  gender,
  clothing,
  resolution,
  angleModifier = ""
}: GenerateHeadshotParams): Promise<string> => {
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const genderTerm = gender === 'male' ? 'man' : 'woman';
  const anglePrompt = angleModifier ? `View angle: ${angleModifier}.` : "Front facing professional headshot.";
  
  const prompt = `
    Transform this image into a highly photorealistic professional corporate headshot of a ${genderTerm}.
    Maintain the facial identity and features of the person in the original image strictly.
    Clothing: ${clothing || 'Professional business attire'}.
    Style: High-end studio photography, soft lighting, neutral professional background, 8k resolution, sharp focus.
    ${anglePrompt}
    Ensure the result looks like a premium LinkedIn profile photo.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          imageSize: resolution,
          aspectRatio: "3:4", // Standard portrait ratio
        },
      },
    });

    // Iterate through parts to find the image
    if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
    }
    
    throw new Error("No image data found in response");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
