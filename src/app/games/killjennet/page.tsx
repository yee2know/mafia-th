"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Box, Button, Text, VStack, useToast, Heading } from "@chakra-ui/react";
import { auth, db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Layout from "../../components/Layout";
import { checkAndUnlockAvatars } from "@/app/avatar/unlock";
import { UserData } from "@/constants/interface";
type Target = {
  id: number;
  x: number;
  y: number;
  isBad: boolean;
};

export default function ReflexGame() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [targets, setTargets] = useState<Target[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (gameStarted && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => t - 1);
        generateTarget();
      }, 1000);
    } else if (timeLeft === 0) {
      endGame();
    }

    return () => clearInterval(interval);
  }, [gameStarted, timeLeft]);

  const generateTarget = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    const newTarget: Target = {
      id: Date.now(),
      x: Math.random() * (width - 40),
      y: Math.random() * (height - 40),
      isBad: Math.random() < 0.3, // 30% 확률로 나쁜 타겟
    };

    setTargets((prev) => [...prev, newTarget]);

    // 자동 제거
    setTimeout(() => {
      setTargets((prev) => prev.filter((t) => t.id !== newTarget.id));
    }, 1000);
  };
  const playSound = (src: string) => {
    const audio = new Audio(src);
    audio.play();
  };
  const handleClickTarget = (target: Target) => {
    setTargets((prev) => prev.filter((t) => t.id !== target.id));
    setScore((s) => s + (target.isBad ? -100 : 50));
    playSound(target.isBad ? "/sfx/bad.mp3" : "/sfx/good.mp3");
    // ✅ 클릭 위치에 애니메이션 효과 추가
    const effect = document.createElement("div");
    effect.style.position = "absolute";
    effect.style.left = `${target.x}px`;
    effect.style.top = `${target.y}px`;
    effect.style.width = "40px";
    effect.style.height = "40px";
    effect.style.backgroundImage = `url("/effects/${
      target.isBad ? "bad" : "blood"
    }.gif")`;
    effect.style.backgroundSize = "cover";
    effect.style.zIndex = "1000";
    effect.style.pointerEvents = "none";

    containerRef.current?.appendChild(effect);

    // 0.5초 후 제거
    setTimeout(() => {
      effect.remove();
    }, 500);
  };

  const startGame = () => {
    setGameStarted(true);
    setTimeLeft(30);
    setScore(0);
    setTargets([]);
  };

  const endGame = async () => {
    setGameStarted(false);

    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    const prevScore = snap.data()?.scores?.killjennet || 0;

    const finalScore = Math.max(score, prevScore);
    const totalscore =
      finalScore +
      (1000 - snap.data()?.scores?.reactionTime || 0) +
      (snap.data()?.scores?.clicker || 0) +
      (snap.data()?.scores?.taehyung_enhance || 0) +
      (snap.data()?.scores?.brick || 0) +
      (snap.data()?.scores?.timing || 0);

    await updateDoc(userRef, {
      [`scores.killjennet`]: finalScore,
      level: Math.floor(totalscore / 100) + 1,
      score: totalscore,
    });
    await checkAndUnlockAvatars(user.uid, snap.data() as UserData);
    toast({
      title: `게임 종료!`,
      description: `최종 점수: ${score}점`,
      status: "info",
      duration: 4000,
    });
  };

  return (
    <Layout>
      <VStack spacing={4} py={6}>
        <Heading size="lg">김태형 죽이기</Heading>
        <Text>김태형을 때리세요! 여친을 때리면 점수를 잃습니다!</Text>
        <Text>남은 시간: {timeLeft}s</Text>
        <Text>점수: {score}</Text>
        {!gameStarted && (
          <Button colorScheme="blue" onClick={startGame}>
            시작하기
          </Button>
        )}
        <Box
          ref={containerRef}
          position="relative"
          width="100%"
          height="500px"
          bg="gray.100"
          rounded="lg"
          overflow="hidden"
        >
          {targets.map((t) => (
            <Image
              key={t.id}
              src={t.isBad ? "/targets/bad.png" : "/targets/good.png"}
              alt={t.isBad ? "bad target" : "good target"}
              width={40}
              height={40}
              style={{
                position: "absolute",
                left: `${t.x}px`,
                top: `${t.y}px`,
                cursor: "pointer",
                transition: "0.1s",
              }}
              onClick={() => handleClickTarget(t)}
            />
          ))}
        </Box>
      </VStack>
    </Layout>
  );
}
