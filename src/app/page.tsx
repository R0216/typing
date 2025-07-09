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
  const [timeLeft, setTimeLeft] = useState(60);
  const [finalCpm, setFinalCpm] = useState(0);
  const [finalWpm, setFinalWpm] = useState(0);

  useEffect(() => {
    if (gamePhase === 'playing') {
      setCurrentWord(words[wordIndex]);
    }
  }, [wordIndex, gamePhase]);

  useEffect(() => {
    if (gamePhase === 'finished') {
      const initialTime = 60;
      const gameDuration = initialTime - timeLeft;
      const effectiveGameDuration = gameDuration > 0 ? gameDuration : 1;
      const calculatedCpm = Math.round((correctCount / effectiveGameDuration) * 60);
      const calculatedWpm = Math.round(calculatedCpm / 5);

      setFinalCpm(calculatedCpm);
      setFinalWpm(calculatedWpm);
    }
  }, [gamePhase, correctCount, timeLeft]);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gamePhase === 'idle' && event.key === ' ') {
        event.preventDefault();
        gameStart();
        return;
      }
      if (gamePhase !== 'playing' || !currentWord) return;

      if (event.key === 'Enter') {
        event.preventDefault();
        return;
      }

      if (event.key === 'Backspace') {
        setTypedChars((prev) => prev.slice(0, -1));
        event.preventDefault();
        return;
      }

      if (event.key.length === 1) {
        const nextChar = currentWord[typedChars.length];

        if (nextChar === event.key) {
          const newTypedChars = typedChars + event.key;
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

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (gamePhase === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((pervTime) => pervTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && gamePhase === 'playing') {
      setGamePhase('finished');
      setCurrentWord('');
      setTypedChars('');
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [gamePhase, timeLeft]);

  const gameStart = () => {
    setGamePhase('playing');
    setWordIndex(0);
    setTypedChars('');
    setCorrectCount(0);
    setMissCount(0);
    setTimeLeft(60);
    setFinalCpm(0);
    setFinalWpm(0);
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
            <p>「ゲーム開始」をクリックか**スペースキー**で開始</p>
            <button onClick={gameStart} className={styles.startButton}>
              ゲーム開始
            </button>
          </div>
        )}
        {gamePhase === 'playing' && (
          <>
            <p>残り時間：{timeLeft}秒</p>
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
            {timeLeft === 0 && <p>時間切れです！</p>}
            {wordIndex === words.length && <p>すべての単語を打ち終えました！</p>}
            <p>最終スコア：{correctCount}</p>
            <p>ミス数：{missCount}</p>
            <p>
              <strong>CPM: {finalCpm}</strong>
            </p>
            <p>
              <strong>CPM: {finalWpm}</strong>
            </p>
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
