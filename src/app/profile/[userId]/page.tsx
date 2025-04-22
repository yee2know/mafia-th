// src/app/profile/[userId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Box, VStack, Text, Heading, Image, Spinner } from "@chakra-ui/react";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import Layout from "../../components/Layout";

export default function PublicProfilePage() {
  const { userId } = useParams();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      const ref = doc(db, "users", String(userId));
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        setLoading(false);
        return;
      }
      setUserData(snap.data());
      setLoading(false);
    };
    fetchUser();
  }, [userId]);

  //if (loading) return <Spinner size="xl" mt={20} />;
  if (!userData)
    return (
      <Text textAlign="center" mt={10}>
        유저 정보를 찾을 수 없습니다.
      </Text>
    );

  return (
    <Layout>
      <VStack spacing={6} mt={10} textAlign="center">
        <Heading>{userData?.userName ?? "알 수 없음"}님의 프로필</Heading>
        <Image
          src={`/avatars/${userData?.avatar || "default"}.png`}
          alt="아바타"
          boxSize="120px"
          rounded="full"
        />
        <Text>레벨: {userData?.level ?? 0}</Text>
        <Text>총 점수: {userData?.score ?? 0}</Text>

        <Box>
          <Heading size="md" mb={2}>
            게임별 점수
          </Heading>
          {Object.entries(userData?.scores || {}).map(([key, value]) => (
            <Text key={key}>
              {key === "taehyung_enhance"
                ? "김태형 강화하기"
                : key === "reactionTime"
                ? "반응속도"
                : key === "clicker"
                ? "클리커"
                : key === "killjennet"
                ? "김태형 죽이기"
                : key === "brick"
                ? "태형깨기"
                : key}{" "}
              : {String(value)}
              {key === "reactionTime" ? "ms" : "점"}
            </Text>
          ))}
        </Box>

        {userData?.bio && (
          <Box w="100%" maxW="md">
            <Heading size="md" mb={2}>
              자기소개
            </Heading>
            <Text whiteSpace="pre-wrap">{userData.bio}</Text>
          </Box>
        )}
      </VStack>
    </Layout>
  );
}
