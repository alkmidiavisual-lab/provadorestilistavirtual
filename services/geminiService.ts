
import { GoogleGenAI, SafetySetting, HarmCategory, HarmBlockThreshold } from "@google/genai";

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

const getApiKey = () => {
    // Tenta obter de várias formas comuns em builds de frontend
    const key = process.env.API_KEY;
    if (!key || key === "undefined" || key === "") {
        throw new Error("MISSING_API_KEY");
    }
    return key;
};

const generateHighQualityImage = async (
    prompt: string, 
    images: { mimeType: string; data: string }[],
    isProMode: boolean = false
): Promise<string> => {
    try {
        const apiKey = getApiKey();
        const ai = new GoogleGenAI({ apiKey });
        
        const modelName = isProMode ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
        
        const superCleanBoost = isProMode 
            ? ", photorealistic masterpiece, shot on 35mm lens, f/1.8, extremely detailed skin texture, high-end fashion magazine quality, 4k resolution, ray tracing, volumetric lighting, hyper-realistic garment physics."
            : ", high-end fashion editorial photography, ultra-realistic, 8k resolution, sharp focus, cinematic lighting, NO TEXT, NO WORDS, preserve original garment textures.";

        const response = await ai.models.generateContent({
            model: modelName,
            contents: { 
                parts: [
                    { text: prompt + superCleanBoost }, 
                    ...images.map(img => ({ inlineData: img }))
                ] 
            },
            config: {
                imageConfig: {
                    aspectRatio: "3:4",
                    ...(isProMode ? { imageSize: "2K" } : {})
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
        
        if (error.message === "MISSING_API_KEY") {
            throw error;
        }
        
        if (error.message?.includes("Requested entity was not found")) {
            throw new Error("KEY_REQUIRED");
        }
        throw error;
    }
};

export const getTryOnImage = (
    personImage: {mimeType: string, data: string}, 
    outfitImage: {mimeType: string, data: string}, 
    scenarioPrompt: string, 
    angle: string = "Frente",
    isProMode: boolean = false
) => {
    const angleDescriptions: Record<string, string> = {
        "Frente": "full front view facing the camera",
        "Costas": "full back view showing the back of the clothing, person facing away from camera",
        "Lado Direito": "right side profile view, person looking to the right side of the frame",
        "Lado Esquerdo": "left side profile view, person looking to the left side of the frame",
        "Abaixado": "crouching or lowered fashion pose, person is sitting or bending low",
        "Inclinado": "inclined forward dynamic pose, person leaning towards the camera"
    };

    const angleText = angleDescriptions[angle] || angleDescriptions["Frente"];
    const prompt = `Virtual Try-On Fashion Shoot: The person from the first image must be wearing the EXACT outfit from the second image. Position: ${angleText}. Face and body type must remain identical to original person. REPLACE original clothes entirely. Environment: ${scenarioPrompt}. Strictly no text, high fidelity textures.`;
    
    return generateHighQualityImage(prompt, [personImage, outfitImage], isProMode);
};

export const getOutfitOnBedImage = (outfitImage: {mimeType: string, data: string}) => {
    const prompt = `Premium Flat Lay Photography: The original clothing item from the image must be perfectly FOLDED and ORGANIZED on a luxury bed with high-quality white linen. Soft studio lighting. Show only the clothing product, no people. ABSOLUTELY NO TEXT OR LETTERS ON THE IMAGE.`;
    return generateHighQualityImage(prompt, [outfitImage], false);
};
