// src/app/games/brick/page.tsx
"use client";

import { useRef, useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { auth, db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { checkAndUnlockAvatars } from "@/app/avatar/unlock";
import { UserData } from "@/constants/interface";

export default function BrickBreakerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [restartTrigger, setRestartTrigger] = useState(0);

  const hitSoundRef = useRef<HTMLAudioElement | null>(null);

  const handleRestart = () => {
    setScore(0);
    scoreRef.current = 0;
    setIsGameOver(false);
    setRestartTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const brickImage = new Image();
    brickImage.src = "/brick.png";

    const margin = 20;
    const canvasWidth = Math.min(window.innerWidth - margin * 2, 480);
    canvas.width = canvasWidth;
    canvas.height = window.innerHeight * 0.6;

    const paddleWidth = 80;
    const paddleHeight = 10;
    const paddleY = canvas.height - paddleHeight - 10;
    let paddleX = (canvas.width - paddleWidth) / 2;

    const ballRadius = 7;
    let x = canvas.width / 2;
    let y = canvas.height - 40;
    let dx = 3;
    let dy = -3;
    let speed = 4;

    const brickWidth = 60;
    const brickHeight = 15;
    const brickPadding = 10;
    const brickOffsetLeft = 10;
    const initialBrickTop = 30;

    let bricks: any[] = [];

    function generateBricks(offsetTop = initialBrickTop) {
      const cols = Math.floor(canvas.width / (brickWidth + brickPadding));
      const count = Math.floor(Math.random() * cols) + 1;
      const selected = Array.from({ length: cols }, (_, i) => i);
      for (let i = 0; i < count; i++) {
        const c = selected.splice(
          Math.floor(Math.random() * selected.length),
          1
        )[0];
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = offsetTop;
        bricks.push({ x: brickX, y: brickY, status: 1 });
      }
    }

    function moveBricksDown() {
      for (let b of bricks) {
        b.y += brickHeight + brickPadding;
        if (b.y + brickHeight >= paddleY) {
          setIsGameOver(true);
          saveScore(scoreRef.current);
        }
      }
    }

    function drawBricks() {
      for (const brick of bricks) {
        if (brick.status === 1) {
          ctx.drawImage(brickImage, brick.x, brick.y, brickWidth, brickHeight);
        }
      }
    }

    function drawBall() {
      ctx.beginPath();
      ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = "red";
      ctx.fill();
      ctx.closePath();
    }

    function drawPaddle() {
      ctx.beginPath();
      ctx.rect(paddleX, paddleY, paddleWidth, paddleHeight);
      ctx.fillStyle = "black";
      ctx.fill();
      ctx.closePath();
    }

    function drawScore() {
      ctx.font = "16px Arial";
      ctx.fillStyle = "black";
      ctx.fillText(`Score: ${scoreRef.current}`, 8, 20);
    }

    function collisionDetection() {
      for (const b of bricks) {
        if (b.status === 1) {
          if (
            x > b.x &&
            x < b.x + brickWidth &&
            y > b.y &&
            y < b.y + brickHeight
          ) {
            dy = -dy;
            b.status = 0;
            scoreRef.current += 30;
            setScore(scoreRef.current);
            speed += 0.1;

            // ✅ 중복 사운드 재생
            const audio = new Audio("/hit.mp3");
            audio.play();
          }
        }
      }
    }

    async function saveScore(score: number) {
      const user = auth.currentUser;
      if (!user) return;
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      const prev = snap.data()?.scores?.brick ?? 0;
      if (score > prev) {
        const totalscore =
          score +
          (1000 - snap.data()?.scores?.reactionTime || 0) +
          (snap.data()?.scores?.clicker || 0) +
          (snap.data()?.scores?.killjennet || 0) +
          (snap.data()?.scores?.taehyung_enhance || 0);
        await updateDoc(ref, {
          "scores.brick": score,
          level: Math.floor(totalscore / 100) + 1,
          score: totalscore,
        });
        if (auth.currentUser) {
          const userData = snap.data(); // Retrieve user data from the Firestore snapshot
          await checkAndUnlockAvatars(
            auth.currentUser.uid,
            userData as UserData
          );
        }
      }
    }

    let bounceCount = 0;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBricks();
      drawBall();
      drawPaddle();
      drawScore();
      collisionDetection();

      if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
      if (y + dy < ballRadius) dy = -dy;
      else if (y + dy > canvas.height - ballRadius) {
        if (
          x > paddleX &&
          x < paddleX + paddleWidth &&
          y + dy >= paddleY - ballRadius
        ) {
          const relativeX = x - (paddleX + paddleWidth / 2);
          const norm = relativeX / (paddleWidth / 2);
          dx = norm * speed;
          dy = -Math.abs(Math.sqrt(speed ** 2 - dx ** 2));

          bounceCount++;
          if (bounceCount % 2 === 0) {
            moveBricksDown();
            generateBricks();
          }
        } else {
          setIsGameOver(true);
          saveScore(scoreRef.current);
          return;
        }
      }

      x += dx;
      y += dy;

      requestAnimationFrame(draw);
    }

    brickImage.onload = () => {
      bricks = [];
      generateBricks();
      draw();
    };

    const handleMove = (e: TouchEvent | MouseEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      paddleX = clientX - paddleWidth / 2;
      if (paddleX < 0) paddleX = 0;
      if (paddleX + paddleWidth > canvas.width)
        paddleX = canvas.width - paddleWidth;
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("touchmove", handleMove);

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("touchmove", handleMove);
    };
  }, [restartTrigger]);

  return (
    <Layout>
      <div style={{ textAlign: "center" }}>
        <h1>태형깨기 게임</h1>
        {isGameOver && (
          <div>
            <h2>게임 오버! 점수: {score}</h2>
            <button
              onClick={handleRestart}
              style={{ marginTop: 10, padding: "8px 16px" }}
            >
              다시 시작
            </button>
          </div>
        )}
        <canvas
          ref={canvasRef}
          style={{
            background: "#eee",
            border: "1px solid #999",
            maxWidth: "100%",
          }}
        ></canvas>
        <audio ref={hitSoundRef} src="/hit.mp3" preload="auto" />
      </div>
    </Layout>
  );
}
