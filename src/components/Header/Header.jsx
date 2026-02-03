import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiOutlineBookOpen, HiChartPie, HiOutlineViewGrid, HiOutlinePencilAlt, HiMenu, HiX } from 'react-icons/hi';

const Header = () => {
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    return (
        <header className="sb-topbar">
            <div className="sb-topbar-inner">
                <div className="sb-nav w-full px-4 md:px-8 py-3 flex flex-col md:flex-row md:items-center gap-4">
                    <div className="w-full flex items-center justify-between md:w-auto md:justify-start">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-200 shadow-glow">
                                <HiOutlineBookOpen className="text-xl" />
                            </div>
                            <div className="flex flex-col leading-tight">
                                <span className="font-display text-lg font-semibold tracking-tight text-white">
                                    Study<span className="text-emerald-300">Buddy.</span>
                                </span>
                                <span className="text-[10px] tracking-[0.1em] text-slate-400">Powered by Gemini</span>
                            </div>
                        </Link>
                        <div className="md:hidden flex items-center gap-2 justify-end">
                            <Link
                                to="/create-note"
                                className="sb-btn sb-btn-primary text-xs"
                                aria-label="New Note"
                                title="New Note"
                            >
                                <HiOutlinePencilAlt className="text-base" />
                            </Link>
                            <button
                                type="button"
                                className="sb-mobile-toggle"
                                onClick={() => setIsMenuOpen(true)}
                                aria-label="Open navigation menu"
                            >
                                <HiMenu className="text-xl" />
                            </button>
                        </div>
                    </div>

                    <nav className="hidden md:flex items-center gap-2 flex-wrap md:flex-1 md:justify-center">
                        <Link to="/dashboard" className={`sb-nav-link ${isActive('/dashboard')}`}>
                            <HiOutlineViewGrid className="text-base" />
                            Dashboard
                        </Link>
                        <Link to="/stats" className={`sb-nav-link ${isActive('/stats')}`}>
                            <HiChartPie className="text-base" />
                            Analytics
                        </Link>
                    </nav>

                    <div className="hidden md:flex">
                        <Link to="/create-note" className="sb-btn sb-btn-primary text-xs" aria-label="New Note" title="New Note">
                            <HiOutlinePencilAlt className="text-base" />
                        </Link>
                    </div>

                </div>
            </div>

            <div className={`sb-mobile-drawer ${isMenuOpen ? 'is-open' : ''}`} aria-hidden={!isMenuOpen}>
                <button
                    type="button"
                    className="sb-mobile-overlay"
                    onClick={() => setIsMenuOpen(false)}
                    aria-label="Close navigation menu"
                />
                <div className="sb-mobile-panel">
                    <div className="sb-mobile-header">
                        <span className="sb-kicker">Menu</span>
                        <button
                            type="button"
                            className="sb-mobile-close"
                            onClick={() => setIsMenuOpen(false)}
                            aria-label="Close navigation menu"
                        >
                            <HiX className="text-lg" />
                        </button>
                    </div>
                    <nav className="flex flex-col gap-2">
                        <Link to="/dashboard" className={`sb-nav-link ${isActive('/dashboard')}`}>
                            <HiOutlineViewGrid className="text-base" />
                            Dashboard
                        </Link>
                        <Link to="/stats" className={`sb-nav-link ${isActive('/stats')}`}>
                            <HiChartPie className="text-base" />
                            Analytics
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
