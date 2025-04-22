"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Box, Button, Text, VStack, useToast, Heading } from "@chakra-ui/react";
import { auth, db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Layout from "../../components/Layout";
import { checkAndUnlockAvatars } from "@/app/avatar/unlock";
import { UserData } from "@/constants/interface";

export default function TaehyungEnhanceGame() {
  const [level, setLevel] = useState(1);
  const [destroyed, setDestroyed] = useState(false);
  const [resultText, setResultText] = useState("");
  const toast = useToast();

  const calculateScore = (lv: number): number => {
    if (lv === 100) return 3000;
    if (lv >= 80) return lv * 20;
    if (lv >= 60) return lv * 17;
    if (lv >= 40) return lv * 12;
    if (lv >= 20) return lv * 7;
    return lv * 5;
  };

  const saveScore = async (score: number) => {
    const user = auth.currentUser;
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    const prev = snap.data()?.scores?.taehyung_enhance ?? 0;
    const newScore = Math.max(score, prev);
    const totalscore =
      newScore +
      (1000 - snap.data()?.scores?.reactionTime || 0) +
      (snap.data()?.scores?.clicker || 0) +
      (snap.data()?.scores?.killjennet || 0) +
      (snap.data()?.scores?.brick || 0);
    await updateDoc(userRef, {
      "scores.taehyung_enhance": newScore,
      level: Math.floor(totalscore / 100) + 1,
      score: totalscore,
    });
    await checkAndUnlockAvatars(user.uid, snap.data() as UserData);
  };

  const handleEnhance = () => {
    if (level >= 100 || destroyed) return;

    const roll = Math.random();

    if (roll < 0.8) {
      setLevel((lv) => lv + 1);
      setResultText(`${level + 1}레벨 강화 성공!`);
    } else if (roll < 0.985) {
      const down = level > 1 ? level - 1 : 1;
      setLevel(down);
      setResultText("강화 실패! 레벨이 감소했습니다.");
    } else {
      setDestroyed(true);
      setLevel(0);
      setResultText("장비 파괴!! 다시 시작하세요.");
      const score = calculateScore(level);
      saveScore(score);
    }

    if (level + 1 === 100) {
      const score = calculateScore(100);
      saveScore(score);
    }
  };

  return (
    <Layout>
      <VStack spacing={6} mt={10} textAlign="center">
        <Heading>김태형 강화하기</Heading>
        <Image
          src={`/taehyung/lv${Math.floor(level / 20) * 20 || 1}.png`}
          alt="강화된 김태형"
          width={200}
          height={200}
        />
        <Text fontSize="xl" color={destroyed ? "red.500" : "black"}>
          {destroyed ? "💥 파괴됨 💥" : `${level} 레벨`}
        </Text>
        <Text fontSize="lg" fontWeight="semibold" color="blue.500">
          {resultText}
        </Text>
        <Button
          onClick={handleEnhance}
          colorScheme={destroyed ? "red" : "blue"}
          isDisabled={level >= 100}
        >
          {level >= 100 ? "강화 완료" : "강화하기"}
        </Button>
      </VStack>
    </Layout>
  );
}
