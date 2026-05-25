import { useEffect } from 'react';
import { Home, BookOpen, BarChart3, Plus } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppState } from '../hooks/usePersistentState';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [, setAppState] = useAppState();

  useEffect(() => {
    setAppState(prev => ({ 
      ...prev, 
      currentRoute: location.pathname,
      lastVisitedAt: Date.now() 
    }));
  }, [location.pathname, setAppState]);

  const navItems = [
    { id: 'home', path: '/', icon: Home, label: '学习' },
    { id: 'words', path: '/words', icon: BookOpen, label: '单词' },
    { id: 'add', path: '/add', icon: Plus, label: '添加' },
    { id: 'stats', path: '/stats', icon: BarChart3, label: '统计' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex justify-around items-center h-14 sm:h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 mb-1 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className="text-xs sm:text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
