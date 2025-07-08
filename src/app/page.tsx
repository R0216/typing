'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';

const words = ['hello', 'world', 'typescript', 'programming', 'game'];
export default function Home() {
  const [currentWord, setCurrentWord] = useState('');
  const [typedChars, setTypedChars] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [missCount, setMissCount] = useState(0);
  const [gamePhase, setGamePhase] = useState<'idle' | 'playing' | 'finished'>('idle');

  useEffect(() => {
    if (gamePhase === 'playing') {
      setCurrentWord(words[wordIndex]);
    }
  }, [wordIndex, gamePhase]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gamePhase !== 'playing' || !currentWord) return;
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
              setGamePhase('finished');
              setCurrentWord('');
              setTypedChars('');
            }
          }
        } else {
          const totalMissTyping = missCount + 1;
          setMissCount(totalMissTyping);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentWord, typedChars, wordIndex, correctCount, missCount, gamePhase]);

  const gameStart = () => {
    setGamePhase('playing');
    setWordIndex(0);
    setTypedChars('');
    setCorrectCount(0);
    setMissCount(0);
  };
  const resetGame = () => {
    gameStart();
  };
  // const isWordTyped = typedChars.length === currentWord.length && currentWord.length > 0;

  return (
    <div className={styles.container}>
      <h1>タイピングゲーム</h1>
      <div className={styles.gameArea}>
        {gamePhase === 'idle' && (
          <div>
            <button onClick={gameStart} className={styles.startButton}>
              ゲーム開始
            </button>
          </div>
        )}
        {gamePhase === 'playing' && (
          <>
            <p>スコア：{correctCount}</p>
            <p>ミス：{missCount}</p>
            <p className={styles.wordDisplay}>
              <span className={styles.correctChars}>{typedChars}</span>
              <span className={styles.remainingChars}>
                {currentWord.substring(typedChars.length)}
              </span>
            </p>
          </>
        )}
        {gamePhase === 'finished' && (
          <div>
            <h2>ゲーム終了</h2>
            <p>最終スコア：{correctCount}</p>
            <p>ミス数：{missCount}</p>
            <button onClick={resetGame} className={styles.resetButton}>
              もう一度プレイ
            </button>
          </div>
        )}
      </div>
      {/* 今後、入力受付のロジックや、スコア、タイマーなどをここに追加していきます */}
    </div>
  );
}
