import { useEffect, useState } from 'react';
import { TrendingUp, Target, Award, BarChart3, RotateCcw, AlertCircle } from 'lucide-react';
import { words } from '../data/words';
import { resetAllPersistentState } from '../hooks/usePersistentState';

interface LearningStats {
  totalAttempts: number;
  correctAttempts: number;
  wordProgress: Record<string, { correct: number; wrong: number }>;
}

const STORAGE_KEY = 'word-learning-stats';

const Stats = () => {
  const [stats, setStats] = useState<LearningStats>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {
      totalAttempts: 0,
      correctAttempts: 0,
      wordProgress: {}
    };
  });
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const accuracy = stats.totalAttempts > 0 
    ? Math.round((stats.correctAttempts / stats.totalAttempts) * 100) 
    : 0;

  const practicedWords = Object.keys(stats.wordProgress).length;
  const masteredWords = Object.values(stats.wordProgress).filter(
    p => p.correct >= 3 && (p.wrong === 0 || p.correct / (p.correct + p.wrong) >= 0.8)
  ).length;

  const resetStats = () => {
    setStats({
      totalAttempts: 0,
      correctAttempts: 0,
      wordProgress: {}
    });
    localStorage.removeItem(STORAGE_KEY);
  };

  const resetAllState = () => {
    resetAllPersistentState();
    setStats({
      totalAttempts: 0,
      correctAttempts: 0,
      wordProgress: {}
    });
    setShowResetConfirm(false);
  };

  const getWordProgress = (wordId: string) => {
    return stats.wordProgress[wordId] || { correct: 0, wrong: 0 };
  };

  const sortedWords = [...words].sort((a, b) => {
    const progressA = getWordProgress(a.id);
    const progressB = getWordProgress(b.id);
    const rateA = progressA.correct + progressA.wrong > 0 
      ? progressA.correct / (progressA.correct + progressA.wrong) 
      : -1;
    const rateB = progressB.correct + progressB.wrong > 0 
      ? progressB.correct / (progressB.correct + progressB.wrong) 
      : -1;
    return rateA - rateB;
  });

  const weakestWords = sortedWords.slice(0, 5).filter(w => {
    const p = getWordProgress(w.id);
    return p.correct + p.wrong > 0;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
        <header className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            学习统计
          </h1>
          <p className="text-gray-500 text-sm mt-2">查看你的学习进度</p>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              <span className="text-xs sm:text-sm text-gray-500">总练习</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-800">{stats.totalAttempts}</div>
          </div>

          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
              <span className="text-xs sm:text-sm text-gray-500">正确</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.correctAttempts}</div>
          </div>

          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
              <span className="text-xs sm:text-sm text-gray-500">正确率</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-indigo-600">{accuracy}%</div>
          </div>

          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
              <span className="text-xs sm:text-sm text-gray-500">已掌握</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-purple-600">{masteredWords}/{words.length}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 sm:mb-8">
          <div className="p-3 sm:p-4 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-2 text-gray-600">
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm font-medium">学习进度</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resetStats}
                className="flex items-center gap-1 text-xs sm:text-sm text-red-500 hover:text-red-600 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                重置统计
              </button>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-1 text-xs sm:text-sm text-orange-500 hover:text-orange-600 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                重置全部
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="relative h-4 sm:h-6 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${(practicedWords / words.length) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs sm:text-sm text-gray-500">
              <span>已练习: {practicedWords} 个</span>
              <span>剩余: {words.length - practicedWords} 个</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-gray-100">
            <div className="flex items-center gap-2 text-gray-600">
              <Target className="w-5 h-5" />
              <span className="text-sm font-medium">需要加强的单词</span>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {weakestWords.length > 0 ? (
              <div className="space-y-3">
                {weakestWords.map(word => {
                  const progress = getWordProgress(word.id);
                  const total = progress.correct + progress.wrong;
                  const rate = total > 0 ? Math.round((progress.correct / total) * 100) : 0;
                  
                  return (
                    <div key={word.id} className="flex items-center gap-3 sm:gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800">{word.word}</span>
                          <span className="text-xs text-gray-400">{word.phonetic}</span>
                        </div>
                        <p className="text-xs text-gray-500">{word.meaning}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-700">{rate}%</div>
                        <div className="text-xs text-gray-400">
                          {progress.correct}/{total}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">暂无数据，开始学习吧！</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl">
          <h3 className="font-semibold text-gray-800 mb-2">学习建议</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            {accuracy < 60 && <li>• 建议多复习已学单词，巩固记忆</li>}
            {masteredWords < words.length * 0.5 && <li>• 每天坚持学习 10-20 个新单词</li>}
            {weakestWords.length > 0 && <li>• 重点关注需要加强的单词</li>}
            {accuracy >= 80 && masteredWords >= words.length * 0.8 && <li>• 表现优秀！继续保持！</li>}
          </ul>
        </div>

        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">确认重置</h3>
              </div>
              <p className="text-gray-600 mb-6">
                确定要重置所有数据吗？这将清除学习进度、当前状态和自定义单词，此操作无法撤销。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={resetAllState}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                >
                  确认重置
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stats;
