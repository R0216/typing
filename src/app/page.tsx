'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';

const words = ['hello', 'world', 'typescript', 'programming', 'game'];

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

async function fetchRandomWord(numberToFetch: number): Promise<string[] | null> {
  try {
    const response = await fetch(
      `https://random-word-api.herokuapp.com/word?number=${numberToFetch}`,
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: string[] = (await response.json()) as string[];
    if (data && data.length > 0) {
      return data;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch word:', error);
    return null;
  }
}

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
  const [isLoadingWord, setIsLoadingWord] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [shuffuledWords, setShuffuledWords] = useState<string[]>([]);

  useEffect(() => {
    if (gamePhase === 'playing' && shuffuledWords.length > 0) {
      setCurrentWord(shuffuledWords[wordIndex]);
      setTypedChars('');
    }
  }, [wordIndex, gamePhase, shuffuledWords]);

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
        (async () => {
          await gameStart();
        })().catch((error) => {
          console.error('Error starting game via spacebar:', error);
          setFetchError('ゲーム開始時にエラーが発生しました。');
          // エラー時も isLoadingWord を false にする
          setIsLoadingWord(false);
        });
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

  const gameStart = async () => {
    setGamePhase('playing');
    setWordIndex(0);
    setTypedChars('');
    setCorrectCount(0);
    setMissCount(0);
    setTimeLeft(60);
    setFinalCpm(0);
    setFinalWpm(0);
    setFetchError(null);
    setIsLoadingWord(true);

    try {
      const fetchedWords = await fetchRandomWord(20);
      if (fetchedWords && fetchedWords.length > 0) {
        setShuffuledWords(shuffleArray(fetchedWords));
      } else {
        const fallbackWords = shuffleArray(words.map((word) => word.toLowerCase()));
        setShuffuledWords(fallbackWords);
        setFetchError('Failed to fetch a random word. Using a fallback word.');
      }
    } catch (error) {
      console.error('Error loading new word:', error);
      const fallbackWords = shuffleArray(words.map((word) => word.toLowerCase()));
      setShuffuledWords(fallbackWords);
      setFetchError('Failed to load word. Check your network or try again.');
    } finally {
      setIsLoadingWord(false);
    }
  };
  const resetGame = async () => {
    await gameStart();
  };

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
            {isLoadingWord ? (
              <p className={styles.loadingMessage}>単語を読み込み中...</p>
            ) : fetchError ? (
              <p className={styles.errorMessage}>{fetchError}</p>
            ) : (
              <p className={styles.wordDisplay}>
                <span className={styles.correctChars}>{typedChars}</span>
                <span className={styles.remainingChars}>
                  {currentWord.substring(typedChars.length)}
                </span>
              </p>
            )}
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
              <strong>WPM: {finalWpm}</strong>
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
