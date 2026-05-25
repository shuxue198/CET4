import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Home from "@/pages/Home";
import WordList from "@/pages/WordList";
import Stats from "@/pages/Stats";
import AddWords from "@/pages/AddWords";
import Navigation from "@/components/Navigation";
import { useAppState } from './hooks/usePersistentState';

function AppContent() {
  const navigate = useNavigate();
  const [appState] = useAppState();

  useEffect(() => {
    const lastRoute = appState.currentRoute;
    if (lastRoute && window.location.pathname === '/') {
      navigate(lastRoute);
    }
  }, [appState.currentRoute, navigate]);

  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/words" element={<WordList />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/add" element={<AddWords />} />
      </Routes>
      <Navigation />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
