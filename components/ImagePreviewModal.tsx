
import React, { useEffect } from 'react';
import { CloseIcon, DownloadIcon } from './icons.tsx';
import Spinner from './Spinner.tsx';

interface ImagePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string | null;
    downloadFilename: string;
    isGenerating: boolean;
    currentAngle: string;
    onAngleChange: (angle: string) => void;
}

const MODAL_ANGLES = [
    { label: "Virar para Frente", value: "Frente" },
    { label: "Virar para Esquerda", value: "Lado Esquerdo" },
    { label: "Virar para Direita", value: "Lado Direito" },
    { label: "Virar de Costas", value: "Costas" }
];

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ 
    isOpen, onClose, imageUrl, downloadFilename, isGenerating, currentAngle, onAngleChange 
}) => {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isGenerating) onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose, isGenerating]);

    if (!isOpen || !imageUrl) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/98 z-[300] flex flex-col justify-center items-center p-4 sm:p-10 fade-in"
            onClick={() => !isGenerating && onClose()}
        >
            <div className="absolute top-6 right-6 flex gap-4 z-[310]">
                {!isGenerating && (
                    <a
                        href={imageUrl}
                        download={downloadFilename}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#ff0000] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2 border border-red-500"
                    >
                        <DownloadIcon />
                        <span className="hidden sm:inline font-bold text-xs">BAIXAR HD</span>
                    </a>
                )}
                <button 
                    onClick={onClose}
                    disabled={isGenerating}
                    className="bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-colors disabled:opacity-50"
                >
                    <CloseIcon />
                </button>
            </div>

            <div 
                className="relative max-w-full max-h-[70vh] flex justify-center items-center"
                onClick={(e) => e.stopPropagation()}
            >
                {isGenerating && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md rounded-lg">
                        <Spinner size="main" />
                        <p className="mt-4 text-accent font-black tracking-[0.3em] text-[10px] uppercase animate-pulse">
                            Renderizando Nova Posição...
                        </p>
                    </div>
                )}
                
                <img 
                    src={imageUrl} 
                    alt="Preview" 
                    className={`max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl transition-all duration-500 ${isGenerating ? 'scale-95 blur-sm' : 'scale-100 blur-0'}`}
                />
            </div>

            <div 
                className="mt-8 flex flex-wrap justify-center gap-3 z-[310]"
                onClick={(e) => e.stopPropagation()}
            >
                {MODAL_ANGLES.map((angle) => (
                    <button
                        key={angle.value}
                        disabled={isGenerating}
                        onClick={() => onAngleChange(angle.value)}
                        className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${currentAngle === angle.value ? 'bg-[#ff0000] border-red-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/30 disabled:opacity-30'}`}
                    >
                        {angle.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ImagePreviewModal;
