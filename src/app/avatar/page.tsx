"use client";
import { Tooltip } from "@chakra-ui/react";
import {
  Box,
  Button,
  Grid,
  Image,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState, useCallback } from "react";
import { auth, db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { avatarList } from "./avatar"; // 위에서 정의한 리스트
import { checkAndUnlockAvatars } from "./unlock";
import { UserData } from "@/constants/interface";
import RefreshActionButton from "../components/refresh"; // 새로고침 버튼 컴포넌트

export default function AvatarPage() {
  const toast = useToast();
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [level, setLevel] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;

      const data = snap.data();
      setSelectedAvatar(data.avatar || "");
      setUnlocked(data.unlockedAvatars || []);
      setLevel(data.level || 0);
    };

    fetchData();
  }, []);

  const handleSelect = async (avatarId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "users", user.uid);
    await updateDoc(ref, { avatar: avatarId });

    setSelectedAvatar(avatarId);
    toast({
      title: "아바타 변경 완료",
      status: "success",
      duration: 2000,
    });
  };

  return (
    <VStack spacing={6} py={8}>
      <Text fontSize="2xl" fontWeight="bold">
        아바타 선택
      </Text>
      <RefreshActionButton />
      <Grid
        templateColumns="repeat(auto-fit, minmax(120px, 1fr))"
        gap={4}
        w="100%"
        maxW="lg"
      >
        {avatarList.map((avatar) => {
          const isUnlocked =
            unlocked.includes(avatar.id) || level >= avatar.unlockLevel;

          const can = isUnlocked;

          return (
            <Tooltip
              label={avatar.conditionText}
              isDisabled={can}
              key={avatar.id}
            >
              <Box
                p={3}
                borderWidth={2}
                borderColor={
                  selectedAvatar === avatar.id ? "blue.400" : "gray.200"
                }
                rounded="lg"
                textAlign="center"
                filter={can ? "none" : "grayscale(100%)"}
                cursor={can ? "pointer" : "not-allowed"}
              >
                <Image
                  src={avatar.imageUrl}
                  alt={avatar.name}
                  w="80px"
                  h="80px"
                  mx="auto"
                />
                <Text mt={2}>{avatar.name}</Text>
                {can ? (
                  <Button
                    size="sm"
                    mt={2}
                    onClick={() => handleSelect(avatar.id)}
                  >
                    {selectedAvatar === avatar.id ? "장착됨" : "장착"}
                  </Button>
                ) : (
                  <Text fontSize="xs" color="gray.500" mt={2}>
                    {avatar.conditionText}
                  </Text>
                )}
              </Box>
            </Tooltip>
          );
        })}
      </Grid>
    </VStack>
  );
}
