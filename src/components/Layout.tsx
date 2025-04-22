import React from "react";
import {
  Box,
  Container,
  Flex,
  Button,
  Text,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const path = usePathname();
  const { user, loading } = useAuth();

  if (loading)
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  if (!user && path !== "/login") {
    router.push("/login");
    return null;
  }

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Navbar */}
      <Flex
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
                <Text fontSize="xl" fontWeight="bold">
                  게임 월드
                </Text>
              </Flex>
            </Link>
            <Flex align="center" gap={3}>
              <Link href="/ranking">
                <Button size="sm" variant="ghost">
                  랭킹
                </Button>
              </Link>
              <Link href="/profile/edit-username">
                <Button size="sm" variant="ghost">
                  닉네임 변경
                </Button>
              </Link>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  import("@/firebase").then(({ auth }) => auth.signOut());
                  router.push("/login");
                }}
              >
                로그아웃
              </Button>
            </Flex>
          </Flex>
        </Container>
      </Flex>
      <Box pt="80px">
        <Container maxW="container.xl">{children}</Container>
      </Box>
    </Box>
  );
};

export default Layout;
