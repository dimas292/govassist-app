import { useState } from "react";
import { Menu01, XClose } from "@untitledui/icons";
import { NavLink } from "react-router";

const navigation = [
    { name: "Beranda", href: "/" },
    { name: "Layanan", href: "/report" },
    { name: "Tracking", href: "/tracking" },
];

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
            <div className="mx-auto max-w-container px-4 md:px-8">
                <div className="relative flex h-20 items-center justify-between lg:h-28">
                    {/* Logo */}
                    <NavLink
                        to="/"
                        onClick={() => setIsOpen(false)}
                        className="text-2xl font-bold tracking-tight text-primary md:text-3xl lg:text-4xl"
                    >
                        GovAssist
                    </NavLink>

                    {/* Desktop Navigation */}
                    <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
                        <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white p-2 shadow-sm">
                            {navigation.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.href}
                                    end={item.href === "/"}
                                    className={({ isActive }) =>
                                        `rounded-full px-6 py-3 text-base font-semibold transition-all ${
                                            isActive
                                                ? "bg-brand-50 text-brand-600"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-brand-600"
                                        }`
                                    }
                                >
                                    {item.name}
                                </NavLink>
                            ))}
                        </div>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex size-11 items-center justify-center rounded-xl border border-gray-200 text-gray-700 transition-colors hover:bg-gray-50 md:hidden"
                        aria-label="Buka menu"
                        aria-expanded={isOpen}
                    >
                        {isOpen ? (
                            <XClose className="size-6" />
                        ) : (
                            <Menu01 className="size-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <nav className="pb-4 md:hidden">
                        <div className="flex flex-col gap-1 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg">
                            {navigation.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.href}
                                    end={item.href === "/"}
                                    onClick={() => setIsOpen(false)}
                                    className={({ isActive }) =>
                                        `rounded-xl px-4 py-3 text-base font-semibold transition-colors ${
                                            isActive
                                                ? "bg-brand-50 text-brand-600"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-brand-600"
                                        }`
                                    }
                                >
                                    {item.name}
                                </NavLink>
                            ))}
                        </div>
                    </nav>
                )}
            </div>
        </header>
    );
}   