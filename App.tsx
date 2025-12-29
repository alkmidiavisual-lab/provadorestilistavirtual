
import React, { useState, useEffect } from 'react';
import ImageUploader from './components/ImageUploader.tsx';
import SuggestionPanel from './components/SuggestionPanel.tsx';
import HistoryModal from './components/HistoryModal.tsx';
import ImagePreviewModal from './components/ImagePreviewModal.tsx';
import { HistoryIcon } from './components/icons.tsx';
import {
    fileToBase64,
    getTryOnImage,
    getOutfitOnBedImage
} from './services/geminiService.ts';
import { ImageState } from './types.ts';

const SCENARIOS = [
    "Loft Industrial NY", "Praia Pôr do Sol", "Cyberpunk Tóquio", 
    "Estúdio Europeu", "Luxo em Mônaco", "Paris no Outono", 
    "Lab Futurista", "Deserto Saara", "Jardim Japonês", 
    "Rooftop Party", "Palácio Real", "Urbano Graffiti", 
    "Floresta Névoa", "Gelo Ártico", "Espacial Sci-Fi", 
    "Biblioteca Antiga", "Lavandas Provence", "Shopping Futuro", 
    "Show de Rock", "Iate Mediterrâneo"
];

const ANGLES = ["Frente", "Costas", "Lado Direito", "Lado Esquerdo", "Abaixado", "Inclinado"];

const App: React.FC = () => {
    const [personImage, setPersonImage] = useState<ImageState>(null);
    const [outfitImage, setOutfitImage] = useState<ImageState>(null);
    const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0]);
    const [customScenario, setCustomScenario] = useState("");
    const [selectedAngle, setSelectedAngle] = useState(ANGLES[0]);
    
    const [tryOnImage, setTryOnImage] = useState<string | null>(null);
    const [isTryingOn, setIsTryingOn] = useState(false);
    
    const [outfitOnBedImage, setOutfitOnBedImage] = useState<string | null>(null);
    const [isGeneratingOutfitOnBed, setIsGeneratingOutfitOnBed] = useState(false);
    
    const [history, setHistory] = useState<string[]>([]);
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);
    
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
    const [previewFilename, setPreviewFilename] = useState("resultado.png");

    const handlePersonImageSelect = (file: File) => setPersonImage({ preview: URL.createObjectURL(file), file });
    const handleOutfitImageSelect = (file: File) => {
        setOutfitImage({ preview: URL.createObjectURL(file), file });
        setTryOnImage(null);
        setOutfitOnBedImage(null);
        setSelectedAngle(ANGLES[0]);
    };

    const openPreview = (url: string, filename: string) => {
        setPreviewImageUrl(url);
        setPreviewFilename(filename);
    };
    
    const handleTryOn = async (angle: string = selectedAngle) => {
        if (!personImage || !outfitImage) return;
        setIsTryingOn(true);
        setSelectedAngle(angle);
        try {
            const b64P = await fileToBase64(personImage.file);
            const b64O = await fileToBase64(outfitImage.file);
            const scenario = customScenario || selectedScenario;
            const result = await getTryOnImage(
                { mimeType: personImage.file.type, data: b64P }, 
                { mimeType: outfitImage.file.type, data: b64O }, 
                scenario,
                angle
            );
            setTryOnImage(result);
            setHistory(prev => [result, ...prev].slice(0, 15));
            
            if (previewImageUrl) {
                setPreviewImageUrl(result);
            }
        } catch (e) {
            console.error(e);
            alert("Erro na geração. Verifique sua conexão e tente novamente.");
        } finally {
            setIsTryingOn(false);
        }
    };

    useEffect(() => {
        if (outfitImage && !outfitOnBedImage) {
            (async () => {
                setIsGeneratingOutfitOnBed(true);
                try {
                    const b64O = await fileToBase64(outfitImage.file);
                    const result = await getOutfitOnBedImage({ mimeType: outfitImage.file.type, data: b64O });
                    setOutfitOnBedImage(result);
                } catch (e) {} finally { setIsGeneratingOutfitOnBed(false); }
            })();
        }
    }, [outfitImage]);
    
    return (
        <div className="min-h-screen p-4 sm:p-8 max-w-7xl mx-auto flex flex-col bg-transparent">
            <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                <div>
                    <h1 className="text-4xl sm:text-6xl font-black italic tracking-tighter text-[#00ffcc] leading-none text-center md:text-left">ULTRA-POSTER</h1>
                    <p className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-40 mt-2 text-center md:text-left">IA Creative Engine • Public Version</p>
                </div>
                <button onClick={() => setIsHistoryVisible(true)} className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-2 hover:bg-white/10 transition-all group">
                    <HistoryIcon /><span className="text-[10px] font-black tracking-widest uppercase group-hover:text-[#00ffcc]">Galeria de Sessão</span>
                </button>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ImageUploader id="p" title="SEU MODELO" iconType="person" previewSrc={personImage?.preview ?? null} onImageSelect={handlePersonImageSelect} />
                        <ImageUploader id="o" title="PEÇA ORIGINAL" iconType="outfit" previewSrc={outfitImage?.preview ?? null} onImageSelect={handleOutfitImageSelect} />
                    </div>

                    <div className="card p-8 space-y-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-sm font-black tracking-[0.2em] text-[#00ffcc] uppercase">AMBIENTE E CENÁRIO</h3>
                            <span className="text-[9px] bg-[#00ffcc]/20 text-[#00ffcc] px-2 py-1 rounded">20 ESTILOS</span>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {SCENARIOS.map(s => (
                                <button 
                                    key={s} 
                                    onClick={() => {setSelectedScenario(s); setCustomScenario("");}}
                                    className={`text-[10px] px-2 py-3 rounded-lg font-black transition-all border ${selectedScenario === s && !customScenario ? 'bg-[#00ffcc] text-black border-[#00ffcc]' : 'bg-black/40 border-white/5 text-white/60 hover:border-white/20'}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>

                        <div className="pt-4 space-y-3">
                            <h3 className="text-[10px] font-black tracking-[0.2em] text-white/40 uppercase">DESCRIÇÃO PERSONALIZADA</h3>
                            <textarea 
                                value={customScenario}
                                onChange={(e) => setCustomScenario(e.target.value)}
                                placeholder="Descreva um lugar único..."
                                className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-sm focus:border-[#00ffcc] outline-none text-white transition-all resize-none"
                                rows={2}
                            />
                        </div>
                    </div>

                    {personImage && outfitImage && (
                        <button 
                            onClick={() => handleTryOn()} 
                            disabled={isTryingOn} 
                            className="main-button w-full py-6 text-xl rounded-2xl"
                        >
                            {isTryingOn ? 'PROCESSANDO...' : 'GERAR POSTER HD'}
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <SuggestionPanel 
                        isLoading={isTryingOn}
                        imageUrl={tryOnImage}
                        placeholderText="Aguardando geração do poster principal."
                        downloadFilename={`poster-${selectedAngle.toLowerCase()}.png`}
                        currentAngle={selectedAngle}
                        onPreview={(url) => openPreview(url, `poster-${selectedAngle.toLowerCase()}.png`)}
                        onChangeAngle={handleTryOn}
                    />

                    <SuggestionPanel 
                        isLoading={isGeneratingOutfitOnBed}
                        imageUrl={outfitOnBedImage}
                        placeholderText="A peça será organizada para detalhamento."
                        downloadFilename="produto-flatlay.png"
                        onPreview={(url) => openPreview(url, "produto-flatlay.png")}
                    />
                </div>
            </main>

            <HistoryModal isOpen={isHistoryVisible} onClose={() => setIsHistoryVisible(false)} images={history} />
            
            <ImagePreviewModal 
                isOpen={!!previewImageUrl} 
                onClose={() => setPreviewImageUrl(null)} 
                imageUrl={previewImageUrl} 
                downloadFilename={previewFilename}
                isGenerating={isTryingOn}
                currentAngle={selectedAngle}
                onAngleChange={handleTryOn}
            />
            
            <footer className="mt-12 py-6 border-t border-white/5 text-center">
                <p className="text-[9px] uppercase tracking-[0.5em] opacity-30 font-bold">Ultra-Poster © 2025 • Powered by Google Gemini</p>
            </footer>
        </div>
    );
};

export default App;
