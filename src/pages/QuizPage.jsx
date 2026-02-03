import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QuizInterface from '../components/Quiz/QuizInterface';
import { useAppContext } from '../context/AppContext';
import { HiOutlineBadgeCheck, HiOutlineChartPie, HiOutlineArrowLeft, HiOutlineSparkles } from 'react-icons/hi';

const QuizPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { addScore } = useAppContext();
    const [questions, setQuestions] = useState([]);
    const [quizFinished, setQuizFinished] = useState(false);
    const [result, setResult] = useState({ score: 0, total: 0 });

    useEffect(() => {
        if (location.state && location.state.questions) {
            setQuestions(location.state.questions);
        } else {
            setTimeout(() => {
                setQuestions([
                    {
                        id: 1,
                        question: "What is the primary function of React's useState hook?",
                        options: ['To handle side effects', 'To manage local state', 'To request data', 'To route pages'],
                        correctAnswer: 'To manage local state',
                    },
                    {
                        id: 2,
                        question: 'Which hook is used for side effects? ',
                        options: ['useContext', 'useReducer', 'useEffect', 'useMemo'],
                        correctAnswer: 'useEffect',
                    },
                    {
                        id: 3,
                        question: 'What is JSX?',
                        options: ['A JavaScript library', 'A syntax extension for JavaScript', 'A database generic', 'A CSS framework'],
                        correctAnswer: 'A syntax extension for JavaScript',
                    },
                    {
                        id: 4,
                        question: 'Which prop is used to pass data into a component?',
                        options: ['state', 'props', 'setState', 'render'],
                        correctAnswer: 'props',
                    },
                    {
                        id: 5,
                        question: 'Which hook runs after every render by default?',
                        options: ['useEffect', 'useMemo', 'useCallback', 'useRef'],
                        correctAnswer: 'useEffect',
                    },
                ]);
            }, 400);
        }
    }, [location.state]);

    const handleQuizComplete = (score, total) => {
        setResult({ score, total });
        setQuizFinished(true);
        addScore({
            score,
            total,
            subject: location.state?.source || 'Practice Quiz',
            date: new Date().toISOString(),
        });
    };

    if (quizFinished) {
        const percentage = Math.round((result.score / result.total) * 100);
        const message =
            percentage >= 80 ? 'Outstanding recall.' : percentage >= 50 ? 'Solid progress. Keep going.' : 'Time to revisit the notes.';

        return (
            <div className="sb-container">
                <div className="sb-card max-w-3xl mx-auto text-center space-y-6">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-200">
                        <HiOutlineBadgeCheck className="text-3xl" />
                    </div>
                    <h2 className="font-display text-3xl text-white">Quiz Complete</h2>
                    <p className="text-slate-400 text-sm">{message}</p>

                    <div className="sb-card-soft text-center">
                        <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Score</p>
                        <p className="font-display text-5xl text-white mt-3">{percentage}%</p>
                        <p className="text-slate-400 text-sm mt-3">{result.score} / {result.total} correct</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => {
                                if (location.state?.noteId) {
                                    navigate(`/edit-note/${location.state.noteId}`);
                                } else {
                                    navigate('/dashboard');
                                }
                            }}
                            className="sb-btn sb-btn-primary"
                        >
                            <HiOutlineArrowLeft /> Back to Notes
                        </button>
                        <button
                            onClick={() => navigate('/stats')}
                            className="sb-btn sb-btn-ghost"
                        >
                            <HiOutlineChartPie /> View Analytics
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="sb-container space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <button
                    onClick={() => {
                        if (location.state?.noteId) {
                            navigate(`/edit-note/${location.state.noteId}`);
                        } else {
                            navigate('/dashboard');
                        }
                    }}
                    className="sb-btn sb-btn-ghost"
                >
                    <HiOutlineArrowLeft /> Exit Quiz
                </button>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <HiOutlineSparkles className="text-emerald-200" />
                    {location.state?.source ? `Quiz: ${location.state.source}` : 'Practice Quiz'}
                </div>
            </div>

            <div className="sb-card max-w-4xl mx-auto">
                {questions.length > 0 ? (
                    <QuizInterface questions={questions} onComplete={handleQuizComplete} />
                ) : (
                    <div className="text-center py-20 space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full border-2 border-emerald-400/40 border-t-transparent animate-spin" />
                        <p className="text-slate-400 text-sm">Preparing your quiz...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizPage;
