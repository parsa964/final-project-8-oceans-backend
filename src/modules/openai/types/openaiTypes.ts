// *********************************************************************************
// Description   : TypeScript interfaces defining request and response structures for OpenAI features
// Used In       : projectGenerator.ts, resumeReviewer.ts, openaiRoutes.ts
// Written By    : Kourosh Hashemi
// ---------------------------------------------------------------------------------
// Revision History
// ---------------------------------------------------------------------------------
// Date                By                  Revision Description
// ---------------------------------------------------------------------------------
//
// *********************************************************************************

export interface ResumeReviewRequest {
  resumeText: string;
  jobDescription?: string;
}

// Types for General Resume Optimizer
export interface GeneralResumeContact {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
}

export interface GeneralResumeSkills {
  technical: string[];
  frameworks: string[];
  tools: string[];
  databases: string[];
}

export interface GeneralResumeExperience {
  company: string;
  title: string;
  duration: string;
  location: string;
  bullets: string[];
}

export interface GeneralResumeEducation {
  degree: string;
  school: string;
  year: string;
  details: string;
}

export interface GeneralResumeProject {
  name: string;
  description: string;
  technologies: string[];
}

export interface GeneralResumeContent {
  contact: GeneralResumeContact;
  summary: string;
  skills: GeneralResumeSkills;
  experience: GeneralResumeExperience[];
  education: GeneralResumeEducation[];
  projects: GeneralResumeProject[];
}

export interface GeneralResumeTailoredVersions {
  general: GeneralResumeContent;
  startup: GeneralResumeContent;
  bigTech: GeneralResumeContent;
  ai: GeneralResumeContent;
}

export interface GeneralResumeEnhancedSample {
  improvedBullets: string[];
  beforeAfter: {
    original: string;
    improved: string;
    explanation: string;
  }[];
}

export interface GeneralResumeSectionReview {
  score: number;
  feedback: string;
  improvements: string[];
  exactLocations: string[];
}

export interface GeneralResumeExperienceReview extends GeneralResumeSectionReview {
  starMethodAnalysis: {
    compliantBullets: string[];
    needsImprovement: string[];
    suggestions: string[];
  };
}

export interface GeneralResumeSections {
  skills: GeneralResumeSectionReview;
  experience: GeneralResumeExperienceReview;
  education: GeneralResumeSectionReview;
  format: GeneralResumeSectionReview;
}

export interface GeneralResumeOptimizer {
  overallScore: number;
  sections: GeneralResumeSections;
  enhancedResumeSample: GeneralResumeEnhancedSample;
  tailoredVersions: GeneralResumeTailoredVersions;
  suggestions: string[];
  strengths: string[];
  actionableSteps: string[];
  atsCompatibility: number;
}

// Keep the old interface for backward compatibility but use the new type
export type GeneralResumeReviewResponse = GeneralResumeOptimizer;

export interface ResumeReviewResponse {
  overallScore: number;
  sections: {
    skills: EnhancedSectionReview;
    experience: ExperienceSectionReview;
    education: EnhancedSectionReview;
    format: EnhancedSectionReview;
  };
  keywordAnalysis: {
    missingKeywords: string[];
    underutilizedKeywords: string[];
    keywordPlacement: string[];
    priorityKeywords: string[];
  };
  enhancedResumeSample: {
    improvedBullets: string[];
    beforeAfter: {
      original: string;
      improved: string;
      explanation: string;
    }[];
  };
  jobSpecificTailoring: {
    roleAlignment: string;
    companyAlignment: string;
    skillsGap: string[];
    experienceGap: string[];
    tailoringRecommendations: {
      section: string;
      currentContent: string;
      recommendedChange: string;
      reason: string;
    }[];
  };
  tailoredResume: {
    contact: {
      name: string;
      email: string;
      phone: string;
      location: string;
      linkedin: string;
      github: string;
    };
    summary: string;
    skills: {
      technical: string[];
      frameworks: string[];
      tools: string[];
      databases: string[];
    };
    experience: {
      company: string;
      title: string;
      duration: string;
      location: string;
      bullets: string[];
    }[];
    education: {
      degree: string;
      school: string;
      year: string;
      details: string;
    }[];
    projects: {
      name: string;
      description: string;
      technologies: string[];
    }[];
  };
  suggestions: string[];
  strengths: string[];
  actionableSteps: string[];
  atsCompatibility: number;
}

export interface SectionReview {
  score: number;
  feedback: string;
  improvements: string[];
}

export interface EnhancedSectionReview extends SectionReview {
  exactLocations: string[];
}

export interface ExperienceSectionReview extends EnhancedSectionReview {
  starMethodAnalysis: {
    compliantBullets: string[];
    needsImprovement: string[];
    suggestions: string[];
  };
}

export interface ProjectGenerationRequest {
  jobTitle: string;
  company?: string;
  jobDescription?: string;
}

export interface ProjectGenerationResponse {
  projects: GeneratedProject[];
}

export interface GeneratedProject {
  title: string;
  description: string;
  techStack: string[];
  difficulty: DifficultyLevel;
  estimatedTime: string;
  learningOutcomes: string[];
  steps: ProjectStep[];
}

export interface ProjectStep {
  order: number;
  title: string;
  description: string;
  resources: string[];
}

export enum ProjectType {
  WEB_APP = "web_app",
  MOBILE_APP = "mobile_app",
  API = "api",
  DATA_SCIENCE = "data_science",
  MACHINE_LEARNING = "machine_learning",
  GAME = "game",
  CLI_TOOL = "cli_tool",
}

export enum DifficultyLevel {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
  EXPERT = "expert",
}

// LeetCode Question Generation Types
export interface LeetCodeGenerationRequest {
  role: string;
  company?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  topic?: string;
  count?: number;
  description?: string;
  questionType?: 'technical' | 'behavioral' | 'architectural';
}

export interface LeetCodeProblem {
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topics: string[];
  problemStatement: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  hints: string[];
  solutionApproach: string;
  timeComplexity: string;
  spaceComplexity: string;
  followUp?: string[];
  companies?: string[];
  relatedProblems?: string[];
}

export interface LeetCodeSolution {
  language: string;
  code: string;
  explanation: string;
  alternativeApproaches?: {
    approach: string;
    timeComplexity: string;
    spaceComplexity: string;
    tradeoffs: string;
  }[];
}

export interface LeetCodeGenerationResponse {
  problems: LeetCodeProblem[];
  studyPlan?: {
    week: number;
    focus: string;
    problems: string[];
  }[];
  interviewTips?: string[];
}
