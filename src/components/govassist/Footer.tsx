export default function Footer() {
    return (
        <footer className="bg-primary py-8 md:py-10">
            <div className="mx-auto max-w-container px-4 md:px-8">
                <div className="flex flex-col justify-between gap-3 border-t border-secondary pt-6 text-center md:flex-row md:items-center md:text-left">
                    <p className="text-sm text-quaternary">
                        © 2026 GovAssist. All rights reserved.
                    </p>

                    <p className="text-sm font-medium text-quaternary">
                        Versi {__APP_VERSION__}
                    </p>

                    <p className="text-sm text-quaternary">
                        Suara Anda, Perubahan Nyata.
                    </p>
                </div>
            </div>
        </footer>
    );
}
