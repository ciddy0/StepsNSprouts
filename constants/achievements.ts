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
    id: "walker-10k",
    title: "Walker",
    description: "Walk 10,000 steps in a single day",
    icon: "../assets/no_image/png",
    requirement: { type: "daily_steps", value: 10000 },
    reward: { pomes: 500 },
    tier: "bronze"
  },
  {
    id: "streak-7",
    title: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "../assets/no_image/png",
    requirement: { type: "streak", value: 7 },
    reward: { pomes: 1000 },
    tier: "silver"
  },
  {
    id: "streak-30",
    title: "Monthly Master",
    description: "Maintain a 30-day streak",
    icon: "../assets/no_image/png",
    requirement: { type: "streak", value: 30 },
    reward: { pomes: 5000 },
    tier: "gold"
  },
  {
    id: "total-100k",
    title: "Century Walker",
    description: "Walk 100,000 total steps",
    icon: "../assets/no_image/png",
    requirement: { type: "total_steps", value: 100000 },
    reward: { pomes: 2000 },
    tier: "gold"
  }
]