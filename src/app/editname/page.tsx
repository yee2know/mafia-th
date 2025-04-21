"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function EditUsernamePage() {
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchUserName = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserName(data.userName || "");
      }
    };

    fetchUserName();
  }, [router]);

  const handleSubmit = async () => {
    if (!userName.trim()) {
      toast({
        title: "닉네임을 입력해주세요.",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("로그인 정보 없음");

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        userName,
      });

      toast({
        title: "닉네임이 변경되었습니다!",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      router.push("/"); // 변경 후 홈으로 이동 (원하면 다른 곳으로)
    } catch (error) {
      toast({
        title: "변경 실패",
        description: String(error),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="md" py={10}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">닉네임 변경</Heading>
        <Input
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="새 닉네임을 입력하세요"
        />
        <Button onClick={handleSubmit} colorScheme="blue" isLoading={loading}>
          저장
        </Button>
      </VStack>
    </Container>
  );
}
