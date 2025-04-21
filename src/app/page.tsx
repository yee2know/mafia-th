"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Heading,
  Text,
  Button,
  Flex,
  Badge,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Layout from "./components/Layout";
import Link from "next/link";

interface GameScores {
  clicker: number;
  reactionTime: number;
  // 추가 미니게임 점수들...
}

interface UserData {
  level: number;
  scores: GameScores;
  avatar?: string; // ✅ 이 줄 추가
  unlockedAvatars?: string[];
}

export default function HomePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        // 새 사용자 초기화
        const initialData: UserData = {
          level: 1,
          scores: {
            clicker: 0,
            reactionTime: 0,
          },
          avatar: "default", // 장착한 아바타 ID
          unlockedAvatars: ["default"],
        };
        await setDoc(doc(db, "users", user.uid), initialData);
        setUserData(initialData);
      } else {
        setUserData(userDoc.data() as UserData);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const calculateLevel = (scores: GameScores) => {
    return Math.floor((scores.clicker + scores.reactionTime) / 100) + 1;
  };

  const games = [
    {
      id: "clicker",
      name: "클리커 게임",
      description: "빠르게 클릭하여 점수를 얻으세요!",
      path: "/games/clicker",
    },
    {
      id: "reactionTime",
      name: "반응속도 게임",
      description: "신호가 바뀔 때 빠르게 반응하세요!",
      path: "/games/reaction",
    },
    // 추가 미니게임들...
  ];

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (!userData) {
    return null;
  }

  return (
    <Layout>
      <Box>
        <Flex direction="column" gap={6}>
          <Box
            bg="white"
            p={6}
            rounded="2xl"
            border="1px solid"
            borderColor="gray.100"
          >
            <Flex justify="space-between" align="center" mb={4}>
              <Flex direction="column" gap={1}>
                <Text fontSize="sm" color="gray.500">
                  현재 레벨
                </Text>
                <Flex align="center" gap={2}>
                  <Heading size="lg">{userData.level}</Heading>
                  <Badge colorScheme="blue" fontSize="sm">
                    Lv.{userData.level}
                  </Badge>
                </Flex>
              </Flex>
              <Box bg="gray.50" p={3} rounded="xl" textAlign="center">
                <Text fontSize="sm" color="gray.500">
                  다음 레벨까지
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="blue.500">
                  {calculateLevel(userData.scores) * 100 -
                    (userData.scores.clicker + userData.scores.reactionTime)}
                  점
                </Text>
              </Box>
            </Flex>
          </Box>

          <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6}>
            {games.map((game) => (
              <Box
                key={game.id}
                bg="white"
                p={6}
                rounded="2xl"
                border="1px solid"
                borderColor="gray.100"
                _hover={{
                  transform: "translateY(-2px)",
                  transition: "all 0.2s",
                }}
              >
                <Flex direction="column" gap={4}>
                  <Flex justify="space-between" align="center">
                    <Heading size="md">{game.name}</Heading>
                    <Badge colorScheme="green" fontSize="sm">
                      <Text fontSize="sm" color="gray.600">
                        {(() => {
                          const rawScore =
                            userData.scores[game.id as keyof GameScores] ?? 0;
                          const displayScore =
                            game.id === "reactionTime"
                              ? 1000 - rawScore
                              : rawScore;

                          return `최고 ${displayScore}점`;
                        })()}
                      </Text>
                    </Badge>
                  </Flex>
                  <Text color="gray.600">{game.description}</Text>
                  <Button
                    colorScheme="blue"
                    size="lg"
                    onClick={() => router.push(game.path)}
                    _hover={{ bg: "blue.600" }}
                  >
                    게임 시작
                  </Button>
                </Flex>
              </Box>
            ))}
          </Grid>
        </Flex>
      </Box>

      <Box mt={8} className="flex flex-col items-center space-y-4">
        <button
          onClick={handleLogout}
          className="px-6 py-3 text-lg font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
        >
          로그아웃
        </button>
      </Box>
    </Layout>
  );
}
