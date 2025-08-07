import axios from 'axios';
import { expect } from 'bun:test';
import { TEST_TIMEOUT } from './testData';

// Base URLs for testing
const JOB_SERVICE_BASE_URL = 'http://localhost:3001';
const OPENAI_SERVICE_BASE_URL = 'http://localhost:3002';

// Helper function to check if services are running
export async function waitForServices(maxRetries = 10): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await axios.get(`${JOB_SERVICE_BASE_URL}/health`);
      await axios.get(`${OPENAI_SERVICE_BASE_URL}/health`);
      console.log('Services are ready');
      return;
    } catch (error) {
      if (i === maxRetries - 1) {
        throw new Error('Services did not start in time');
      }
      console.log(`Waiting for services... (attempt ${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// Helper to wrap request in BaseRequestBody format
function wrapRequest(data: any, service: string): any {
  return {
    requestId: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    service: service,
    data: data
  };
}

// Job Service API helpers
export const jobAPI = {
  search: async (params: any) => {
    const wrappedRequest = wrapRequest(params, 'test-client');
    const response = await axios.post(`${JOB_SERVICE_BASE_URL}/api/v1/jobs/search`, wrappedRequest);
    return response.data;
  },
  
  getDetails: async (jobId: string) => {
    const wrappedRequest = wrapRequest({ jobId: jobId }, 'test-client');
    const response = await axios.post(`${JOB_SERVICE_BASE_URL}/api/v1/jobs/detail`, wrappedRequest);
    return response.data;
  }
};

// OpenAI Service API helpers
export const openAIAPI = {
  optimizeResume: async (data: any) => {
    const wrappedRequest = wrapRequest(data, 'test-client');
    const response = await axios.post(`${OPENAI_SERVICE_BASE_URL}/api/v1/ai/resume/review`, wrappedRequest);
    return response.data;
  },
  
  generalReview: async (data: any) => {
    const wrappedRequest = wrapRequest(data, 'test-client');
    const response = await axios.post(`${OPENAI_SERVICE_BASE_URL}/api/v1/ai/resume/general-review`, wrappedRequest);
    return response.data;
  },
  
  generateProjects: async (data: any) => {
    const wrappedRequest = wrapRequest(data, 'test-client');
    const response = await axios.post(`${OPENAI_SERVICE_BASE_URL}/api/v1/ai/project/generate`, wrappedRequest);
    return response.data;
  },
  
  generateLeetCode: async (data: any) => {
    const wrappedRequest = wrapRequest(data, 'test-client');
    const response = await axios.post(`${OPENAI_SERVICE_BASE_URL}/api/v1/ai/leetcode/generate`, wrappedRequest);
    return response.data;
  }
};

// Validation helpers
export function validateJobSearchResponse(response: any) {
  expect(response).toBeDefined();
  expect(response.status).toBeDefined();
  expect(response.status.code).toBe(200);
  expect(response.data).toBeDefined();
  expect(response.data.jobs).toBeDefined();
  expect(Array.isArray(response.data.jobs)).toBe(true);
  
  if (response.data.jobs.length > 0) {
    const job = response.data.jobs[0];
    expect(job).toHaveProperty('title');
    expect(job).toHaveProperty('company');
    expect(job).toHaveProperty('location');
  }
}

export function validateJobDetailsResponse(response: any) {
  expect(response).toBeDefined();
  expect(response.status).toBeDefined();
  expect(response.status.code).toBe(200);
  expect(response.data).toBeDefined();
  expect(response.data).toHaveProperty('description');
}

export function validateOptimizeResumeResponse(response: any) {
  expect(response).toBeDefined();
  expect(response.status).toBeDefined();
  expect(response.status.code).toBe(200);
  expect(response.data).toBeDefined();
  // The response data IS the review object
  expect(response.data).toHaveProperty('overallScore');
}

export function validateProjectsResponse(response: any) {
  expect(response).toBeDefined();
  expect(response.status).toBeDefined();
  expect(response.status.code).toBe(200);
  expect(response.data).toBeDefined();
  expect(response.data).toHaveProperty('projects');
  expect(Array.isArray(response.data.projects)).toBe(true);
  
  if (response.data.projects.length > 0) {
    const project = response.data.projects[0];
    expect(project).toHaveProperty('title');
    expect(project).toHaveProperty('description');
    expect(project).toHaveProperty('techStack'); // Changed from 'technologies' to 'techStack'
  }
}

export function validateLeetCodeResponse(response: any) {
  expect(response).toBeDefined();
  expect(response.status).toBeDefined();
  expect(response.status.code).toBe(200);
  expect(response.data).toBeDefined();
  expect(response.data).toHaveProperty('problems');
  expect(Array.isArray(response.data.problems)).toBe(true);
  
  if (response.data.problems.length > 0) {
    const problem = response.data.problems[0];
    expect(problem).toHaveProperty('title');
    expect(problem).toHaveProperty('difficulty');
    expect(problem).toHaveProperty('problemStatement');
  }
}