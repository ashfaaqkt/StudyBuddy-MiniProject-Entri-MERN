import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineBookOpen, HiOutlineChartBar, HiOutlineLightBulb, HiOutlineClock, HiOutlineAcademicCap } from 'react-icons/hi';

const Landing = () => {
    return (
        <div className="space-y-20">
            <section className="sb-section">
                <div className="sb-container grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
                    <div className="space-y-6 sb-reveal order-2 lg:order-none">
                        <span className="sb-pill">AI study OS</span>
                        <h1 className="sb-hero-title">
                            Turn messy notes into <span className="sb-gradient-text">structured mastery</span>.
                        </h1>
                        <p className="text-slate-300 text-lg leading-relaxed">
                            StudyBuddy blends smart notes, instant summaries, and adaptive quizzes powered by Gemini. Capture ideas fast,
                            compress them into clean study guides, then test yourself in minutes.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/dashboard" className="sb-btn sb-btn-primary">
                                Launch Workspace
                            </Link>
                            <Link to="/create-note" className="sb-btn sb-btn-ghost">
                                Start a Note
                            </Link>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <div className="sb-stat">5-question quizzes on demand</div>
                            <div className="sb-stat">Auto summaries + tables</div>
                            <div className="sb-stat">Focus-friendly layouts</div>
                        </div>
                    </div>

                    <div className="relative sb-reveal flex items-center justify-center order-1 lg:order-none">
                        <div className="sb-card sb-float relative flex items-center justify-center w-72 h-72 rounded-[32px] p-0">
                            <div className="w-64 h-64 rounded-[28px] bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center gap-3 shadow-glow">
                                <HiOutlineBookOpen className="text-6xl text-emerald-200" />
                                <div className="space-y-1">
                                    <p className="font-display text-2xl text-white">
                                        Study<span className="text-emerald-300">Buddy.</span>
                                    </p>
                                    <p className="text-xs text-slate-400">Powered by Gemini</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="sb-section">
                <div className="sb-container">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                        <div className="space-y-3 max-w-xl">
                            <p className="sb-kicker">Built for clarity</p>
                            <h2 className="font-display text-3xl md:text-4xl text-white">Everything you need to go from capture to mastery.</h2>
                        </div>
                        <p className="text-slate-400 max-w-md">
                            Make every study session intentional. Track your learning, keep your materials organized, and let AI do the
                            heavy lifting when you need to condense or test.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mt-10">
                        <div className="sb-grid-card sb-reveal">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-200 mb-5">
                                <HiOutlineLightBulb />
                            </div>
                            <h3 className="font-display text-xl text-white mb-2">Smart Summaries</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Compress long notes into crisp bullet points or a clean table you can review in minutes.
                            </p>
                        </div>
                        <div className="sb-grid-card sb-reveal">
                            <div className="w-12 h-12 rounded-2xl bg-sky-400/10 border border-sky-400/30 flex items-center justify-center text-sky-200 mb-5">
                                <HiOutlineChartBar />
                            </div>
                            <h3 className="font-display text-xl text-white mb-2">Progress Signals</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Track quiz outcomes and spot what needs reinforcement with clean, readable analytics.
                            </p>
                        </div>
                        <div className="sb-grid-card sb-reveal">
                            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-200 mb-5">
                                <HiOutlineClock />
                            </div>
                            <h3 className="font-display text-xl text-white mb-2">Focus Rituals</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Built-in Pomodoro and resource vaults keep you in flow without leaving the workspace.
                            </p>
                        </div>
                    </div>

                    <div className="sb-card mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <p className="sb-kicker">Responsive Design</p>
                            <h3 className="font-display text-2xl text-white">Adaptive layout across every screen.</h3>
                            <p className="text-slate-400 text-sm">
                                This application is fully responsive and tested on:
                            </p>
                        </div>
                        <ul className="text-slate-300 text-sm space-y-2">
                            <li>Mobile devices (375px and up)</li>
                            <li>Tablets (768px and up)</li>
                            <li>Desktop (1024px and up)</li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="sb-section">
                <div className="sb-container">
                    <div className="sb-card grid md:grid-cols-3 gap-6">
                        <div>
                            <p className="sb-kicker">How it works</p>
                            <h3 className="font-display text-2xl text-white mt-2">A loop designed for retention.</h3>
                            <p className="text-slate-400 text-sm mt-4">
                                Capture, compress, test, repeat. Each step is built to move knowledge into memory.
                            </p>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-start gap-3">
                                <span className="sb-tag">01</span>
                                <div>
                                    <h4 className="font-semibold text-white">Capture</h4>
                                    <p className="text-slate-400 text-sm">Write, paste, or import your learning material.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="sb-tag">02</span>
                                <div>
                                    <h4 className="font-semibold text-white">Clarify</h4>
                                    <p className="text-slate-400 text-sm">Use Gemini to summarize or map into tables.</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-start gap-3">
                                <span className="sb-tag">03</span>
                                <div>
                                    <h4 className="font-semibold text-white">Test</h4>
                                    <p className="text-slate-400 text-sm">Generate 5-question quizzes and practice instantly.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="sb-tag">04</span>
                                <div>
                                    <h4 className="font-semibold text-white">Refine</h4>
                                    <p className="text-slate-400 text-sm">Review scores and repeat the loop with clarity.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="sb-section pb-24">
                <div className="sb-container">
                    <div className="sb-card text-center space-y-6">
                        <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-200">
                            <HiOutlineAcademicCap className="text-2xl" />
                        </div>
                        <h2 className="font-display text-3xl md:text-4xl text-white">Ready to make studying feel effortless?</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            Build a clean library, generate summaries and tables, and practice with AI quizzes whenever you need.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/create-note" className="sb-btn sb-btn-primary">
                                Create Your First Note
                            </Link>
                            <Link to="/dashboard" className="sb-btn sb-btn-ghost">
                                Explore the Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;
