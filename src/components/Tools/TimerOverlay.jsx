import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { HiOutlinePause, HiOutlinePlay, HiOutlineRefresh, HiOutlineX } from 'react-icons/hi';
import { useLocation } from 'react-router-dom';

const TimerOverlay = () => {
    const { timeLeft, isActive, mode, toggleTimer, resetTimer, isChatOpen } = useAppContext();
    const location = useLocation();

    // Do not show on landing page
    if (location.pathname === '/') return null;

    // Only show if the timer is active OR if it's not the default state (optional, but let's show if active)
    if (!isActive && timeLeft === 25 * 60) return null;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const isBreak = mode === 'break';

    return (
        <div
            className={`fixed right-6 z-[9999] transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) animate-in fade-in slide-in-from-bottom-4 ${isChatOpen ? 'bottom-[min(85vh,630px)]' : 'bottom-24'
                }`}
        >
            <div className={`sb-card flex items-center gap-4 py-3 px-4 shadow-2xl border ${isBreak ? 'border-amber-400/30' : 'border-emerald-400/30'} backdrop-blur-md`}>
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 leading-none mb-1">
                        {isBreak ? 'Break' : 'Focus'}
                    </span>
                    <span className="text-xl font-display text-white font-bold leading-none">
                        {formatTime(timeLeft)}
                    </span>
                </div>

                <div className="h-8 w-px bg-white/10 mx-1" />

                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleTimer}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-emerald-500 text-emerald-950 hover:bg-emerald-400'}`}
                        title={isActive ? 'Pause' : 'Start'}
                    >
                        {isActive ? <HiOutlinePause size={16} /> : <HiOutlinePlay size={16} />}
                    </button>
                    <button
                        onClick={resetTimer}
                        className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-all"
                        title="Reset"
                    >
                        <HiOutlineRefresh size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TimerOverlay;
