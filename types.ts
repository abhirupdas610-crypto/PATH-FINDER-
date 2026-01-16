export enum ProjectApproach {
  SCRATCH = "Building from Scratch",
  TEMPLATE = "Templates / Boilerplates",
  NO_CODE = "No-Code / Low-Code Tools",
  AI_ASSISTED = "AI-Assisted Development"
}

export interface ComparisonMetric {
  approachName: ProjectApproach;
  pros: string[];
  cons: string[];
  timeEstimate: string;
  learningValue: number; // 1-10
  difficulty: number; // 1-10
  customization: number; // 1-10
  risk: string;
  bestUseScenario: string;
  toolExamples: string[];
}

export interface UserProjectInput {
  timeAvailable: string;
  skillLevel: string;
  projectType: string;
  mainGoal: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum ImageSize {
  SIZE_1K = "1K",
  SIZE_2K = "2K",
  SIZE_4K = "4K"
}

// Window interface extension for AI Studio key selection
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}
