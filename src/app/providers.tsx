"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { CacheProvider } from "@chakra-ui/next-js";

const theme = {
  styles: {
    global: {
      body: {
        bg: "gray.100",
      },
    },
  },
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider>
      <ChakraProvider>{children}</ChakraProvider>
    </CacheProvider>
  );
}
