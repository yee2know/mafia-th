// src/app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Box,
  VStack,
  Text,
  Heading,
  Image,
  Input,
  Button,
} from "@chakra-ui/react";
import { auth, db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Layout from "../components/Layout";

export default function ProfilePage() {
  const [userName, setUserName] = useState("");
  const [avatar, setAvatar] = useState("/avatars/default.png");
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [scores, setScores] = useState<any>({});
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;
      const data = snap.data();
      setUserName(data.userName);
      setAvatar(`/avatars/${data.avatar || "default"}.png`);
      setLevel(data.level || 1);
      setScore(data.score || 0);
      setScores(data.scores || {});
      setBio(data.bio || "");
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleSaveBio = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    await updateDoc(ref, { bio });
  };

  if (loading) return <Text>불러오는 중...</Text>;

  return (
    <Layout>
      <VStack spacing={6} mt={10} textAlign="center">
        <Heading>내 프로필</Heading>
        <Image src={avatar} alt="아바타" boxSize="120px" rounded="full" />
        <Text fontSize="2xl" fontWeight="bold">
          {userName}
        </Text>
        <Text>레벨: {level}</Text>
        <Text>총 점수: {score}</Text>

        <Box>
          <Heading size="md" mb={2}>
            게임별 점수
          </Heading>
          {Object.entries(scores).map(([key, value]) => (
            <Text key={key}>
              {key} : {String(value)}
              {key === "reactionTime" ? "ms" : "점"}
            </Text>
          ))}
        </Box>

        <Box w="100%" maxW="md">
          <Heading size="md" mb={2}>
            자기소개
          </Heading>
          <Input
            placeholder="자기소개를 입력하세요"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <Button mt={2} onClick={handleSaveBio} colorScheme="blue">
            저장
          </Button>
        </Box>
      </VStack>
    </Layout>
  );
}
