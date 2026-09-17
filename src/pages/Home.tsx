import { useState } from "react";
import { ArrowRight, Microphone01, SearchMd } from "@untitledui/icons";
import { useNavigate } from "react-router";
import HeroImage from "@/assets/images/hero.png";
import { BadgeWithDot } from "@/components/base/badges/badges";

export default function Home() {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");

    const handleTracking = () => {
        const reportId = search.trim().toUpperCase();

        if (!reportId) return;

        navigate("/tracking", {
            state: {
                search: reportId,
            },
        });
    };

    return (
        <section className="bg-primary py-10 sm:py-12">
            <div className="mx-auto max-w-container px-4 sm:px-6 md:px-8">
                <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-8">
                    {/* TEXT */}
                    <div className="order-1 flex flex-col items-start lg:col-start-1 lg:row-start-1">
                        <BadgeWithDot type="pill-color" color="brand">
                            LAYANAN PENGADUAN DIGITAL NO. 1
                        </BadgeWithDot>

                        <h1 className="mt-5 text-display-sm font-semibold text-primary sm:text-display-md md:mt-6 md:text-display-lg lg:text-display-xl">
                            Suara Anda, <span className="text-brand-600">Perubahan Nyata.</span>
                        </h1>

                        <p className="mt-4 w-full text-base leading-7 text-tertiary sm:text-lg md:mt-6 md:text-xl md:leading-8">
                            Sampaikan laporan Anda tentang Makan Bergizi Gratis (MBG), infrastruktur, atau permasalahan umum hanya dengan rekaman suara. Kami
                            dengar, kami proses, dan kami tindak lanjuti secara transparan.
                        </p>
                    </div>

                    {/* IMAGE */}
                    <div className="order-2 flex w-full items-center justify-center lg:col-start-2 lg:row-span-2 lg:row-start-1">
                        <img src={HeroImage} alt="Layanan pengaduan GovAssist" className="h-auto w-full object-contain lg:w-[115%] xl:w-[125%]" />
                    </div>

                    {/* ACTION CARDS */}
                    <div className="order-3 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:col-start-1 lg:row-start-2">
                        {/* Mulai Melapor */}
                        <button
                            type="button"
                            onClick={() => navigate("/report")}
                            className="group flex min-h-48 w-full flex-col justify-between rounded-3xl bg-brand-600 p-5 text-left text-white shadow-[0_14px_30px_rgba(34,116,226,0.18)] transition-all duration-200 hover:-translate-y-1 hover:bg-brand-700 sm:p-6"
                        >
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-white/15">
                                <Microphone01 className="size-6" />
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold sm:text-[22px]">Mulai Melapor</h3>

                                <p className="mt-2 text-sm text-white/80">Rekam suara & kirim keluhan</p>
                            </div>
                        </button>

                        {/* Cek Status */}
                        <div className="flex min-h-48 w-full flex-col justify-between rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-600">
                                <SearchMd className="size-6" />
                            </div>

                            <div className="mt-5">
                                <h3 className="text-xl font-semibold text-gray-900 sm:text-[22px]">Cek Status</h3>

                                <div className="mt-3 flex items-center rounded-xl bg-gray-100 px-3 py-2">
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter") handleTracking();
                                        }}
                                        placeholder="Masukkan ID..."
                                        className="min-w-0 flex-1 bg-transparent px-1 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                                    />

                                    <button
                                        type="button"
                                        onClick={handleTracking}
                                        className="ml-2 flex size-9 shrink-0 items-center justify-center rounded-lg text-brand-600 hover:bg-brand-50"
                                    >
                                        <ArrowRight className="size-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
