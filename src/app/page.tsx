'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';

const words: string[] = ['hello', 'world', 'typescript', 'programming', 'game'];
export default function Home() {
  const [currentWord, setCurrentWord] = useState('');
  const [typedChars, setTypedChars] = useState('');

  useEffect(() => {
    setCurrentWord(words[0]);
  }, []);

  return (
    <div className={styles.container}>
      <h1>タイピングゲーム</h1>
      <div className={styles.gameArea}>
        {/* 表示単語エリア*/}
        <p className={styles.wordDisplay}>
          {/*入力済みの文字（色を変えるなど）*/}
          <span className={styles.correctChars}>{typedChars}</span>
          {/*未入力の文字*/}
          <span className={styles.remainingChars}>{currentWord.substring(typedChars.length)}</span>
        </p>
      </div>
      {/* 今後、入力受付のロジックや、スコア、タイマーなどをここに追加していきます */}
    </div>
  );
}
