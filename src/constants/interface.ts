export interface UserData {
  level: number;
  scores: GameScores;
  avatar?: string; // ✅ 이 줄 추가
  unlockedAvatars?: string[];
  score: number;
  userName: string;
  bio: string;
}
export interface GameScores {
  clicker: number;
  reactionTime: number;
  killjennet: number;
  taehyung_enhance: number;
  brick: number;
  timing: number;
  // 추가 미니게임 점수들...
}
