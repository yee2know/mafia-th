"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../src/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../../src/firebase";
import Link from "next/link";

export default function GamePage() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [rankings, setRankings] = useState<
    Array<{ name: string; score: number }>
  >([]);
  const [userName, setUserName] = useState("");
  const [level, setLevel] = useState(1);
  const [gameCount, setGameCount] = useState(0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/");
      } else {
        setUserName(user.displayName || "");
        loadBestScore();
        loadRankings();
      }
    });

    return () => unsubscribe();
  }, [router]);

  const loadBestScore = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const scoresRef = collection(db, "scores");
      const q = query(
        scoresRef,
        where("userId", "==", user.uid),
        where("level", "==", level)
      );
      const querySnapshot = await getDocs(q);

      let bestScore: number | null = null;
      querySnapshot.forEach((doc) => {
        const score = doc.data().score;
        if (!bestScore || score > bestScore) {
          bestScore = score;
        }
      });

      setBestScore(bestScore);
    } catch (error) {
      console.error("Error loading best score:", error);
    }
  };

  const loadRankings = async () => {
    try {
      const scoresRef = collection(db, "scores");
      const q = query(scoresRef, where("level", "==", level));
      const querySnapshot = await getDocs(q);

      const rankingsData = querySnapshot.docs
        .map((doc) => ({
          name: doc.data().userName,
          score: doc.data().score,
          level: doc.data().level,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      setRankings(rankingsData);
    } catch (error) {
      console.error("Error loading rankings:", error);
    }
  };

  const startGame = () => {
    setIsPlaying(true);
    const delay = Math.random() * 2000 + 1000; // 1-3초 사이의 랜덤 딜레이
    setTimeout(() => {
      setStartTime(Date.now());
    }, delay);
  };

  const calculateScore = (reactionTime: number): number => {
    // 반응 시간이 짧을수록 높은 점수
    // 100ms 이하: 1000점
    // 200ms: 800점
    // 300ms: 600점
    // 400ms: 400점
    // 500ms: 200점
    // 500ms 이상: 100점
    if (reactionTime <= 100) return 1000;
    if (reactionTime <= 200) return 800;
    if (reactionTime <= 300) return 600;
    if (reactionTime <= 400) return 400;
    if (reactionTime <= 500) return 200;
    return 100;
  };

  const handleClick = () => {
    if (!startTime) {
      setScore(null);
      setIsPlaying(false);
      return;
    }

    const endTime = Date.now();
    const reactionTime = endTime - startTime;
    const newScore = calculateScore(reactionTime);
    setScore(newScore);
    setIsPlaying(false);
    setStartTime(null);

    // 게임 횟수 증가
    setGameCount((prev) => prev + 1);

    // 5번의 게임마다 레벨 업
    if (gameCount > 0 && gameCount % 5 === 0) {
      setLevel((prev) => prev + 1);
    }

    // 최고 점수 업데이트
    if (!bestScore || newScore > bestScore) {
      setBestScore(newScore);
    }

    // 모든 기록 저장
    saveScore(newScore);
  };

  const saveScore = async (score: number) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      await addDoc(collection(db, "scores"), {
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        score: score,
        level: level,
        timestamp: serverTimestamp(),
      });

      // 랭킹 업데이트
      loadRankings();
    } catch (error) {
      console.error("Error saving score:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">반응 속도 게임</h1>

        <div className="mb-4">
          <h2 className="text-xl font-semibold">레벨 {level}</h2>
          <p className="text-gray-600">게임 횟수: {gameCount}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">최고 점수</h2>
          <p className="text-2xl font-bold text-blue-600">
            {bestScore ? `${bestScore}점` : "기록 없음"}
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">레벨 {level} 랭킹</h2>
          <div className="space-y-2">
            {rankings.length > 0 ? (
              rankings.map((rank, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <span className="font-medium">
                    {index + 1}. {rank.name}
                  </span>
                  <span className="text-blue-600">{rank.score}점</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">
                랭킹 데이터가 없습니다
              </p>
            )}
          </div>
          <div className="mt-4 text-center">
            <Link href="/ranking" className="text-blue-500 hover:text-blue-700">
              전체 랭킹 보기
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">현재 점수</h2>
          <p className="text-2xl font-bold text-blue-600">
            {score ? `${score}점` : "게임을 시작하세요"}
          </p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={isPlaying ? handleClick : startGame}
            className={`px-6 py-3 rounded-lg text-white font-semibold ${
              isPlaying
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isPlaying ? "클릭!" : "게임 시작"}
          </button>
        </div>
      </div>
    </div>
  );
}
