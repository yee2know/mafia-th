"use client";

import { useState, useEffect, useCallback } from "react";
import { Box, Button, Heading, Text, VStack, useToast } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Layout from "../../components/Layout";
import { updateScores } from "../../firebase/updateScores";
import { checkAndUnlockAvatars } from "@/app/avatar/unlock";
import { UserData } from "@/constants/interface";
type GameState = "waiting" | "ready" | "clicking" | "finished";

export default function ReactionGame() {
  const [gameState, setGameState] = useState<GameState>("waiting");
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [delay, setDelay] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(Infinity);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);
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
        const score = userDoc.data().scores.reactionTime || Infinity;
        setHighScore(score);
      }
    };

    fetchHighScore();
  }, [router]);

  const startGame = useCallback(() => {
    setGameState("ready");
    setDelay(2000 + Math.random() * 3000);
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (gameState === "ready") {
      timeout = setTimeout(() => {
        setStartTime(Date.now());
        setGameState("clicking");
      }, delay);
    }
    return () => clearTimeout(timeout);
  }, [gameState, delay]);

  const handleClick = async () => {
    if (gameState === "waiting") {
      startGame();
    } else if (gameState === "ready") {
      setGameState("waiting");
      toast({
        title: "너무 일찍 클릭했습니다!",
        status: "error",
        duration: 2000,
      });
    } else if (gameState === "clicking") {
      const endTime = Date.now();
      const reactionTime = endTime - startTime;
      setEndTime(endTime);
      setCurrentScore(reactionTime);
      setAttempts((prev) => prev + 1);

      if (reactionTime < highScore) {
        setHighScore(reactionTime);
        if (auth.currentUser) {
          try {
            const userRef = doc(db, "users", auth.currentUser.uid);
            const userDoc = await getDoc(userRef);
            const userData = userDoc.data();
            const totalscore =
              1000 -
              reactionTime +
              (userData?.scores?.clicker || 0) +
              (userData?.scores?.killjennet || 0) +
              (userData?.scores?.taehyung_enhance || 0);
            await updateDoc(userRef, {
              "scores.reactionTime": reactionTime,
              level: Math.floor(totalscore / 100) + 1,
              score: totalscore,
            });

            await updateScores();
            await checkAndUnlockAvatars(
              auth.currentUser.uid,
              userData as UserData
            );
            toast({
              title: "새로운 최고 기록!",
              status: "success",
              duration: 2000,
            });
          } catch (error) {
            console.error("Error updating score:", error);
          }
        }
      }

      if (attempts >= 4) {
        setGameState("finished");
      } else {
        setGameState("waiting");
      }
    }
  };

  const resetGame = () => {
    setGameState("waiting");
    setAttempts(0);
    setCurrentScore(0);
  };

  const getBackgroundColor = () => {
    switch (gameState) {
      case "waiting":
        return "gray.100";
      case "ready":
        return "red.500";
      case "clicking":
        return "green.500";
      default:
        return "gray.100";
    }
  };

  return (
    <Layout>
      <VStack spacing={6} align="center">
        <Heading>반응속도 게임</Heading>
        <Text fontSize="xl">
          최고 기록: {highScore === Infinity ? "-" : `${highScore}ms`}
        </Text>
        {currentScore > 0 && (
          <Text fontSize="xl">현재 기록: {currentScore}ms</Text>
        )}
        <Text fontSize="lg">시도: {attempts}/5</Text>

        <Box
          w="300px"
          h="300px"
          bg={getBackgroundColor()}
          display="flex"
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
          onClick={handleClick}
          rounded="lg"
        >
          <Text color="white" fontSize="xl" textAlign="center">
            {gameState === "waiting"
              ? "클릭하여 시작"
              : gameState === "ready"
              ? "초록색이 되면 클릭하세요!"
              : gameState === "clicking"
              ? "지금 클릭!"
              : "게임 종료"}
          </Text>
        </Box>

        {gameState === "finished" && (
          <Button colorScheme="teal" onClick={resetGame}>
            다시 시작
          </Button>
        )}

        <Button variant="ghost" onClick={() => router.push("/")} mt={4}>
          메인으로 돌아가기
        </Button>
      </VStack>
    </Layout>
  );
}
