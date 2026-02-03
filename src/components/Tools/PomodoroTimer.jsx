import { useAppContext } from '../../context/AppContext';
import { HiOutlinePlay, HiOutlinePause, HiOutlineRefresh, HiOutlineBriefcase, HiOutlineMoon } from 'react-icons/hi';

const PomodoroTimer = () => {
    const { timeLeft, isActive, mode, toggleTimer, resetTimer } = useAppContext();

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const accent = mode === 'work'
        ? { bg: 'bg-emerald-400/10', border: 'border-emerald-400/30', text: 'text-emerald-200', label: 'Deep Work', icon: <HiOutlineBriefcase /> }
        : { bg: 'bg-amber-400/10', border: 'border-amber-400/30', text: 'text-amber-200', label: 'Recharge', icon: <HiOutlineMoon /> };

    return (
        <div className="sb-card space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${accent.bg} ${accent.border} border ${accent.text}`}>
                        {accent.icon}
                    </div>
                    <div>
                        <p className="sb-kicker">Focus ritual</p>
                        <h3 className="font-display text-lg text-white">{accent.label}</h3>
                    </div>
                </div>
                <span className={`text-[10px] uppercase tracking-[0.3em] px-3 py-1 rounded-full border ${isActive ? 'border-emerald-400/40 text-emerald-200' : 'border-white/10 text-slate-500'}`}>
                    {isActive ? 'Running' : 'Paused'}
                </span>
            </div>

            <div className="text-center">
                <div className="text-5xl font-display text-white">{formatTime(timeLeft)}</div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mt-2">{mode === 'work' ? 'Study block' : 'Break time'}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button onClick={toggleTimer} className="sb-btn sb-btn-primary">
                    {isActive ? <HiOutlinePause /> : <HiOutlinePlay />}
                    {isActive ? 'Pause' : 'Start'}
                </button>
                <button onClick={resetTimer} className="sb-btn sb-btn-ghost">
                    <HiOutlineRefresh /> Reset
                </button>
            </div>
        </div>
    );
};

export default PomodoroTimer;
