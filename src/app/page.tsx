'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';

const words: string[] = ['hello', 'world', 'typescript', 'programming', 'game'];
export default function Home() {
  const [currentWord, setCurrentWord] = useState('');
  const [typedChars, setTypedChars] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [missCount, setMissCount] = useState(0);

  useEffect(() => {
    setCurrentWord(words[wordIndex]);
  }, [wordIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key } = event;
      if (key === 'Enter') {
        event.preventDefault();
        return;
      }

      if (key === 'Backapace') {
        setTypedChars((prev) => prev.slice(0, -1));
        event.preventDefault();
        return;
      }

      if (key.length === 1) {
        const nextChar = currentWord[typedChars.length];

        if (nextChar === key) {
          const newTypedChars = typedChars + key;
          const totalTrueTyping = correctCount + 1;
          setTypedChars(newTypedChars);
          setCorrectCount(totalTrueTyping);

          if (newTypedChars.length === currentWord.length) {
            const nextIndex = wordIndex + 1;
            if (nextIndex < words.length) {
              setWordIndex(nextIndex);
              setTypedChars('');
            } else {
              console.log('すべての単語を打ち終えた');
              setCurrentWord('');
              setTypedChars('');
            }
          }
        }
      } else {
        const totalMissTyping = missCount + 1;
        setMissCount(totalMissTyping);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentWord, typedChars, wordIndex]);

  const isWordTyped = typedChars.length === currentWord.length && currentWord.length > 0;

  return (
    <div className={styles.container}>
      <h1>タイピングゲーム</h1>
      <div className={styles.gameArea}>
        <p>スコア：{correctCount}</p>
        <p>ミス：{missCount}</p>
        <p className={styles.wordDisplay}>
          <span className={styles.correctChars}>{typedChars}</span>
          <span className={styles.remainingChars}>{currentWord.substring(typedChars.length)}</span>
        </p>
      </div>
      {/* 今後、入力受付のロジックや、スコア、タイマーなどをここに追加していきます */}
    </div>
  );
}
