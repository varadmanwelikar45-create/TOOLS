/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LucideIcon } from "lucide-react";

export type ToolCategory = "ai" | "image" | "productivity" | "calculator" | "converter" | "developer" | "dashboard";

export interface ToolItem {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  hot: boolean;
  pro: boolean;
  iconName: string; // Dynamic mapping in the frontend React space
  usageCount: number;
}

export interface UserState {
  credits: number;
  isPro: boolean;
  history: Array<{
    id: string;
    toolId: string;
    toolName: string;
    timestamp: string;
    details: string;
  }>;
  favorites: string[]; // List of toolIds
  achievements: Array<{
    id: string;
    title: string;
    desc: string;
    unlockedAt?: string;
  }>;
}

// Sub-app specific structures
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  updatedAt: string;
}

export interface TodoItem {
  id: string;
  text: string;
  category: "work" | "personal" | "ideas" | "urgent";
  priority: "low" | "medium" | "high";
  completed: boolean;
  dueDate?: string;
}

export interface Habit {
  id: string;
  name: string;
  streak: number;
  history: string[]; // Dates in YYYY-MM-DD
  frequency: "daily" | "weekly";
}

export interface PomodoroSession {
  mode: "work" | "shortBreak" | "longBreak";
  duration: number; // in seconds
  isActive: boolean;
  completedCycles: number;
}
