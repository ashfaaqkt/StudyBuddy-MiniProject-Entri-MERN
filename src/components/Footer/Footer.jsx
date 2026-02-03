import React from 'react';

const Footer = () => {
    return (
        <footer className="mt-auto relative z-10">
            <div className="w-full px-4 md:px-8 py-6 border border-white/10 rounded-t-2xl bg-[rgba(17,25,35,0.9)]">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 text-center md:text-left">
                        <p className="font-display text-lg text-white">
                            Study<span className="text-emerald-300">Buddy.</span>
                        </p>
                    </div>

                    <div className="text-center md:text-right space-y-1">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Developed by</p>
                        <p className="text-sm font-semibold text-slate-200">
                            <span>Ashfaaq KT For Entri Elevate</span>
                            <span className="block">Mini Project - MERN</span>
                        </p>
                    </div>
                </div>
                <div className="pt-4 text-center">
                    <p className="text-xs text-slate-500">
                        Rights Reserved for{' '}
                        <a href="https://ashfaaqkt.com" className="text-slate-300 hover:text-emerald-200 transition-colors">
                            Ashfaaq KT
                        </a>{' '}
                        © {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
