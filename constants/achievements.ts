// constants/achievements.ts
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: {
    type: "daily_steps" | "streak" | "total_steps";
    value: number;
  };
  reward: {
    pomes: number;
  };
  tier: "bronze" | "silver" | "gold" | "platinum";
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "beginner",
    title: "Beginner",
    description: "Log your first steps",
    icon: "../assets/no_image/png",
    requirement: { type: "daily_steps", value: 1 },
    reward: { pomes: 500 },
    tier: "bronze"
  },
  {
    id: "walker",
    title: "Walker",
    description: "Walk 10,000 steps in a single day",
    icon: "../assets/no_image/png",
    requirement: { type: "daily_steps", value: 10000 },
    reward: { pomes: 500 },
    tier: "silver"
  },
  {
    id: "trekker",
    title: "Trekker",
    description: "Walk 50,000 total steps",
    icon: "../assets/no_image/png",
    requirement: { type: "total_steps", value: 50000 },
    reward: { pomes: 1000 },
    tier: "gold"
  },
  {
    id: "week_warrior",
    title: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "../assets/no_image/png",
    requirement: { type: "streak", value: 7 },
    reward: { pomes: 2000 },
    tier: "platinum"
  }
];
