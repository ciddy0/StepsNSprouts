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

  // Daily steps milestones!!!!!!!!!!!!!!!!!
  {
    id: "walker-2k",
    title: "Warmup Walker",
    description: "Walk 2,000 steps in a single day",
    icon: "../assets/no_image/png",
    requirement: { type: "daily_steps", value: 2000 },
    reward: { pomes: 100 },
    tier: "bronze",
  },
  {
    id: "walker-5k",
    title: "Steady Strider",
    description: "Walk 5,000 steps in a single day",
    icon: "../assets/no_image/png",
    requirement: { type: "daily_steps", value: 5000 },
    reward: { pomes: 250 },
    tier: "bronze",
  },
  {
    id: "walker-10k",
    title: "Walker",
    description: "Walk 10,000 steps in a single day",
    icon: "../assets/no_image/png",
    requirement: { type: "daily_steps", value: 10000 },
    reward: { pomes: 500 },
    tier: "bronze",
  },
  {
    id: "walker-15k",
    title: "Pace Pro",
    description: "Walk 15,000 steps in a single day",
    icon: "../assets/no_image/png",
    requirement: { type: "daily_steps", value: 15000 },
    reward: { pomes: 750 },
    tier: "silver",
  },
  {
    id: "walker-20k",
    title: "Trail Treader",
    description: "Walk 20,000 steps in a single day",
    icon: "../assets/no_image/png",
    requirement: { type: "daily_steps", value: 20000 },
    reward: { pomes: 1200 },
    tier: "silver",
  },
  {
    id: "walker-25k",
    title: "Road Warrior",
    description: "Walk 25,000 steps in a single day",
    icon: "../assets/no_image/png",
    requirement: { type: "daily_steps", value: 25000 },
    reward: { pomes: 2000 },
    tier: "gold",
  },
  {
    id: "walker-30k",
    title: "Marathon March",
    description: "Walk 30,000 steps in a single day",
    icon: "../assets/no_image/png",
    requirement: { type: "daily_steps", value: 30000 },
    reward: { pomes: 3500 },
    tier: "platinum",
  },

  
  // Streaks!!!!!!!!!!!!!!!!!
 
  {
    id: "streak-3",
    title: "Quick Start",
    description: "Maintain a 3-day streak",
    icon: "../assets/no_image/png",
    requirement: { type: "streak", value: 3 },
    reward: { pomes: 300 },
    tier: "bronze",
  },
  {
    id: "streak-7",
    title: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "../assets/no_image/png",
    requirement: { type: "streak", value: 7 },
    reward: { pomes: 1000 },
    tier: "silver",
  },
  {
    id: "streak-14",
    title: "Two-Week Grove",
    description: "Maintain a 14-day streak",
    icon: "../assets/no_image/png",
    requirement: { type: "streak", value: 14 },
    reward: { pomes: 1500 },
    tier: "silver",
  },
  {
    id: "streak-30",
    title: "Monthly Master",
    description: "Maintain a 30-day streak",
    icon: "../assets/no_image/png",
    requirement: { type: "streak", value: 30 },
    reward: { pomes: 5000 },
    tier: "gold",
  },
  {
    id: "streak-60",
    title: "Two-Month Mastery",
    description: "Maintain a 60-day streak",
    icon: "../assets/no_image/png",
    requirement: { type: "streak", value: 60 },
    reward: { pomes: 6000 },
    tier: "gold",
  },
  {
    id: "streak-100",
    title: "Century Streak",
    description: "Maintain a 100-day streak",
    icon: "../assets/no_image/png",
    requirement: { type: "streak", value: 100 },
    reward: { pomes: 12000 },
    tier: "platinum",
  },

  
  // Total steps milestones!!!!!!!!!!!!!!!!!
  
  {
    id: "total-5k",
    title: "First Five",
    description: "Walk 5,000 total steps",
    icon: "../assets/no_image/png",
    requirement: { type: "total_steps", value: 5000 },
    reward: { pomes: 100 },
    tier: "bronze",
  },
  {
    id: "total-10k",
    title: "On the Board",
    description: "Walk 10,000 total steps",
    icon: "../assets/no_image/png",
    requirement: { type: "total_steps", value: 10000 },
    reward: { pomes: 200 },
    tier: "bronze",
  },
  {
    id: "total-25k",
    title: "Quarter Way",
    description: "Walk 25,000 total steps",
    icon: "../assets/no_image/png",
    requirement: { type: "total_steps", value: 25000 },
    reward: { pomes: 400 },
    tier: "bronze",
  },
  {
    id: "total-50k",
    title: "Half to Hundred",
    description: "Walk 50,000 total steps",
    icon: "../assets/no_image/png",
    requirement: { type: "total_steps", value: 50000 },
    reward: { pomes: 800 },
    tier: "silver",
  },
  {
    id: "total-100k",
    title: "Century Walker",
    description: "Walk 100,000 total steps",
    icon: "../assets/no_image/png",
    requirement: { type: "total_steps", value: 100000 },
    reward: { pomes: 2000 },
    tier: "gold",
  },
  {
    id: "total-250k",
    title: "Quarter Million",
    description: "Walk 250,000 total steps",
    icon: "../assets/no_image/png",
    requirement: { type: "total_steps", value: 250000 },
    reward: { pomes: 4000 },
    tier: "gold",
  },
  {
    id: "total-500k",
    title: "Half Million",
    description: "Walk 500,000 total steps",
    icon: "../assets/no_image/png",
    requirement: { type: "total_steps", value: 500000 },
    reward: { pomes: 8000 },
    tier: "gold",
  },
  {
    id: "total-1m",
    title: "Million Mover",
    description: "Walk 1,000,000 total steps",
    icon: "../assets/no_image/png",
    requirement: { type: "total_steps", value: 1000000 },
    reward: { pomes: 20000 },
    tier: "platinum",
  },
];
