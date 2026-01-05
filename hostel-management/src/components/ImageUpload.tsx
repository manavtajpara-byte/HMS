'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';

interface ImageUploadProps {
    defaultValue?: string | null;
    name: string;
}

export function ImageUpload({ defaultValue, name }: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(defaultValue || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearImage = () => {
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-6">
                <div className="relative group">
                    <div className="w-32 h-32 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center transition-all group-hover:border-black">
                        {preview ? (
                            <img src={preview} alt="Profile preview" className="w-full h-full object-cover" />
                        ) : (
                            <Camera className="w-8 h-8 text-gray-300 group-hover:text-black transition-colors" />
                        )}
                    </div>

                    {preview && (
                        <button
                            type="button"
                            onClick={clearImage}
                            className="absolute -top-2 -right-2 p-1.5 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-all scale-0 group-hover:scale-100"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="space-y-2">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 border border-black bg-white text-black text-xs font-bold uppercase tracking-widest rounded-md hover:bg-black hover:text-white transition-all"
                    >
                        <Upload size={14} />
                        Select Photo
                    </button>
                    <p className="text-[10px] text-gray-400 font-medium">JPG, PNG or WEBP. Max 2MB.</p>
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />

            {/* Hidden input to hold the base64 string for the form submission */}
            <input type="hidden" name={name} value={preview || ''} />
        </div>
    );
}
