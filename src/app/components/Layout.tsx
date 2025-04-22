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
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
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

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  if (!user && pathname !== "/login") {
    return null;
  }

  if (pathname === "/login") {
    return (
      <Box minH="100vh" bg="#f5f6f8">
        {children}
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="#f5f6f8" overflowX="hidden" overflowY="auto">
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
                    M
                  </Text>
                </Box>
                <Heading size="md" color="gray.900">
                  마피아 태형
                </Heading>
              </Flex>
            </Link>

            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Options"
                icon={<HamburgerIcon />}
                variant="outline"
              />
              <MenuList>
                <MenuItem as={Link} href="/">
                  🏠 홈
                </MenuItem>
                <MenuItem as={Link} href="/ranking">
                  🏆 랭킹
                </MenuItem>
                <MenuItem as={Link} href="/profile">
                  👤 프로필
                </MenuItem>
                <MenuItem as={Link} href="/avatar">
                  👕 아바타
                </MenuItem>
                <MenuItem onClick={handleSignOut}>🔓 로그아웃</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Container>
      </Box>

      <Box as="main" pt="80px" pb={8} overflowX="hidden">
        <Container maxW="container.xl">{children}</Container>
      </Box>
    </Box>
  );
}
