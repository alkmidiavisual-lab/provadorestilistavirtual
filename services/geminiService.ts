
import { GoogleGenAI, Modality, SafetySetting, HarmCategory, HarmBlockThreshold } from "@google/genai";

const safetySettings: SafetySetting[] = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

const generateHighQualityImage = async (prompt: string, images: { mimeType: string; data: string }[]): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const superCleanBoost = ", high-end fashion editorial photography, ultra-realistic, 8k resolution, sharp focus, cinematic lighting, NO TEXT, NO WORDS, NO LETTERS, NO SIGNATURES, NO LOGOS, preserve original garment colors and textures, high fidelity, professional color grading.";
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { 
                parts: [
                    { text: prompt + superCleanBoost }, 
                    ...images.map(img => ({ inlineData: img }))
                ] 
            },
            config: {
                imageConfig: {
                    aspectRatio: "3:4" 
                }
            },
            safetySettings,
        });
        
        const candidate = response.candidates?.[0];
        if (!candidate || !candidate.content?.parts) throw new Error("A IA não conseguiu processar esta imagem.");
        
        for (const part of candidate.content.parts) {
            if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
        throw new Error("Erro ao extrair imagem da resposta.");
    } catch (error: any) {
        console.error("Image Gen Error:", error);
        throw error;
    }
};

export const getTryOnImage = (personImage: {mimeType: string, data: string}, outfitImage: {mimeType: string, data: string}, scenarioPrompt: string, angle: string = "Frente") => {
    const angleDescriptions: Record<string, string> = {
        "Frente": "full front view facing the camera",
        "Costas": "full back view showing the back of the clothing, person facing away from camera",
        "Lado Direito": "right side profile view, person looking to the right side of the frame",
        "Lado Esquerdo": "left side profile view, person looking to the left side of the frame",
        "Abaixado": "crouching or lowered fashion pose, person is sitting or bending low, showing outfit from lower angle",
        "Inclinado": "inclined forward dynamic pose, person leaning towards the camera for a high-fashion editorial look"
    };

    const angleText = angleDescriptions[angle] || angleDescriptions["Frente"];

    const prompt = `Virtual Try-On Fashion Shoot: The person from the first image must be wearing the EXACT outfit from the second image. Position: ${angleText}. Face and body type must remain identical to original person. REPLACE original clothes entirely. Environment: ${scenarioPrompt}. Strictly no text, high fidelity textures.`;
    return generateHighQualityImage(prompt, [personImage, outfitImage]);
};

export const getOutfitOnBedImage = (outfitImage: {mimeType: string, data: string}) => {
    const prompt = `Premium Flat Lay Photography: The original clothing item from the image must be perfectly FOLDED and ORGANIZED on a luxury bed with high-quality white linen. Soft studio lighting. Show only the clothing product, no people. ABSOLUTELY NO TEXT OR LETTERS ON THE IMAGE.`;
    return generateHighQualityImage(prompt, [outfitImage]);
};
