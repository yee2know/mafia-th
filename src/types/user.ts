export type GameScores = {
  clicker?: number;
  reactionTime?: number;
  reflex?: number;
  math?: number;
};

export type UserData = {
  userName: string;
  level: number;
  score?: number;
  scores?: GameScores;
  avatar?: string;
  unlockedAvatars?: string[];
};
