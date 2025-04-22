// 수정된 타이밍 게임 코드 + Firebase 점수 저장 추가
"use client";

import { useRef, useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { Box, Button, Center, Heading, Text } from "@chakra-ui/react";
import { auth, db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { checkAndUnlockAvatars } from "@/app/avatar/unlock";
import { UserData } from "@/constants/interface";

export default function TimingGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [angle, setAngle] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [message, setMessage] = useState("");
  const [speed, setSpeed] = useState(2);
  const [targetAngle, setTargetAngle] = useState(
    Math.floor(Math.random() * 360)
  );

  const radius = 100;
  const tolerancePerfect = 10;
  const toleranceGood = 25;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas?.getContext("2d")!;
    if (!canvas || !ctx) return;

    const pointerImage = new Image();
    pointerImage.src = "/pointer.png";

    canvas.width = 300;
    canvas.height = 300;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw base circle
      ctx.beginPath();
      ctx.arc(150, 150, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "#ccc";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.closePath();

      // Perfect zone (중앙)
      const startPerfect = ((targetAngle - tolerancePerfect) * Math.PI) / 180;
      const endPerfect = ((targetAngle + tolerancePerfect) * Math.PI) / 180;
      ctx.beginPath();
      ctx.strokeStyle = "gold";
      ctx.lineWidth = 10;
      ctx.arc(150, 150, radius, startPerfect, endPerfect);
      ctx.stroke();
      ctx.closePath();

      // Good zone (바깥)
      const startGood = ((targetAngle - toleranceGood) * Math.PI) / 180;
      const endGood = ((targetAngle + toleranceGood) * Math.PI) / 180;
      ctx.beginPath();
      ctx.strokeStyle = "#38a169";
      ctx.lineWidth = 5;
      ctx.arc(150, 150, radius, startGood, endGood);
      ctx.stroke();
      ctx.closePath();

      // Draw rotating pointer image
      const rad = (angle * Math.PI) / 180;
      const x = 150 + radius * Math.cos(rad);
      const y = 150 + radius * Math.sin(rad);
      const pointerSize = 20;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rad);
      ctx.drawImage(
        pointerImage,
        -pointerSize / 2,
        -pointerSize / 2,
        pointerSize,
        pointerSize
      );
      ctx.restore();
    }

    let animationFrameId: number;
    const update = () => {
      setAngle((prev) => (prev + speed) % 360);
      draw();
      animationFrameId = requestAnimationFrame(update);
    };

    if (isRunning) {
      animationFrameId = requestAnimationFrame(update);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [angle, isRunning, speed, targetAngle]);

  async function saveScore(score: number) {
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    const prev = snap.data()?.scores?.timing ?? 0;

    if (score > prev) {
      const totalscore =
        score +
        (1000 - snap.data()?.scores?.reactionTime || 0) +
        (snap.data()?.scores?.clicker || 0) +
        (snap.data()?.scores?.killjennet || 0) +
        (snap.data()?.scores?.brick || 0) +
        (snap.data()?.scores?.taehyung_enhance || 0);
      await updateDoc(ref, {
        "scores.timing": score,
        level: Math.floor(totalscore / 100) + 1,
        score: totalscore,
      });
      if (auth.currentUser) {
        const userData = snap.data(); // Retrieve user data from the Firestore snapshot
        await checkAndUnlockAvatars(auth.currentUser.uid, userData as UserData);
      }
    }
  }

  const handleClick = () => {
    const diff = Math.abs(angle - targetAngle);
    const adjustedDiff = Math.min(diff, 360 - diff);

    if (adjustedDiff <= tolerancePerfect) {
      setScore((prev) => prev + 100);
      setCombo((prev) => prev + 1);
      setSpeed((prev) => prev + 0.3);
      setMessage("🎯 Perfect!");
    } else if (adjustedDiff <= toleranceGood) {
      setScore((prev) => prev + 50);
      setCombo((prev) => prev + 1);
      setSpeed((prev) => prev + 0.2);
      setMessage("✅ Good!");
    } else {
      setCombo(0);
      setLives((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          setIsRunning(false);
          setMessage("💥 Game Over!");
          saveScore(score);
        } else {
          setMessage("❌ Miss!");
        }
        return next;
      });
    }

    setTargetAngle(Math.floor(Math.random() * 360));
  };

  const handleRestart = () => {
    saveScore(score);
    setScore(0);
    setAngle(0);
    setSpeed(2);
    setCombo(0);
    setLives(3);
    setIsRunning(true);
    setMessage("");
    setTargetAngle(Math.floor(Math.random() * 360));
  };

  return (
    <Layout>
      <Center flexDir="column" gap={4} py={10}>
        <Heading size="lg">타이밍 게임</Heading>
        <canvas ref={canvasRef} style={{ border: "1px solid #ccc" }} />
        <Text fontSize="xl">점수: {score}</Text>
        <Text fontSize="md">콤보: {combo}</Text>
        <Text fontSize="md">목숨: {"❤️".repeat(lives)}</Text>
        <Button
          colorScheme="blue"
          size="lg"
          onClick={handleClick}
          disabled={!isRunning}
        >
          클릭!
        </Button>
        {message && <Text fontSize="xl">{message}</Text>}
        {!isRunning && (
          <Button mt={4} onClick={handleRestart} colorScheme="green">
            다시 시작
          </Button>
        )}
      </Center>
    </Layout>
  );
}
