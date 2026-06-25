/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GoalCategory = 'financial' | 'customer' | 'process' | 'learning';

export interface Goal {
  id: string;
  title: string;
  description: string;
  kpi: string;
  category: GoalCategory;
  progress: number;
  deadline: string;
}

export interface Objective {
  id: string;
  goalId: string;
  title: string;
  description: string;
  kpi: string;
  progress: number;
  deadline: string;
}

export interface Project {
  id: string;
  objectiveId?: string;
  goalId?: string;
  title: string;
  description: string;
  progress: number;
  deadline: string;
}

export interface Initiative {
  id: string;
  projectId: string;
  title: string;
  description: string;
  kpi: string;
  progress: number;
}

export interface Task {
  id: string;
  projectId?: string;
  initiativeId?: string;
  title: string;
  description?: string;
  completed: boolean;
  kpi?: string;
  progress?: number;
}

export interface KPI {
  id: string;
  title: string;
  value: string;
  target: string;
  progress: number;
  deadline: string;
  category?: GoalCategory;
}

export interface KataSession {
  id: string;
  title: string;
  date: string;
  goal: string;       // Target Condition (Önskat tillstånd)
  current: string;    // Current State (Nuvarande tillstånd)
  obstacles: string;  // Obstacles (Hinder)
  nextStep: string;   // Next actions (Nästa experimentella steg)
  learnings: string;  // Lessons learned (Lärdomar)
  progress: number;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  language: string;
  dateFormat: string;
  notificationFrequency: string;
}

export interface Member {
  id: string;
  email: string;
  name: string;
  role: string;
  status: 'invited' | 'active';
  invitedAt: string;
  invitedBy?: string;
}

export type KanoCategory = 'Must-be' | 'One-dimensional' | 'Attractive' | 'Indifferent' | 'Reverse';

export interface CtqKanoItem {
  id: string;
  voc: string;          // Voice of the Customer
  driver: string;       // Key driver
  specification: string; // CTQ Specification
  kanoCategory: KanoCategory;
  functionalScore: number; // 1-5 score (1: Dislike, 2: Live with, 3: Neutral, 4: Expect, 5: Like)
  dysfunctionalScore: number; // 1-5 score (1: Dislike, 2: Live with, 3: Neutral, 4: Expect, 5: Like)
  priority: 'High' | 'Medium' | 'Low';
  associatedGoalId?: string;
  associatedProjectId?: string;
}


