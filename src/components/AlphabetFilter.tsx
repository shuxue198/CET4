import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';

interface AlphabetFilterProps {
  selectedLetter: string | null;
  availableLetters: string[];
  onSelectLetter: (letter: string | null) => void;
}

export function AlphabetFilter({ selectedLetter, availableLetters, onSelectLetter }: AlphabetFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  useEffect(() => {
    console.log('Available letters updated:', availableLetters);
  }, [availableLetters]);

  return (
    <div className="mb-4 sm:mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between bg-white rounded-xl border-2 border-gray-200 p-3 sm:p-4 hover:border-indigo-300 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
          <span className="text-sm sm:text-base text-gray-700">
            {selectedLetter ? `当前筛选: ${selectedLetter}` : '按首字母筛选'}
          </span>
        </div>
        <span className="text-xs text-gray-400 mr-2">
          ({availableLetters.length}个字母有单词)
        </span>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-60 opacity-100 mt-3' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white rounded-xl border-2 border-gray-100 p-3 sm:p-4">
          <div className="grid grid-cols-7 sm:grid-cols-13 gap-1 sm:gap-2">
            <button
              onClick={() => onSelectLetter(null)}
              aria-label="清除筛选"
              className={`p-2 sm:p-3 rounded-lg text-sm sm:text-base font-medium transition-all ${
                selectedLetter === null
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            {allLetters.map((letter) => {
              const isAvailable = availableLetters.includes(letter);
              return (
                <button
                  key={letter}
                  onClick={() => isAvailable && onSelectLetter(letter)}
                  disabled={!isAvailable}
                  aria-label={isAvailable ? `筛选以${letter}开头的单词` : `${letter}开头的单词暂不可用`}
                  className={`p-2 sm:p-3 rounded-lg text-sm sm:text-base font-medium transition-all ${
                    selectedLetter === letter
                      ? 'bg-indigo-500 text-white shadow-md scale-105'
                      : isAvailable
                      ? 'bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-600 hover:scale-105'
                      : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
