
import React from 'react';
import Spinner from './Spinner.tsx';
import { DownloadIcon } from './icons.tsx';

interface SuggestionPanelProps {
    isLoading: boolean;
    imageUrl: string | null;
    placeholderText: string;
    downloadFilename: string;
    currentAngle?: string;
    onPreview?: (url: string) => void;
    onChangeAngle?: (angle: string) => void;
}

const ANGLES = ["Frente", "Costas", "Lado Direito", "Lado Esquerdo", "Abaixado", "Inclinado"];

const SuggestionPanel: React.FC<SuggestionPanelProps> = ({ 
    isLoading, imageUrl, placeholderText, downloadFilename, currentAngle, onPreview, onChangeAngle
}) => {
    return (
        <div className="card fade-in flex flex-col h-full min-h-[550px] overflow-hidden border-white/10 shadow-2xl group">
            <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-center">
                {imageUrl && !isLoading ? (
                    <a
                        href={imageUrl}
                        download={downloadFilename}
                        className="save-button w-full bg-[#ff0000] text-white font-black py-4 rounded-2xl hover:bg-[#cc0000] active:scale-95 transition-all text-sm tracking-widest flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(255,0,0,0.4)] border border-red-500 text-center"
                    >
                        <DownloadIcon />
                        BAIXAR RESULTADO HD
                    </a>
                ) : (
                    <div className="w-full bg-black/40 text-white/20 font-black py-4 rounded-2xl text-[10px] tracking-[0.2em] text-center uppercase border border-white/5">
                        {isLoading ? 'RENDERIZANDO...' : 'AGUARDANDO GERAÇÃO'}
                    </div>
                )}
            </div>

            <div className="image-placeholder flex-grow relative overflow-hidden flex flex-col items-center justify-center bg-black/80">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center text-center p-8">
                        <Spinner size="main" />
                        <p className="mt-6 text-accent animate-pulse font-black tracking-[0.3em] text-[10px] uppercase">
                            Alterando Ângulo...
                        </p>
                    </div>
                ) : imageUrl ? (
                    <div className="relative w-full h-full group/img">
                        <img 
                            src={imageUrl} 
                            alt="Resultado Final" 
                            className="fade-in w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105" 
                        />
                        
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-start pt-6 gap-3 backdrop-blur-[2px]">
                            <p className="text-white font-black text-[9px] tracking-[0.3em] uppercase bg-black/60 px-4 py-2 rounded-full border border-white/10 mb-2">
                                Posição do Modelo
                            </p>
                            <div className="grid grid-cols-3 gap-2 px-6 w-full max-w-xs">
                                {ANGLES.map(angle => (
                                    <button
                                        key={angle}
                                        onClick={() => onChangeAngle && onChangeAngle(angle)}
                                        className={`py-2 px-1 rounded-lg font-black text-[9px] uppercase tracking-tighter border transition-all ${currentAngle === angle ? 'bg-[#ff0000] border-red-500 text-white shadow-lg' : 'bg-black/80 border-white/20 text-white/70 hover:bg-white hover:text-black hover:border-white'}`}
                                    >
                                        {angle}
                                    </button>
                                ))}
                            </div>
                            
                            <button 
                                onClick={() => onPreview && onPreview(imageUrl)}
                                className="mt-auto mb-8 bg-accent text-black font-black text-[10px] tracking-widest px-8 py-3 rounded-full hover:scale-110 transition-transform shadow-[0_0_20px_rgba(0,255,204,0.4)]"
                            >
                                VISUALIZAÇÃO AMPLIADA
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full p-12 opacity-20 text-center">
                        <div className="mb-4 text-4xl">✨</div>
                        <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">
                            {placeholderText}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuggestionPanel;
