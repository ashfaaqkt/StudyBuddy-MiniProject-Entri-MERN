import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import NoteEditor from './pages/NoteEditor';
import QuizPage from './pages/QuizPage';
import NotFound from './pages/NotFound';
import ProgressChart from './components/Stats/ProgressChart';
import TimerOverlay from './components/Tools/TimerOverlay';
import GeminiChat from './components/Tools/GeminiChat';

function App() {
    return (
        <AppProvider>
            <Router>
                <div className="sb-shell">
                    <Header />
                    <main className="flex-1 pt-32 md:pt-24 pb-12 relative z-10">
                        <Routes>
                            <Route path="/" element={<Landing />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/create-note" element={<NoteEditor />} />
                            <Route path="/edit-note/:id" element={<NoteEditor />} />
                            <Route path="/take-quiz" element={<QuizPage />} />
                            <Route path="/stats" element={<ProgressChart />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </main>
                    <TimerOverlay />
                    <GeminiChat />
                    <Footer />
                </div>
            </Router>
        </AppProvider>
    );
}

export default App;
