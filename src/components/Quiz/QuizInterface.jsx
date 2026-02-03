import React, { useState, useEffect } from 'react';
import { HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';

const QuizInterface = ({ questions, onComplete }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [score, setScore] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);

    useEffect(() => {
        if (showFeedback) return;

        setTimeLeft(30);
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleTimeOut();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentIndex, showFeedback]);

    const handleTimeOut = () => {
        setShowFeedback(true);
        setTimeout(() => {
            advanceQuestion(score);
        }, 1400);
    };

    const handleOptionSelect = (option) => {
        if (showFeedback) return;
        setSelectedOption(option);
    };

    const handleNext = () => {
        if (!showFeedback && selectedOption) {
            const isCorrect = selectedOption === questions[currentIndex].correctAnswer;
            if (isCorrect) setScore(score + 1);
            setShowFeedback(true);

            setTimeout(() => {
                advanceQuestion(isCorrect ? score + 1 : score);
            }, 1200);
        }
    };

    const advanceQuestion = (currentScore) => {
        setShowFeedback(false);
        setSelectedOption(null);

        if (currentIndex + 1 < questions.length) {
            setCurrentIndex(currentIndex + 1);
        } else {
            onComplete(currentScore, questions.length);
        }
    };

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    if (!currentQuestion) return <div className="text-center p-8">Loading Question...</div>;

    return (
        <div className="space-y-6">
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-sky-400 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                <span className="text-slate-400">Question {currentIndex + 1} of {questions.length}</span>
                <span className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full border ${timeLeft < 10 ? 'border-amber-400/40 text-amber-200' : 'border-white/10 text-slate-300'}`}>
                    <HiOutlineClock /> {timeLeft}s
                </span>
            </div>

            <h3 className="font-display text-2xl text-white leading-snug">
                {currentQuestion.question}
            </h3>

            <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                    let containerClass = 'sb-card-soft p-4 w-full flex items-center justify-between gap-4 text-left transition-all';
                    let icon = null;

                    if (showFeedback) {
                        if (option === currentQuestion.correctAnswer) {
                            containerClass += ' border-emerald-400/50 bg-emerald-400/10 text-emerald-100';
                            icon = <HiOutlineCheckCircle className="text-emerald-200" />;
                        } else if (option === selectedOption) {
                            containerClass += ' border-amber-400/50 bg-amber-400/10 text-amber-100';
                            icon = <HiOutlineXCircle className="text-amber-200" />;
                        } else {
                            containerClass += ' opacity-60';
                        }
                    } else if (selectedOption === option) {
                        containerClass += ' border-emerald-400/50 bg-emerald-400/10 text-emerald-100';
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => handleOptionSelect(option)}
                            className={containerClass}
                            disabled={showFeedback}
                        >
                            <span className="text-sm">{option}</span>
                            {icon}
                        </button>
                    );
                })}
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleNext}
                    disabled={!selectedOption && !showFeedback}
                    className={`sb-btn sb-btn-primary ${(!selectedOption && !showFeedback) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                </button>
            </div>
        </div>
    );
};

export default QuizInterface;
