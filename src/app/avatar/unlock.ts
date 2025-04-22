import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { UserData } from "@/constants/interface";
import { avatarList } from "./avatar";

export const checkAndUnlockAvatars = async (
  uid: string,
  userData: UserData,
  toast?: ReturnType<typeof import("@chakra-ui/react").useToast>
) => {
  const unlocked = new Set(userData.unlockedAvatars ?? []);
  let updated = false;
  const newlyUnlocked: string[] = [];

  for (const avatar of unlockConditions) {
    if (avatar.condition(userData) && !unlocked.has(avatar.id)) {
      unlocked.add(avatar.id);
      updated = true;
      newlyUnlocked.push(avatar.id);
    }
  }

  if (updated) {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      unlockedAvatars: Array.from(unlocked),
    });

    newlyUnlocked.forEach((id) => {
      const avatarName =
        avatarList.find((a) => a.id === id)?.name || "알 수 없음";
      if (toast) {
        toast({
          title: `${avatarName} 아바타 해금! 새로고침하세요!`,
          status: "success",
          duration: 2500,
          isClosable: true,
        });
      }
    });
  }
};

const unlockConditions = [
  {
    id: "girlfriend",
    condition: (user: UserData) => user.level >= 5,
  },
  {
    id: "lv10",
    condition: (user: UserData) => user.level >= 10,
  },
  {
    id: "killjennet",
    condition: (user: UserData) => user.scores?.killjennet >= 1000,
  },
  {
    id: "enhance",
    condition: (user: UserData) => user.scores?.taehyung_enhance >= 2999,
  },
  {
    id: "brick",
    condition: (user: UserData) => user.scores?.brick >= 1000,
  },
  {
    id: "timing",
    condition: (user: UserData) => user.scores?.timing >= 1500,
  },
  {
    id: "clicker",
    condition: (user: UserData) => user.scores?.clicker >= 1100,
  },
  {
    id: "reaction",
    condition: (user: UserData) => user.scores?.reactionTime <= 100,
  },
  {
    id: "lv30",
    condition: (user: UserData) => user.level >= 30,
  },
  {
    id: "gay",
    condition: (user: UserData) => user.level >= 50,
  },
  {
    id: "merong",
    condition: (user: UserData) => user.level >= 100,
  },
  {
    id: "monster",
    condition: (user: UserData) => user.level >= 9999,
  },
  {
    id: "special1",
    condition: (user: UserData) => user.level >= 9999,
  },
  {
    id: "special2",
    condition: (user: UserData) => user.level >= 9999,
  },
];
function toast(arg0: {
  title: string;
  status: string;
  duration: number;
  isClosable: boolean;
}) {
  throw new Error("Function not implemented.");
}
