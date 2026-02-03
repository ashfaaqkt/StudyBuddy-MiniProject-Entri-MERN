import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../../context/AppContext';
import { formatDate } from '../../utils/helpers';
import { HiOutlineChartBar, HiOutlineSparkles } from 'react-icons/hi';

const ProgressChart = () => {
    const { quizScores } = useAppContext();

    const data = quizScores.map((score, index) => ({
        name: `Quiz ${index + 1}`,
        date: formatDate(score.date),
        score: Math.round((score.score / score.total) * 100),
        subject: score.subject,
    }));

    const averageScore = quizScores.length > 0
        ? Math.round(data.reduce((acc, curr) => acc + curr.score, 0) / quizScores.length)
        : 0;

    return (
        <div className="sb-container space-y-8">
            <div className="sb-card flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                    <p className="sb-kicker">Insights</p>
                    <h2 className="font-display text-3xl text-white">Performance Overview</h2>
                    <p className="text-slate-400 text-sm mt-2 max-w-lg">
                        Track how consistently you retain material and spot which topics need reinforcement.
                    </p>
                </div>
                <div className="sb-card-soft text-center">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Average Score</p>
                    <p className="font-display text-4xl text-white mt-2">{averageScore}%</p>
                </div>
            </div>

            {quizScores.length === 0 ? (
                <div className="sb-card text-center space-y-4">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-200">
                        <HiOutlineChartBar className="text-2xl" />
                    </div>
                    <h3 className="font-display text-2xl text-white">No quiz data yet</h3>
                    <p className="text-slate-400 text-sm">Complete a quiz to unlock analytics.</p>
                </div>
            ) : (
                <div className="sb-card space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-200">
                            <HiOutlineSparkles />
                        </div>
                        <h3 className="font-display text-xl text-white">Quiz Performance</h3>
                    </div>
                    <div className="h-[420px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    unit="%"
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                    contentStyle={{
                                        backgroundColor: '#0f1720',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255,255,255,0.12)',
                                        color: '#e6edf5',
                                        padding: '12px 14px',
                                    }}
                                    labelStyle={{ color: '#7ff1e4', fontWeight: 600 }}
                                />
                                <Bar dataKey="score" fill="#14b8a6" radius={[10, 10, 6, 6]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgressChart;
