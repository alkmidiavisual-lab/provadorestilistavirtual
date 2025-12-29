
import React, { useRef } from 'react';
import { PersonIcon, OutfitIcon } from './icons.tsx';

interface ImageUploaderProps {
    id: string;
    title: string;
    iconType: 'person' | 'outfit';
    previewSrc: string | null;
    onImageSelect: (file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ id, title, iconType, previewSrc, onImageSelect }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImageSelect(file);
        }
    };

    return (
        <div className="card uploader-card fade-in relative">
            <h2 className="text-xl font-bold mb-4 text-center tracking-tight">{title}</h2>
            <div className="image-placeholder rounded-xl overflow-hidden bg-black/20 border-2 border-dashed border-accent/20 min-h-[350px] flex items-center justify-center">
                {previewSrc ? (
                    <img src={previewSrc} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                ) : (
                    <div className="text-center flex flex-col items-center">
                        {iconType === 'person' ? <PersonIcon /> : <OutfitIcon />}
                        <p className="mt-2 text-xs uppercase tracking-widest opacity-60">
                            {iconType === 'person' ? 'Seu Avatar' : 'A Peça'}
                        </p>
                    </div>
                )}
            </div>
            <div className="mt-6 text-center">
                <label htmlFor={id} className="cursor-pointer bg-accent/20 hover:bg-accent/40 text-accent font-bold py-2 px-6 rounded-full transition-all border border-accent/30 inline-block text-sm">
                    CARREGAR
                </label>
                <input
                    id={id}
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>
        </div>
    );
};

export default ImageUploader;
