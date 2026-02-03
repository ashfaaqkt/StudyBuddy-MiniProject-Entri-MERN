import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineSparkles } from 'react-icons/hi';

const NotFound = () => {
    return (
        <div className="sb-container">
            <div className="sb-card text-center space-y-6">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-200">
                    <HiOutlineSparkles className="text-2xl" />
                </div>
                <h1 className="font-display text-5xl text-white">404</h1>
                <p className="text-slate-400 text-sm">We couldn't find that page. Let's take you back to your study space.</p>
                <Link to="/dashboard" className="sb-btn sb-btn-primary">
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
