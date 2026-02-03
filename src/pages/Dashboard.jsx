import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import NoteCard from '../components/Card/NoteCard';
import PomodoroTimer from '../components/Tools/PomodoroTimer';
import ResourceLinks from '../components/Tools/ResourceLinks';
import { HiOutlineSearch, HiOutlinePlusSm, HiOutlineSparkles, HiOutlineChartBar, HiOutlineFilter } from 'react-icons/hi';

const Dashboard = () => {
    const { notes, deleteNote, quizScores } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('All');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef(null);

    const subjects = Array.from(
        new Set(notes.map(note => (note.subject || '').trim()).filter(Boolean))
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredNotes = notes.filter(note => {
        const matchesSearch =
            note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.subject.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSubject =
            selectedSubject === 'All' ||
            note.subject.toLowerCase() === selectedSubject.toLowerCase();
        return matchesSearch && matchesSubject;
    });

    return (
        <div className="sb-container space-y-10">
            <section className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
                <div className="sb-card space-y-6 sb-reveal">
                    <div className="flex items-center gap-3">
                        <span className="sb-pill">Workspace</span>
                        <span className="sb-kicker">Your study command center</span>
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl text-white">
                        Stay in flow with smart notes and Gemini-powered insights.
                    </h1>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Keep everything you need to learn, summarize, and quiz in one place. The next study session starts here.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link to="/create-note" className="sb-btn sb-btn-primary">
                            <HiOutlinePlusSm className="text-lg" /> New Note
                        </Link>
                        <Link to="/stats" className="sb-btn sb-btn-ghost">
                            <HiOutlineChartBar className="text-lg" /> View Analytics
                        </Link>
                    </div>
                </div>

                <div className="sb-card space-y-4 sb-reveal">
                    <div className="flex items-center justify-between">
                        <h2 className="font-display text-lg text-white">Quick Snapshot</h2>
                        <HiOutlineSparkles className="text-emerald-200" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="sb-card-soft text-center">
                            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Notes</p>
                            <p className="text-3xl font-display text-white mt-2">{notes.length}</p>
                        </div>
                        <div className="sb-card-soft text-center">
                            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Quizzes</p>
                            <p className="text-3xl font-display text-white mt-2">{quizScores.length}</p>
                        </div>
                    </div>
                    <div className="sb-card-soft text-sm text-slate-300">
                        Stay consistent. Every quiz you finish refines your next study focus.
                    </div>
                </div>
            </section>

            <section className="grid lg:grid-cols-[1fr_320px] gap-8">
                <div className="space-y-6">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="font-display text-2xl text-white">Your Notes</h2>
                        <Link to="/create-note" className="sb-btn sb-btn-subtle">
                            <HiOutlinePlusSm className="text-lg" /> Add
                        </Link>
                    </div>

                    <div className="relative">
                        <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by title or subject"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="sb-input pl-11"
                        />
                    </div>

                    <div className="sb-card sb-notes-collection">
                        <div className="sb-notes-controls">
                            <div className="sb-filter-menu" ref={filterRef}>
                                <button
                                    type="button"
                                    className="sb-filter-btn"
                                    onClick={() => setIsFilterOpen((prev) => !prev)}
                                    aria-label="Filter notes by subject"
                                    aria-expanded={isFilterOpen}
                                >
                                    <HiOutlineFilter className="text-base" />
                                </button>
                                {isFilterOpen && (
                                    <div
                                        className="sb-filter-panel"
                                        onWheel={(event) => event.stopPropagation()}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedSubject('All');
                                                setIsFilterOpen(false);
                                            }}
                                            className={`sb-filter-option ${selectedSubject === 'All' ? 'active' : ''}`}
                                        >
                                            All subjects
                                        </button>
                                        {subjects.map((subject) => (
                                            <button
                                                type="button"
                                                key={subject}
                                                onClick={() => {
                                                    setSelectedSubject(subject);
                                                    setIsFilterOpen(false);
                                                }}
                                                className={`sb-filter-option ${selectedSubject === subject ? 'active' : ''}`}
                                            >
                                                {subject}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        {filteredNotes.length === 0 ? (
                            <div className="sb-notes-empty text-center space-y-3">
                                <p className="text-slate-400 text-sm">No notes found yet. Start your first study capture.</p>
                                <Link to="/create-note" className="sb-btn sb-btn-primary mx-auto">
                                    Create a Note
                                </Link>
                            </div>
                        ) : (
                            <div className={`sb-notes-scroll ${filteredNotes.length > 4 ? 'is-scrollable' : ''}`}>
                                <div className="sb-notes-grid">
                                    {filteredNotes.map(note => (
                                        <NoteCard key={note.id} note={note} onDelete={deleteNote} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                <aside className="space-y-6">
                    <PomodoroTimer />
                    <ResourceLinks
                        title="Resources Dashboard"
                        kicker="All sources"
                        description="Browse every saved link or file across your notes."
                    />
                </aside>
            </section>
        </div>
    );
};

export default Dashboard;
