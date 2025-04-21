import type { Metadata } from "next";
import { Providers } from "./providers";
import Layout from "./components/Layout";
import { AuthProvider } from "./contexts/AuthContext";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "김태형 키우기",
  description: "미니게임으로 레벨을 올리고 캐릭터를 수집하세요!",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <AuthProvider>
            <Layout>{children}</Layout>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
