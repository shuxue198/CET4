import { readFileSync, writeFileSync } from 'fs';

const mdContent = readFileSync('./大学英语四级高频词汇1500表(1).md', 'utf-8');

const words = [];
const seenWords = new Set();
let currentId = 1;

const lines = mdContent.split('\n');

lines.forEach((line) => {
  if (!line.includes('|')) return;
  
  const parts = line.split('|').map(p => p.trim()).filter(p => p);
  
  if (parts.length < 2) return;
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    if (/^\d+$/.test(part)) continue;
    
    if (!part || part.length < 2) continue;
    
    const wordMatch = part.match(/^([A-Za-z]+)\s*(\(.*?\))?/);
    if (wordMatch) {
      const word = wordMatch[1].toLowerCase();
      let pos = wordMatch[2] ? wordMatch[2].replace(/[()]/g, '') : '';
      
      if (pos) {
        pos = pos.replace(/\.$/, '');
      }
      
      if (word.length >= 2 && !['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].includes(word)) {
        let meaning = '';
        
        if (i + 1 < parts.length) {
          const nextPart = parts[i + 1];
          if (nextPart && !nextPart.match(/^[A-Za-z]/) && !/^\d+$/.test(nextPart)) {
            meaning = nextPart;
          }
        }
        
        if (!seenWords.has(word)) {
          seenWords.add(word);
          words.push({
            id: currentId.toString(),
            word: word,
            phonetic: '',
            meaning: pos ? `${pos}. ${meaning}` : meaning,
            example: ''
          });
          currentId++;
        }
      }
    }
  }
});

const output = `export interface Word {
  id: string;
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
}

export const words: Word[] = [
${words.map(w => `  { id: '${w.id}', word: '${w.word}', phonetic: '${w.phonetic}', meaning: '${w.meaning.replace(/'/g, "\\'")}', example: '${w.example}' }`).join(',\n')}
];`;

writeFileSync('./src/data/words_new.ts', output, 'utf-8');

console.log(`转换完成！共转换 ${words.length} 个单词（去重后）`);
console.log('文件已保存到: src/data/words_new.ts');