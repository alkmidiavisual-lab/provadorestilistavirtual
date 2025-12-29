
import React from 'react';
import { CloseIcon } from './icons.tsx';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    images: string[];
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, images }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/90 z-[200] flex justify-center items-center p-4 fade-in backdrop-blur-xl"
            onClick={onClose}
        >
            <div 
                className="card w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-3xl font-black italic tracking-tighter text-accent">HISTÓRICO PREMIUM</h2>
                    <button 
                        onClick={onClose} 
                        className="text-white/40 hover:text-accent transition-colors"
                    >
                        <CloseIcon />
                    </button>
                </div>
                
                {images.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {images.map((image, index) => (
                            <div key={index} className="rounded-2xl overflow-hidden border border-white/10 group relative">
                                <img 
                                    src={image} 
                                    alt={`Look ${index + 1}`} 
                                    className="w-full h-full object-cover aspect-[3/4] transition-transform duration-500 group-hover:scale-110" 
                                />
                                <a href={image} download={`historico-${index}.png`} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="bg-accent text-black px-4 py-2 rounded-full font-black text-[10px] tracking-widest">BAIXAR</span>
                                </a>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-white/20 py-20 font-bold uppercase tracking-[0.3em]">
                        Nenhum resultado gerado ainda.
                    </p>
                )}
            </div>
        </div>
    );
};

export default HistoryModal;
