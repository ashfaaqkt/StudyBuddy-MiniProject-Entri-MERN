import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
    const [notes, setNotes] = useState(() => {
        const saved = localStorage.getItem('studyBuddyFiles');
        return saved ? JSON.parse(saved) : [];
    });

    const [quizScores, setQuizScores] = useState(() => {
        const saved = localStorage.getItem('studyBuddyScores');
        return saved ? JSON.parse(saved) : [];
    });

    // --- Global Timer State ---
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState('work');
    const [isChatOpen, setIsChatOpen] = useState(false);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
            audio.play().catch(() => null);
            if (mode === 'work') {
                alert('Work session done! Take a break.');
                setMode('break');
                setTimeLeft(5 * 60);
            } else {
                alert('Break over! Back to work.');
                setMode('work');
                setTimeLeft(25 * 60);
            }
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode]);

    const toggleTimer = () => setIsActive((prev) => !prev);
    const resetTimer = () => {
        setIsActive(false);
        setMode('work');
        setTimeLeft(25 * 60);
    };

    const startTimer = () => setIsActive(true);
    const pauseTimer = () => setIsActive(false);

    useEffect(() => {
        localStorage.setItem('studyBuddyFiles', JSON.stringify(notes));
    }, [notes]);

    useEffect(() => {
        localStorage.setItem('studyBuddyScores', JSON.stringify(quizScores));
    }, [quizScores]);

    const addNote = (note) => {
        const newNote = { ...note, id: Date.now(), createdAt: new Date().toISOString() };
        setNotes([newNote, ...notes]);
    };

    const updateNote = (updatedNote) => {
        setNotes(notes.map(n => n.id === updatedNote.id ? { ...n, ...updatedNote } : n));
    };

    const deleteNote = (id) => {
        setNotes(notes.filter(n => n.id !== id));
    };

    const addScore = (scoreData) => {
        const newScore = { ...scoreData, id: Date.now(), date: new Date().toISOString() };
        setQuizScores([...quizScores, newScore]);
    };

    return (
        <AppContext.Provider value={{
            notes,
            addNote,
            updateNote,
            deleteNote,
            quizScores,
            addScore,
            // Timer exports
            timeLeft,
            isActive,
            mode,
            toggleTimer,
            resetTimer,
            startTimer,
            pauseTimer,
            setTimeLeft,
            setMode,
            // Chat State
            isChatOpen,
            setIsChatOpen
        }}>
            {children}
        </AppContext.Provider>
    );
};
