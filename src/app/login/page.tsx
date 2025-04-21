"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Container,
} from "@chakra-ui/react";
import { auth } from "@/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import Layout from "../components/Layout";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({
          title: "회원가입 성공!",
          status: "success",
          duration: 3000,
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: "로그인 성공!",
          status: "success",
          duration: 3000,
        });
      }
      router.push("/");
    } catch (error: any) {
      toast({
        title: "오류 발생",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  return (
    <Layout>
      <Container maxW="container.sm" py={8}>
        <Box bg="white" p={8} rounded="lg" shadow="lg" w="full">
          <VStack spacing={6}>
            <Heading>{isSignUp ? "회원가입" : "로그인"}</Heading>
            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>이메일</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>비밀번호</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </FormControl>
                <Button type="submit" colorScheme="blue" w="full">
                  {isSignUp ? "회원가입" : "로그인"}
                </Button>
              </VStack>
            </form>
            <Text>
              {isSignUp ? "이미 계정이 있으신가요?" : "아직 계정이 없으신가요?"}
              <Button
                variant="link"
                colorScheme="blue"
                ml={2}
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? "로그인" : "회원가입"}
              </Button>
            </Text>
          </VStack>
        </Box>
      </Container>
    </Layout>
  );
}
