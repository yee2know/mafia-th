"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import Link from "next/link";
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  Flex,
  Button,
  Image,
} from "@chakra-ui/react";
import Layout from "../components/Layout";

export default function RankingPage() {
  const router = useRouter();
  const [rankings, setRankings] = useState<
    Array<{ name: string; score: number; level: number; avatar: string }>
  >([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/");
      } else {
        loadRankings();
      }
    });

    return () => unsubscribe();
  }, [router]);

  const loadRankings = async () => {
    try {
      const scoresRef = collection(db, "users");
      const q = query(scoresRef, orderBy("score", "desc"), limit(10));
      const querySnapshot = await getDocs(q);

      const rankingsData = querySnapshot.docs.map((doc) => ({
        name: doc.data().userName,
        score: doc.data().score,
        level: doc.data().level,
        avatar: doc.data().avatar,
      }));

      setRankings(rankingsData);
    } catch (error) {
      console.error("Error loading rankings:", error);
    }
  };

  return (
    <Layout>
      <Container maxW="container.md" py={8}>
        <VStack spacing={6} align="stretch">
          <Flex justify="space-between" align="center">
            <Heading size="lg">랭킹</Heading>
            <Button
              as={Link}
              href="/"
              colorScheme="blue"
              variant="ghost"
              size="sm"
            >
              게임으로 돌아가기
            </Button>
          </Flex>

          <VStack spacing={3} align="stretch">
            {rankings.length > 0 ? (
              rankings.map((rank, index) => (
                <Box
                  key={index}
                  p={4}
                  bg="white"
                  borderRadius="lg"
                  boxShadow="sm"
                >
                  <Flex justify="space-between" align="center">
                    <HStack spacing={4}>
                      <Badge
                        colorScheme="blue"
                        fontSize="lg"
                        px={3}
                        py={1}
                        borderRadius="full"
                      >
                        {index + 1}
                      </Badge>
                      <Image
                        src={`/avatars/${rank.avatar || "default"}.png`}
                        alt="avatar"
                        boxSize="32px"
                        borderRadius="full"
                      />
                      <Text fontWeight="medium">{rank.name}</Text>
                    </HStack>
                    <HStack spacing={4}>
                      <Badge colorScheme="green">Lv.{rank.level}</Badge>
                      <Text color="blue.500" fontWeight="bold">
                        {rank.score}점
                      </Text>
                    </HStack>
                  </Flex>
                </Box>
              ))
            ) : (
              <Text textAlign="center" color="gray.500" py={4}>
                랭킹 데이터가 없습니다
              </Text>
            )}
          </VStack>
        </VStack>
      </Container>
    </Layout>
  );
}
