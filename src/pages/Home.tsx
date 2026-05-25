import { useState, useEffect, useRef } from 'react';
import { Check, X, RotateCcw, Volume2, Eye, EyeOff } from 'lucide-react';
import { words as defaultWords, Word } from '../data/words';
import { useHomeState } from '../hooks/usePersistentState';

interface LearningStats {
  totalAttempts: number;
  correctAttempts: number;
  wordProgress: Record<string, { correct: number; wrong: number }>;
}

const STORAGE_KEY = 'word-learning-stats';
const CUSTOM_WORDS_KEY = 'custom-words';

const Home = () => {
  const [{ currentIndex, showAnswer }, setHomeState, resetHomeState] = useHomeState();
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [stats, setStats] = useState<LearningStats>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {
      totalAttempts: 0,
      correctAttempts: 0,
      wordProgress: {}
    };
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [allWords, setAllWords] = useState<Word[]>(defaultWords);

  useEffect(() => {
    const customWords = localStorage.getItem(CUSTOM_WORDS_KEY);
    if (customWords) {
      setAllWords([...defaultWords, ...JSON.parse(customWords)]);
    }
  }, []);

  const currentWord = allWords[currentIndex];
  const progress = ((currentIndex + 1) / allWords.length) * 100;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentIndex]);

  useEffect(() => {
    const handleStorage = () => {
      const customWords = localStorage.getItem(CUSTOM_WORDS_KEY);
      if (customWords) {
        setAllWords([...defaultWords, ...JSON.parse(customWords)]);
      } else {
        setAllWords(defaultWords);
      }
    };

    window.addEventListener('storage', handleStorage);
    const interval = setInterval(handleStorage, 1000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isAnimating || !currentWord) return;

    const isCorrect = userInput.trim().toLowerCase() === currentWord.word.toLowerCase();
    setIsAnimating(true);

    if (isCorrect) {
      setFeedback('correct');
      setStats(prev => ({
        ...prev,
        totalAttempts: prev.totalAttempts + 1,
        correctAttempts: prev.correctAttempts + 1,
        wordProgress: {
          ...prev.wordProgress,
          [currentWord.id]: {
            correct: (prev.wordProgress[currentWord.id]?.correct || 0) + 1,
            wrong: prev.wordProgress[currentWord.id]?.wrong || 0
          }
        }
      }));
    } else {
      setFeedback('wrong');
      setHomeState(prev => ({ ...prev, showAnswer: true }));
      setStats(prev => ({
        ...prev,
        totalAttempts: prev.totalAttempts + 1,
        wordProgress: {
          ...prev.wordProgress,
          [currentWord.id]: {
            correct: prev.wordProgress[currentWord.id]?.correct || 0,
            wrong: (prev.wordProgress[currentWord.id]?.wrong || 0) + 1
          }
        }
      }));
    }

    setTimeout(() => {
      nextWord();
      setIsAnimating(false);
    }, 800);
  };

  const nextWord = () => {
    setHomeState(prev => ({ 
      currentIndex: (prev.currentIndex + 1) % allWords.length, 
      showAnswer: false 
    }));
    setUserInput('');
    setFeedback(null);
  };

  const resetProgress = () => {
    setStats({
      totalAttempts: 0,
      correctAttempts: 0,
      wordProgress: {}
    });
    resetHomeState();
    setUserInput('');
    setFeedback(null);
  };

  const shuffleWords = () => {
    const shuffled = [...allWords].sort(() => Math.random() - 0.5);
    setAllWords(shuffled);
    setHomeState({ currentIndex: 0, showAnswer: false });
    setUserInput('');
    setFeedback(null);
  };

  const speakWord = () => {
    if ('speechSynthesis' in window && currentWord) {
      const utterance = new SpeechSynthesisUtterance(currentWord.word);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  const accuracy = stats.totalAttempts > 0
    ? Math.round((stats.correctAttempts / stats.totalAttempts) * 100)
    : 0;

  if (!currentWord) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
        <header className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            四级单词记忆
          </h1>
          <p className="text-gray-500 text-sm mt-2">通过键盘输入强化记忆</p>
        </header>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="h-2 bg-gray-100">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <span className="text-sm text-gray-500">
                {currentIndex + 1} / {allWords.length}
              </span>
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <button
                    onClick={shuffleWords}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                    title="随机打乱"
                  >
                    <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <span className="text-xs text-gray-400 mt-1">随机打乱</span>
                </div>
                <div className="flex flex-col items-center">
                  <button
                    onClick={resetProgress}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                    title="重置进度"
                  >
                    <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <span className="text-xs text-gray-400 mt-1">重置进度</span>
                </div>
              </div>
            </div>

            <div
              className={`relative bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 transition-all duration-300 ${
                feedback === 'correct' ? 'ring-4 ring-green-400 bg-green-50' :
                feedback === 'wrong' ? 'ring-4 ring-red-400 bg-red-50' : ''
              } ${isAnimating ? 'scale-[1.02]' : ''}`}
            >
              <button
                onClick={speakWord}
                className="absolute top-3 right-3 p-2 rounded-full bg-white/80 shadow-sm hover:bg-white transition-colors text-indigo-600"
              >
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <div className="mb-2 sm:mb-3">
                <span className="text-xs sm:text-sm px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                  {currentWord.phonetic}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 sm:mb-3">
                {currentWord.meaning}
              </h2>

              <p className="text-sm sm:text-base text-gray-500 italic">
                {currentWord.example}
              </p>
            </div>

            <button
              onClick={() => setHomeState(prev => ({ ...prev, showAnswer: !prev.showAnswer }))}
              aria-expanded={showAnswer}
              aria-label={showAnswer ? '隐藏答案' : '查看答案'}
              className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 mb-4 sm:mb-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                showAnswer
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:scale-105 active:scale-95'
              }`}
            >
              {showAnswer ? (
                <>
                  <EyeOff className="w-5 h-5" />
                  <span>隐藏答案</span>
                </>
              ) : (
                <>
                  <Eye className="w-5 h-5" />
                  <span>查看答案</span>
                </>
              )}
            </button>

            <div
              className={`mb-4 sm:mb-6 overflow-hidden transition-all duration-300 ease-in-out ${
                showAnswer ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="p-3 sm:p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-600">正确答案：</span>
                  <span className="text-lg sm:text-xl font-bold text-indigo-600">
                    {currentWord.word}
                  </span>
                  {currentWord.phonetic && (
                    <span className="text-sm text-gray-500">
                      {currentWord.phonetic}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="输入单词..."
                  className={`w-full px-4 sm:px-6 py-3 sm:py-4 text-lg sm:text-xl rounded-xl border-2 transition-all duration-300 focus:outline-none ${
                    feedback === 'correct' ? 'border-green-400 bg-green-50' :
                    feedback === 'wrong' ? 'border-red-400 bg-red-50' :
                    'border-gray-200 focus:border-indigo-500'
                  }`}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={!userInput.trim() || isAnimating}
                  className={`absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-xl transition-all duration-300 ${
                    userInput.trim() && !isAnimating
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg hover:scale-105'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </form>

            {feedback && (
              <div className={`mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl text-center transition-all duration-300 ${
                feedback === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <div className="flex items-center justify-center gap-2">
                  {feedback === 'correct' ? (
                    <>
                      <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="font-semibold">正确！太棒了！</span>
                    </>
                  ) : (
                    <>
                      <X className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="font-semibold">再接再厉！</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
            <div className="text-xs sm:text-sm text-gray-500 mb-1">总练习</div>
            <div className="text-xl sm:text-2xl font-bold text-gray-800">{stats.totalAttempts}</div>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
            <div className="text-xs sm:text-sm text-gray-500 mb-1">正确</div>
            <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.correctAttempts}</div>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
            <div className="text-xs sm:text-sm text-gray-500 mb-1">正确率</div>
            <div className="text-xl sm:text-2xl font-bold text-indigo-600">{accuracy}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
