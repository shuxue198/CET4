import { useState } from 'react';
import { Plus, X, BookOpen, Volume2, Search } from 'lucide-react';
import { words as defaultWords, Word } from '../data/words';

const STORAGE_KEY = 'custom-words';

const AddWords = () => {
  const [showForm, setShowForm] = useState(false);
  const [customWords, setCustomWords] = useState<Word[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [newWord, setNewWord] = useState({
    word: '',
    phonetic: '',
    meaning: '',
    example: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedWord, setExpandedWord] = useState<string | null>(null);

  const allWords = [...defaultWords, ...customWords];

  const filteredWords = allWords.filter(word =>
    word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    word.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.word || !newWord.meaning) return;

    const word: Word = {
      id: `custom-${Date.now()}`,
      word: newWord.word.toLowerCase(),
      phonetic: newWord.phonetic || '/-/',
      meaning: newWord.meaning,
      example: newWord.example || ''
    };

    const updatedWords = [...customWords, word];
    setCustomWords(updatedWords);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWords));

    setNewWord({ word: '', phonetic: '', meaning: '', example: '' });
    setShowForm(false);
  };

  const handleDeleteWord = (id: string) => {
    const updatedWords = customWords.filter(w => w.id !== id);
    setCustomWords(updatedWords);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWords));
  };

  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
        <header className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            单词管理
          </h1>
          <p className="text-gray-500 text-sm mt-2">添加和管理自定义单词</p>
        </header>

        <div className="flex gap-3 mb-4 sm:mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索单词..."
              className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors shadow-sm"
            />
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 sm:px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">添加单词</span>
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">添加新单词</h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleAddWord} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    单词 *
                  </label>
                  <input
                    type="text"
                    value={newWord.word}
                    onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                    placeholder="例如：challenge"
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    音标
                  </label>
                  <input
                    type="text"
                    value={newWord.phonetic}
                    onChange={(e) => setNewWord({ ...newWord, phonetic: e.target.value })}
                    placeholder="例如：/ˈtʃælɪndʒ/"
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  释义 *
                </label>
                <input
                  type="text"
                  value={newWord.meaning}
                  onChange={(e) => setNewWord({ ...newWord, meaning: e.target.value })}
                  placeholder="例如：n. 挑战"
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  例句
                </label>
                <input
                  type="text"
                  value={newWord.example}
                  onChange={(e) => setNewWord({ ...newWord, example: e.target.value })}
                  placeholder="例如：Face the challenge bravely."
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                添加单词
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-gray-100">
            <div className="flex items-center gap-2 text-gray-600">
              <BookOpen className="w-5 h-5" />
              <span className="text-sm font-medium">
                单词列表（共 {filteredWords.length} 个，{customWords.length} 个自定义）
              </span>
            </div>
          </div>

          <div className="divide-y divide-gray-100 max-h-[50vh] overflow-y-auto">
            {filteredWords.map((word) => (
              <div
                key={word.id}
                className="p-3 sm:p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 cursor-pointer" onClick={() => setExpandedWord(expandedWord === word.id ? null : word.id)}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-lg sm:text-xl font-bold text-gray-800">
                        {word.word}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-400">
                        {word.phonetic}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakWord(word.word);
                        }}
                        className="p-1 rounded-full hover:bg-indigo-100 text-indigo-600 transition-colors"
                      >
                        <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      {word.id.startsWith('custom-') && (
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                          自定义
                        </span>
                      )}
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">
                      {word.meaning}
                    </p>
                  </div>
                  {word.id.startsWith('custom-') && (
                    <button
                      onClick={() => handleDeleteWord(word.id)}
                      className="p-2 hover:bg-red-100 rounded-full text-red-500 transition-colors ml-2"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  )}
                </div>

                {expandedWord === word.id && word.example && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-500 italic">
                      例句：{word.example}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredWords.length === 0 && (
            <div className="p-8 sm:p-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">未找到匹配的单词</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddWords;
