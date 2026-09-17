import { useEffect, useRef, useState } from "react";
import { Send01 } from "@untitledui/icons";
import { useNavigate } from "react-router";

import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { FileUpload } from "@/components/application/file-upload/file-upload-base";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { createTicket } from "@/services/api";

type UploadedImage = {
    id: string;
    name: string;
    size: number;
    type: string;
    progress: number;
    failed?: boolean;
    fileObject: File;
};

const aiLoadingMessages = [
    "Mengunggah rekaman dengan aman...",
    "AI sedang mentranskripsikan suara...",
    "AI sedang mengenali kategori dan lokasi...",
    "AI sedang menyusun laporan terstruktur...",
];

const minimumAiLoadingMs = 6000;

const uploadFile = (_file: File, onProgress: (progress: number) => void) => {
    // Local selection progress. Files are uploaded together when the report is submitted.
    let progress = 0;

    const interval = window.setInterval(() => {
        progress += 1;
        onProgress(progress);

        if (progress >= 100) {
            clearInterval(interval);
        }
    }, 30);
};

export default function Report() {
    const navigate = useNavigate();
    const [isRecording, setIsRecording] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [aiLoadingStep, setAiLoadingStep] = useState<number | null>(null);

    const [uploadedFiles, setUploadedFiles] = useState<UploadedImage[]>([]);

    const recorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        if (isRecording) {
            timerRef.current = window.setInterval(() => {
                setSeconds((prev) => prev + 1);
            }, 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isRecording]);

    useEffect(() => {
        return () => {
            recorderRef.current?.stream.getTracks().forEach((track) => track.stop());
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    useEffect(() => {
        if (!isSubmitting) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isSubmitting]);

    const formatTime = (value: number) => {
        const minutes = Math.floor(value / 60);
        const seconds = value % 60;

        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });

            chunksRef.current = [];

            const recorder = new MediaRecorder(stream);

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, {
                    type: "audio/webm",
                });

                const url = URL.createObjectURL(blob);

                setAudioUrl(url);
                setAudioBlob(blob);

                stream.getTracks().forEach((track) => {
                    track.stop();
                });
            };

            recorderRef.current = recorder;

            setSeconds(0);
            if (audioUrl) URL.revokeObjectURL(audioUrl);
            setAudioUrl(null);
            setAudioBlob(null);
            setIsRecording(true);

            recorder.start();
        } catch (error) {
            console.error("Gagal mengakses mikrofon:", error);
        }
    };

    const stopRecording = () => {
        recorderRef.current?.stop();
        setIsRecording(false);
    };

    const resetRecording = () => {
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }

        setAudioUrl(null);
        setAudioBlob(null);
        setSeconds(0);
    };


    const handleDropFiles = (files: FileList) => {
        const remainingSlots = 3 - uploadedFiles.length;

        if (remainingSlots <= 0) return;

        const newFiles = Array.from(files).slice(0, remainingSlots);

        const newFilesWithIds: UploadedImage[] = newFiles.map((file) => ({
            id: crypto.randomUUID(),
            name: file.name,
            size: file.size,
            type: file.type,
            progress: 0,
            fileObject: file,
        }));

        setUploadedFiles((prev) => [...prev, ...newFilesWithIds]);

        newFilesWithIds.forEach(({ id, fileObject }) => {
            uploadFile(fileObject, (progress) => {
                setUploadedFiles((prev) =>
                    prev.map((uploadedFile) =>
                        uploadedFile.id === id
                            ? {
                                  ...uploadedFile,
                                  progress,
                              }
                            : uploadedFile,
                    ),
                );
            });
        });
    };

    const handleDropUnacceptedFiles = (files: FileList) => {
        console.log("File tidak diterima:", files);
    };

    const handleDeleteFile = (id: string) => {
        setUploadedFiles((prev) =>
            prev.filter((file) => file.id !== id),
        );
    };

    const handleRetryFile = (id: string) => {
        const file = uploadedFiles.find((file) => file.id === id);

        if (!file) return;

        setUploadedFiles((prev) =>
            prev.map((uploadedFile) =>
                uploadedFile.id === id
                    ? {
                          ...uploadedFile,
                          progress: 0,
                          failed: false,
                      }
                    : uploadedFile,
            ),
        );

        uploadFile(file.fileObject, (progress) => {
            setUploadedFiles((prev) =>
                prev.map((uploadedFile) =>
                    uploadedFile.id === id
                        ? {
                              ...uploadedFile,
                              progress,
                              failed: false,
                          }
                        : uploadedFile,
                ),
            );
        });
    };

    const submitReport = async () => {
        if (!audioBlob || isSubmitting) return;
        const startedAt = Date.now();
        let loadingTimer: number | undefined;

        setIsSubmitting(true);
        setAiLoadingStep(0);
        loadingTimer = window.setInterval(() => {
            setAiLoadingStep((current) => Math.min((current ?? 0) + 1, aiLoadingMessages.length - 1));
        }, 1800);

        try {
            const ticket = await createTicket(
                audioBlob,
                uploadedFiles.map((file) => file.fileObject),
            );

            const remainingDelay = minimumAiLoadingMs - (Date.now() - startedAt);
            if (remainingDelay > 0) {
                await new Promise((resolve) => window.setTimeout(resolve, remainingDelay));
            }

            navigate(`/tracking/${ticket.id}`);
        } catch (error) {
            window.alert(error instanceof Error ? error.message : "Laporan gagal dikirim.");
        } finally {
            if (loadingTimer) window.clearInterval(loadingTimer);
            setAiLoadingStep(null);
            setIsSubmitting(false);
        }
    };

    return (
        <section className="min-h-screen bg-primary sm:py-6">
            {isSubmitting && aiLoadingStep !== null && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="ai-generation-title"
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/30 px-4 backdrop-blur-md"
                >
                    <div className="w-full max-w-md rounded-3xl border border-secondary bg-primary p-7 text-center shadow-2xl sm:p-8">
                        <Badge size="sm" type="pill-color" color="brand">
                            AI POWER MODE
                        </Badge>

                        <div className="mt-7">
                            <LoadingIndicator type="dot-circle" size="lg" />
                        </div>

                        <p aria-live="polite" className="mt-3 min-h-6 text-sm font-medium text-brand-600">
                            {aiLoadingMessages[aiLoadingStep]}
                        </p>

                        <div className="mt-6 flex justify-center gap-2" aria-hidden="true">
                            {aiLoadingMessages.map((_, index) => (
                                <span
                                    key={index}
                                    className={`h-1.5 rounded-full transition-all duration-500 ${
                                        index <= aiLoadingStep ? "w-8 bg-brand-600" : "w-3 bg-tertiary"
                                    }`}
                                />
                            ))}
                        </div>

                    </div>
                </div>
            )}

            <div className="mx-auto w-full max-w-container px-4 md:px-8">
                {/* Header */}
                <div className="mb-10">
                    {/* <h1 className="mt-5 text-display-sm font-semibold text-primary md:text-display-md">
                        Buat Laporan Baru
                    </h1>

                    <p className="mt-3 w-full text-base md:text-lg">
                        Sampaikan aspirasi atau keluhan Anda melalui rekaman suara.
                        GovAssist akan membantu mengubah suara menjadi laporan yang
                        lebih terstruktur.
                    </p> */}
                </div>

                {/* Main Card */}
                <div className="rounded-2xl border border-secondary bg-primary shadow-xs">
                    {/* Card Header */}
                    <div className="flex flex-col gap-4 border-b border-secondary px-6 py-5 md:flex-row md:items-center md:justify-between md:px-8">
                        <div>
                            <h2 className="text-lg font-semibold text-primary">
                                Rekam Suara Pengaduan
                            </h2>

                            <p className="mt-1 text-sm text-tertiary">
                                Ceritakan keluhan Anda secara jelas dan lengkap.
                            </p>
                        </div>

                        <Badge size="sm" type="pill-color" color="brand">
                            AI POWER MODE
                        </Badge>
                    </div>

                    {/* Content */}
                    <div className="p-6 md:p-8">
                        {/* Recorder */}
                        <div
                            className={`relative flex min-h-80 flex-col items-center justify-center rounded-2xl border p-6 text-center transition ${
                                isRecording
                                    ? "border-brand-300 bg-brand-primary_alt"
                                    : "border-secondary bg-secondary"
                            }`}
                        >
                            {isRecording && (
                                <div className="absolute top-6">
                                    <Badge
                                        size="sm"
                                        type="pill-color"
                                        color="error"
                                    >
                                        Sedang Merekam
                                    </Badge>
                                </div>
                            )}

                            {/* Mic Button */}
                            <div className="relative">
                                {isRecording && (
                                    <div className="absolute inset-0 animate-ping rounded-full bg-brand-500 opacity-10" />
                                )}

                                <button
                                    type="button"
                                    onClick={
                                        isRecording
                                            ? stopRecording
                                            : startRecording
                                    }
                                    className="relative flex size-28 items-center justify-center rounded-full border border-secondary bg-primary text-brand-600 shadow-lg transition hover:scale-105 active:scale-95"
                                >
                                    {isRecording ? (
                                        <span className="size-8 rounded-md bg-error-600" />
                                    ) : (
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            className="size-10"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                            <path d="M12 19v3" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {/* Timer */}
                            <p className="mt-4 text-display-xs font-semibold text-primary tabular-nums">
                                {formatTime(seconds)}
                            </p>

                            <p className="mt-2 text-md text-tertiary">
                                {isRecording
                                    ? "Silakan ceritakan keluhan Anda."
                                    : audioUrl
                                      ? "Rekaman selesai dan siap dikirim."
                                      : "Klik tombol mikrofon."}
                            </p>

                            {/* Audio */}
                            {audioUrl && !isRecording && (
                                <div className="mt-7 w-full max-w-xl">
                                    <audio
                                        src={audioUrl}
                                        controls
                                        className="w-full"
                                    />

                                    <Button
                                        color="link-color"
                                        size="md"
                                        className="mt-3"
                                        onClick={resetRecording}
                                    >
                                        Rekam ulang
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* FOTO PENDUKUNG */}
                        <div className="mt-6">
                            <div className="mb-4 flex items-end justify-between gap-4">
                                <div>
                                            {/* <h3 className="text-md font-semibold text-primary">
                                                Foto Pendukung
                                            </h3> */}

                                    <p className="mt-1 text-sm text-tertiary">
                                        Tambahkan foto untuk memperjelas laporan Anda.
                                    </p>
                                </div>

                                <span className="shrink-0 text-sm font-medium text-tertiary">
                                    {uploadedFiles.length}/3 foto
                                </span>
                            </div>

                            <FileUpload.Root>
                                {/* Hilang otomatis ketika sudah 3 foto */}
                                {uploadedFiles.length < 3 && (
                                    <FileUpload.DropZone
                                        accept="image/png,image/jpeg"
                                        hint={`Upload PNG atau JPEG`}
                                        onDropFiles={handleDropFiles}
                                        onDropUnacceptedFiles={
                                            handleDropUnacceptedFiles
                                        }
                                    />
                                )}

                                {uploadedFiles.length > 0 && (
                                    <FileUpload.List>
                                        {uploadedFiles.map((file) => {
                                            const {
                                                fileObject: _,
                                                ...fileProps
                                            } = file;

                                            return (
                                                <FileUpload.ListItemProgressBar
                                                    key={file.id}
                                                    {...fileProps}
                                                    onDelete={() =>
                                                        handleDeleteFile(file.id)
                                                    }
                                                    onRetry={() =>
                                                        handleRetryFile(file.id)
                                                    }
                                                />
                                            );
                                        })}
                                    </FileUpload.List>
                                )}
                            </FileUpload.Root>

                            {uploadedFiles.length === 3 && (
                                <p className="mt-3 text-center text-sm font-medium text-brand-600">
                                    Maksimal 3 foto telah ditambahkan.
                                </p>
                            )}
                        </div>

                        {/* Bottom */}
                        <div className="mt-6 grid gap-4 lg:items-stretch">
                            {/* Submit */}
                            <Button
                                size="xl"
                                iconLeading={Send01}
                                className="w-full justify-center sm:w-auto sm:min-w-64"
                                isDisabled={!audioBlob || isRecording || isSubmitting}
                                isLoading={isSubmitting}
                                showTextWhileLoading
                                onClick={submitReport}
                            >
                                {isSubmitting ? "AI sedang memproses..." : "Kirim Laporan"}
                            </Button>

                            {aiLoadingStep !== null && (
                                <p
                                    aria-live="polite"
                                    className="text-center text-sm font-medium text-brand-600"
                                >
                                    {aiLoadingMessages[aiLoadingStep]}
                                </p>
                            )}
                        </div>

                        <div className="mt-4 flex w-full justify-center">
                            <p className="text-center text-xs leading-5 font-medium text-brand-600 sm:text-sm sm:leading-6">
                                DATA LOKASI DAN KATEGORI DIISI OTOMATIS OLEH AI
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
