import { auth, db } from "@/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";

export const updateScores = async () => {
  const user = auth.currentUser;
  if (!user) {
    console.warn("로그인한 유저가 없습니다.");
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    console.warn("유저 문서가 존재하지 않습니다.");
    return;
  }

  const data = userSnap.data();
  const { clicker = 0, reactionTime = 0 } = data.scores || {};
  const newScore = clicker + (1000 - reactionTime);

  await updateDoc(userRef, {
    score: newScore,
  });

  console.log(`✅ ${user.uid} 점수 업데이트 완료: ${newScore}`);
};
