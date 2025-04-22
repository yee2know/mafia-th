"use client";

import { useRouter } from "next/navigation";
import { Button } from "@chakra-ui/react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";
import { checkAndUnlockAvatars } from "../avatar/unlock"; // 필요시 경로 확인
import type { UserData } from "@/constants/interface";
import { useToast } from "@chakra-ui/react";

export default function RefreshActionButton() {
  const router = useRouter();
  const toast = useToast();
  return (
    <Button
      colorScheme="teal"
      onClick={async () => {
        const user = auth.currentUser;
        if (!user) return;

        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) return;

        const userData = snap.data() as UserData;
        await checkAndUnlockAvatars(user.uid, userData, toast);

        // ✅ Next.js 전용 새로고침
        router.refresh();
      }}
    >
      클릭해서 아바타 새로고침
    </Button>
  );
}
