import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Volume2, BookOpen, Hash } from 'lucide-react';
import { words } from '../data/words';
import { useWordListState } from '../hooks/usePersistentState';
import { AlphabetFilter } from '../components/AlphabetFilter';

interface WordGroup {
  letter: string;
  words: typeof words;
}

const WordList = () => {
  const [{ searchQuery, scrollPosition, expandedWordId }, setWordListState] = useWordListState();
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current && scrollPosition > 0) {
      listRef.current.scrollTop = scrollPosition;
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (listRef.current) {
        setWordListState(prev => ({ ...prev, scrollPosition: listRef.current!.scrollTop }));
      }
    };

    const list = listRef.current;
    if (list) {
      list.addEventListener('scroll', handleScroll);
      return () => list.removeEventListener('scroll', handleScroll);
    }
  }, [setWordListState]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setWordListState(prev => ({ ...prev, searchQuery: value, scrollPosition: 0 }));
  };

  const toggleExpand = (wordId: string) => {
    const newExpandedId = expandedWordId === wordId ? null : wordId;
    setWordListState(prev => ({ ...prev, expandedWordId: newExpandedId }));
  };

  const getFirstLetter = (word: string): string => {
    const firstChar = word.charAt(0).toUpperCase();
    return /[A-Z]/.test(firstChar) ? firstChar : '#';
  };

  const filteredAndSortedWords = useMemo(() => {
    let result = [...words];

    if (searchTerm) {
      result = result.filter(word =>
        word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.meaning.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLetter) {
      result = result.filter(word => getFirstLetter(word.word) === selectedLetter);
    }

    result.sort((a, b) => a.word.localeCompare(b.word, 'en'));

    return result;
  }, [searchTerm, selectedLetter]);

  const wordGroups = useMemo((): WordGroup[] => {
    const groups: Record<string, typeof words> = {};

    filteredAndSortedWords.forEach(word => {
      const letter = getFirstLetter(word.word);
      if (!groups[letter]) {
        groups[letter] = [];
      }
      groups[letter].push(word);
    });

    return Object.entries(groups)
      .sort(([a], [b]) => {
        if (a === '#') return -1;
        if (b === '#') return 1;
        return a.localeCompare(b);
      })
      .map(([letter, words]) => ({ letter, words }));
  }, [filteredAndSortedWords]);

  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    
    const sourceWords = searchTerm 
      ? words.filter(word =>
          word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
          word.meaning.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : words;
    
    sourceWords.forEach(word => {
      const letter = getFirstLetter(word.word);
      if (letter !== '#') {
        letters.add(letter);
      }
    });
    
    const sortedLetters = Array.from(letters).sort();
    console.log(`Available letters computed: ${sortedLetters.length} letters [${sortedLetters.join(',')}]`);
    return sortedLetters;
  }, [searchTerm]);

  const handleLetterSelect = (letter: string | null) => {
    setSelectedLetter(letter);
    setWordListState(prev => ({ ...prev, scrollPosition: 0 }));
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
            单词列表
          </h1>
          <p className="text-gray-500 text-sm mt-2">浏览所有四级单词</p>
        </header>

        <div className="relative mb-4 sm:mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="搜索单词或释义..."
            className="w-full pl-10 pr-4 py-3 sm:py-4 bg-white rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors shadow-sm"
          />
        </div>

        <AlphabetFilter
          selectedLetter={selectedLetter}
          availableLetters={availableLetters}
          onSelectLetter={handleLetterSelect}
        />

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-gray-100">
            <div className="flex items-center gap-2 text-gray-600">
              <BookOpen className="w-5 h-5" />
              <span className="text-sm font-medium">共 {filteredAndSortedWords.length} 个单词</span>
            </div>
          </div>

          <div ref={listRef} className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
            {wordGroups.length > 0 ? (
              wordGroups.map((group) => (
                <div key={group.letter}>
                  <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100 sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                      {group.letter === '#' ? (
                        <Hash className="w-4 h-4 text-gray-400" />
                      ) : (
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">
                          {group.letter}
                        </span>
                      )}
                      <span className="text-sm font-medium text-gray-500">
                        {group.letter === '#' ? '其他' : `${group.letter} 开头`}
                        <span className="text-gray-400 ml-1">({group.words.length})</span>
                      </span>
                    </div>
                  </div>
                  {group.words.map((word) => (
                    <div
                      key={word.id}
                      className="p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => toggleExpand(word.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
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
                          </div>
                          <p className="text-sm sm:text-base text-gray-600 mt-1">
                            {word.meaning}
                          </p>
                        </div>
                      </div>

                      {expandedWordId === word.id && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm text-gray-500 italic">
                            例句：{word.example}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="p-8 sm:p-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {selectedLetter
                    ? `未找到以 "${selectedLetter}" 开头的单词`
                    : searchTerm
                    ? '未找到匹配的单词'
                    : '暂无单词数据'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordList;
