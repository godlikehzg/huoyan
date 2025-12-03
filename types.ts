import React from 'react';

export enum GameMode {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  SUMMARY = 'SUMMARY',
}

export type ItemType = 'clothing_top' | 'clothing_dress' | 'shoe' | 'electronics' | 'bag';
export type VisualDefect = 'stain' | 'tear' | 'broken_tag' | 'missing_component' | 'broken_seal' | 'none';

export interface ReturnItem {
  id: string;
  name: string;
  category: 'female' | 'male';
  itemType: ItemType;
  material: string; // New: e.g., "100% Cotton", "Leather"
  description: string; // New: e.g., "A vintage style summer dress"
  visualDefects: VisualDefect[];
  isFraud: boolean;
  color: string; // Hex color for the item base
  explanation: string; // Text to show AFTER judgment
}

export interface LevelStats {
  level: number;
  score: number;
  correct: number;
  mistakes: number;
  timeRemaining: number;
  streak: number;
}

export interface PowerUp {
  id: 'fire_eyes' | 'time_freeze';
  name: string;
  icon: React.ReactNode;
  cost: number;
  count: number;
}