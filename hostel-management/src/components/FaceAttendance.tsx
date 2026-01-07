'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { Camera, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

type FaceAttendanceProps = {
    students: {
        id: string;
        name: string | null;
        profile: {
            faceDescriptor: string | null;
        } | null;
    }[];
};

export default function FaceAttendance({ students }: FaceAttendanceProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error' | 'loading', message: string }>({ type: 'idle', message: 'Initialize camera to start scanning' });
    const [lastDetection, setLastDetection] = useState<string | null>(null);

    // Initial Load
    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = '/models';
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                ]);
                setIsModelsLoaded(true);
            } catch (err) {
                setStatus({ type: 'error', message: 'Failed to load AI models. Ensure /public/models exists.' });
            }
        };
        loadModels();
    }, []);

    const startVideo = async () => {
        setStatus({ type: 'loading', message: 'Opening camera...' });
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsScanning(true);
                setStatus({ type: 'idle', message: 'Scanning for faces...' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'Camera access denied or not found.' });
        }
    };

    const stopVideo = () => {
        const stream = videoRef.current?.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        setIsScanning(false);
        setStatus({ type: 'idle', message: 'Camera stopped' });
    };

    const handleAttendance = useCallback(async (studentId: string, name: string) => {
        if (lastDetection === studentId) return; // Prevent double trigger
        setLastDetection(studentId);

        setStatus({ type: 'loading', message: `Logging attendance for ${name}...` });

        try {
            // Determine type based on current state (mock logic or fetch latest log)
            // For now, we'll try to guess or just hit a smart endpoint
            const res = await fetch('/api/attendance/mark', {
                method: 'POST',
                body: JSON.stringify({ studentId }),
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await res.json();
            if (res.ok) {
                setStatus({ type: 'success', message: `${data.type} logged for ${name}` });
                setTimeout(() => setStatus({ type: 'idle', message: 'Scanning for faces...' }), 3000);
            } else {
                setStatus({ type: 'error', message: data.error || 'Failed to log attendance' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'Connection error' });
        }
    }, [lastDetection]);

    // Main Detection Loop
    useEffect(() => {
        let timer: any;
        if (isScanning && isModelsLoaded && videoRef.current) {
            const detect = async () => {
                const video = videoRef.current;
                if (!video || video.paused || video.ended) return;

                const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                    .withFaceLandmarks()
                    .withFaceDescriptor();

                if (detections && students.length > 0) {
                    // Match against students
                    const labeledDescriptors = students
                        .filter(s => s.profile?.faceDescriptor)
                        .map(s => {
                            const desc = JSON.parse(s.profile!.faceDescriptor!);
                            return new faceapi.LabeledFaceDescriptors(s.id, [new Float32Array(desc)]);
                        });

                    if (labeledDescriptors.length > 0) {
                        const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
                        const bestMatch = faceMatcher.findBestMatch(detections.descriptor);

                        if (bestMatch.label !== 'unknown') {
                            const student = students.find(s => s.id === bestMatch.label);
                            if (student) {
                                handleAttendance(student.id, student.name || 'Student');
                            }
                        }
                    }
                }

                timer = setTimeout(detect, 1000); // Scan every second
            };
            detect();
        }
        return () => clearTimeout(timer);
    }, [isScanning, isModelsLoaded, students, handleAttendance]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-black rounded-[3rem] p-1 shadow-2xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />

                <div className="relative aspect-video bg-gray-900 overflow-hidden flex items-center justify-center">
                    {!isScanning && (
                        <div className="text-center p-10 animate-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10">
                                <Camera size={32} className="text-white/40" />
                            </div>
                            <h3 className="text-xl font-black text-white mb-2">Initialize Scanner</h3>
                            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest max-w-xs mx-auto">
                                Ensure proper lighting and center students in the frame for optimal accuracy.
                            </p>
                        </div>
                    )}

                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        className={`w-full h-full object-cover transition-opacity duration-1000 ${isScanning ? 'opacity-100' : 'opacity-0'}`}
                    />

                    {/* Scanning Overlay */}
                    {isScanning && (
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute inset-0 border-[40px] border-black/20 backdrop-grayscale-[0.5]" />
                            <div className="absolute inset-x-20 top-20 bottom-20 border border-white/20 rounded-[2rem] flex items-center justify-center">
                                <div className="w-full h-[1px] bg-white/40 shadow-[0_0_15px_rgba(255,255,255,0.5)] animate-scan-line" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Status Bar */}
                <div className="bg-white/5 backdrop-blur-md px-8 py-5 flex items-center justify-between border-t border-white/10">
                    <div className="flex items-center gap-4">
                        {status.type === 'loading' && <Loader2 size={16} className="text-white animate-spin" />}
                        {status.type === 'success' && <CheckCircle2 size={16} className="text-green-400" />}
                        {status.type === 'error' && <AlertCircle size={16} className="text-red-400" />}
                        {status.type === 'idle' && <div className="w-2 h-2 bg-white/20 rounded-full" />}
                        <span className={`text-[10px] font-black uppercase tracking-widest ${status.type === 'success' ? 'text-green-400' :
                                status.type === 'error' ? 'text-red-400' : 'text-white/60'
                            }`}>
                            {status.message}
                        </span>
                    </div>

                    <div className="flex gap-2">
                        {!isScanning ? (
                            <button
                                onClick={startVideo}
                                disabled={!isModelsLoaded}
                                className="px-6 py-2 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                            >
                                Start Scanner
                            </button>
                        ) : (
                            <button
                                onClick={stopVideo}
                                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                Stop
                            </button>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all"
                        >
                            <RefreshCw size={14} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white border border-gray-100 rounded-2xl">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Scanner Requirements</h4>
                    <ul className="space-y-2">
                        <li className="text-xs font-bold text-black flex items-center gap-2">
                            <div className="w-1 h-1 bg-black rounded-full" />
                            Models: {isModelsLoaded ? 'Ready' : 'Not Loaded'}
                        </li>
                        <li className="text-xs font-bold text-black flex items-center gap-2">
                            <div className="w-1 h-1 bg-black rounded-full" />
                            Camera: {isScanning ? 'Active' : 'Disconnected'}
                        </li>
                        <li className="text-xs font-medium text-gray-400">
                            Wait for face confirmation before the next student scans.
                        </li>
                    </ul>
                </div>
                <div className="p-6 bg-white border border-gray-100 rounded-2xl">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Active Database</h4>
                    <div className="flex items-center gap-4">
                        <div className="text-3xl font-black text-black">{students.filter(s => s.profile?.faceDescriptor).length}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-300 leading-tight">
                            Students with<br />Face ID Registered
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes scan-line {
                    0% { transform: translateY(-120px); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateY(120px); opacity: 0; }
                }
                .animate-scan-line {
                    animation: scan-line 2.5s infinite linear;
                }
            `}</style>
        </div>
    );
}
