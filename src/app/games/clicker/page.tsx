"use client";

import { useState, useEffect } from "react";
import { Box, Button, Heading, Text, VStack, useToast } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Layout from "../../components/Layout";
import { updateScores } from "../../firebase/updateScores";
import { checkAndUnlockAvatars } from "@/app/avatar/unlock";
import { UserData } from "@/constants/interface";
export default function ClickerGame() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    const fetchHighScore = async () => {
      if (!auth.currentUser) {
        router.push("/login");
        return;
      }

      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (userDoc.exists()) {
        setHighScore(userDoc.data().scores.clicker || 0);
      }
    };

    fetchHighScore();
  }, [router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isPlaying) {
      handleGameEnd();
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, timeLeft]);

  const handleGameStart = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
  };

  const handleClick = () => {
    if (isPlaying) {
      setScore((prev) => prev + 1);
    }
  };

  const handleGameEnd = async () => {
    setIsPlaying(false);

    if (!auth.currentUser) return;

    if (score > highScore) {
      try {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        const totalscore =
          score +
          (1000 - userData?.scores?.reactionTime || 0) +
          (userData?.scores?.killjennet || 0) +
          (userData?.scores?.taehyung_enhance || 0);
        await updateDoc(userRef, {
          "scores.clicker": score,
          level: Math.floor(totalscore / 100) + 1,
          score: totalscore,
        });
        await updateScores();
        setHighScore(score);
        await checkAndUnlockAvatars(auth.currentUser.uid, userData as UserData);
        toast({
          title: "새로운 최고 점수!",
          status: "success",
          duration: 3000,
        });
      } catch (error) {
        console.error("Error updating score:", error);
        toast({
          title: "점수 업데이트 실패",
          status: "error",
          duration: 3000,
        });
      }
    }
  };

  return (
    <Layout>
      <VStack spacing={6} align="center">
        <Heading>클리커 게임</Heading>
        <Text fontSize="xl">최고 점수: {highScore}</Text>
        <Text fontSize="xl">남은 시간: {timeLeft}초</Text>
        <Text fontSize="2xl">현재 점수: {score}</Text>

        {!isPlaying ? (
          <Button colorScheme="teal" size="lg" onClick={handleGameStart}>
            게임 시작
          </Button>
        ) : (
          <Button
            colorScheme="blue"
            size="lg"
            w="200px"
            h="200px"
            rounded="full"
            onClick={handleClick}
          >
            클릭!
          </Button>
        )}

        <Button variant="ghost" onClick={() => router.push("/")} mt={4}>
          메인으로 돌아가기
        </Button>
      </VStack>
    </Layout>
  );
}
