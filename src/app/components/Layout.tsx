"use client";

import { ReactNode, useEffect } from "react";
import {
  Box,
  Container,
  Flex,
  Heading,
  Button,
  Text,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user && pathname !== "/login") {
      router.push("/login");
    }
  }, [user, loading, router, pathname]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // 로딩 중일 때 스피너 표시
  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  // 로그인하지 않은 경우 (로그인 페이지 제외)
  if (!user && pathname !== "/login") {
    return null;
  }

  // 로그인 페이지인 경우 네비게이션 바 없이 컨텐츠만 표시
  if (pathname === "/login") {
    return (
      <Box minH="100vh" bg="#f5f6f8">
        {children}
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="#f5f6f8">
      <Box
        as="nav"
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={100}
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.100"
      >
        <Container maxW="container.xl">
          <Flex h="64px" align="center" justify="space-between">
            <Link href="/">
              <Flex align="center" gap={2}>
                <Box
                  w="32px"
                  h="32px"
                  bg="#0052FF"
                  rounded="lg"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text color="white" fontWeight="bold">
                    R
                  </Text>
                </Box>
                <Heading size="md" color="gray.900">
                  마피아 태형
                </Heading>
              </Flex>
            </Link>

            <Flex align="center" gap={3}>
              <Link href="/ranking">
                <Button
                  size="sm"
                  variant="ghost"
                  color="gray.600"
                  _hover={{ bg: "gray.50" }}
                  leftIcon={
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  }
                >
                  랭킹
                </Button>
              </Link>

              <Link href="/editname">
                <Button
                  size="sm"
                  variant="ghost"
                  color="gray.600"
                  _hover={{ bg: "gray.50" }}
                >
                  닉네임 변경
                </Button>
              </Link>

              <Link href="/avatar">
                <Button
                  size="sm"
                  variant="ghost"
                  color="gray.600"
                  _hover={{ bg: "gray.50" }}
                >
                  아바타
                </Button>
              </Link>

              <Button
                size="sm"
                variant="ghost"
                color="gray.600"
                _hover={{ bg: "gray.50" }}
                onClick={handleSignOut}
              >
                로그아웃
              </Button>
            </Flex>
          </Flex>
        </Container>
      </Box>

      <Box as="main" pt="80px" pb={8}>
        <Container maxW="container.xl">{children}</Container>
      </Box>
    </Box>
  );
}
