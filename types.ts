
export enum Group {
  OVER = 'מעריך יתר',
  UNDER = 'מעריך חסר',
  NONE = 'ללא'
}

export enum AppStep {
  INTRO = 'INTRO',
  ASSIGNMENT_TEST = 'ASSIGNMENT_TEST',
  GROUP_REVEAL = 'GROUP_REVEAL',
  ALLOCATION_TASK = 'ALLOCATION_TASK',
  JUDGMENT_TASK = 'JUDGMENT_TASK',
  RESULTS = 'RESULTS'
}

export interface AllocationChoice {
  inGroupAmount: number;
  outGroupAmount: number;
  scenario: string;
}

export interface JudgmentScore {
  characterName: string;
  characterGroup: Group;
  rating: number; // 1-10
  attribute: string;
}

export interface Character {
  name: string;
  group: Group;
  description: string;
  avatar: string;
}

export interface UserStats {
  inGroupAvgPoints: number;
  outGroupAvgPoints: number;
  inGroupAvgRating: number;
  outGroupAvgRating: number;
  biasScore: number;
}
