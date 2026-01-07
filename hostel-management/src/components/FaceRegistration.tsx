'use client';

import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Camera, CheckCircle2, Loader2, UserCheck, ShieldAlert } from 'lucide-react';

export default function FaceRegistration({ studentId }: { studentId: string }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error' | 'loading', message: string }>({ type: 'idle', message: 'Prepare for biometric enrollment' });

    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = '/models'; // Expects models in public/models
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                ]);
                setIsModelsLoaded(true);
            } catch (err) {
                console.error(err);
                setStatus({ type: 'error', message: 'AI Models not found. Please contact admin.' });
            }
        };
        loadModels();
    }, []);

    const startEnrollment = async () => {
        setStatus({ type: 'loading', message: 'Accessing secure camera...' });
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsScanning(true);
                setStatus({ type: 'idle', message: 'Center your face in the frame' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'Camera access denied.' });
        }
    };

    const captureAndRegister = async () => {
        if (!videoRef.current) return;

        setStatus({ type: 'loading', message: 'Analyzing facial features...' });

        try {
            const detection = await faceapi.detectSingleFace(
                videoRef.current,
                new faceapi.TinyFaceDetectorOptions()
            ).withFaceLandmarks().withFaceDescriptor();

            if (!detection) {
                setStatus({ type: 'error', message: 'No face detected. Try again.' });
                return;
            }

            // Save descriptor to DB
            const descriptor = Array.from(detection.descriptor);
            const res = await fetch('/api/students/face-register', {
                method: 'POST',
                body: JSON.stringify({ studentId, descriptor: JSON.stringify(descriptor) }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                setStatus({ type: 'success', message: 'Biometric profile registered successfully' });
                const stream = videoRef.current.srcObject as MediaStream;
                stream?.getTracks().forEach(track => track.stop());
                setIsScanning(false);
            } else {
                setStatus({ type: 'error', message: 'Database sync failed.' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'Recognition engine error.' });
        }
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-black text-white rounded-2xl">
                    <UserCheck size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-black text-black">A.I. Biometric Enrollment</h3>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Register your face for touchless attendance</p>
                </div>
            </div>

            {isScanning ? (
                <div className="space-y-6">
                    <div className="relative aspect-square max-w-sm mx-auto bg-gray-900 rounded-[2.5rem] overflow-hidden border-4 border-black group">
                        <video ref={videoRef} autoPlay muted className="w-full h-full object-cover grayscale brightness-110" />
                        <div className="absolute inset-0 border-[20px] border-black/20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-48 h-48 border border-white/40 rounded-full animate-pulse" />
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <p className="text-xs font-bold text-black flex items-center gap-2">
                            {status.type === 'loading' && <Loader2 size={14} className="animate-spin" />}
                            {status.message}
                        </p>
                        <button
                            onClick={captureAndRegister}
                            disabled={status.type === 'loading'}
                            className="w-full max-w-sm py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl"
                        >
                            Capture & Enroll
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-100 rounded-[2rem] gap-6 text-center">
                    {status.type === 'success' ? (
                        <div className="animate-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 size={40} />
                            </div>
                            <p className="text-sm font-black text-black">{status.message}</p>
                        </div>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
                                <Camera size={24} className="text-gray-300" />
                            </div>
                            <div className="max-w-xs">
                                <p className="text-sm font-bold text-black mb-1">Begin Setup</p>
                                <p className="text-[10px] text-gray-400 font-medium leading-relaxed">Your biometric data is encrypted and stored securely for identity verification.</p>
                            </div>
                            <button
                                onClick={startEnrollment}
                                disabled={!isModelsLoaded}
                                className="px-8 py-3 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg disabled:opacity-50"
                            >
                                {isModelsLoaded ? 'Launch Camera' : 'Loading AI Engine...'}
                            </button>
                        </>
                    )}
                </div>
            )}

            <div className="mt-8 flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <ShieldAlert size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[9px] text-gray-500 font-medium leading-relaxed">
                    <span className="font-black text-black">Privacy Policy:</span> Face descriptors are mathematical models, not images. We do not store raw photos from your camera.
                </p>
            </div>
        </div>
    );
}
