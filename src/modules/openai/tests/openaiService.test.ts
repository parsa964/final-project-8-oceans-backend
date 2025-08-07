import { describe, it, expect, beforeAll } from 'bun:test';
import { 
  openAIAPI, 
  jobAPI,
  validateOptimizeResumeResponse, 
  validateProjectsResponse,
  validateLeetCodeResponse,
  waitForServices,
  
} from '../../../test/testHelpers';
import { 
  TEST_RESUME, 
  TEST_TIMEOUT, 
  LONG_TEST_TIMEOUT,
  getSavedJobData,
  saveJobData 
} from '../../../test/testData';

describe('OpenAI Service - Unit Tests', () => {
  let testJob: any = null;
  let testJobDescription: string = '';

  beforeAll(async () => {
    // Wait for services to be ready
    await waitForServices();

    // Get a real job for testing
    try {
      const searchResponse = await jobAPI.search({
        site_name: 'indeed',
        search_term: 'software engineer',
        location: 'United States',
        results_wanted: 3,
        hours_old: 168,
        country: 'USA'
      });

      if (searchResponse.data && searchResponse.data.jobs && searchResponse.data.jobs.length > 0) {
        testJob = searchResponse.data.jobs[0];
        saveJobData(testJob);
        
        // Try to get job details
        const jobId = testJob.id || testJob.job_id;
        if (jobId) {
          try {
            const detailsResponse = await jobAPI.getDetails(jobId);
            if (detailsResponse.status && detailsResponse.status.code === 200 && detailsResponse.data) {
              testJobDescription = detailsResponse.data.description || testJob.description || 'Software Engineer position';
            }
          } catch (error) {
            testJobDescription = testJob.description || 'Software Engineer position requiring experience with modern web technologies';
          }
        }
      }
    } catch (error) {
      console.log('Could not fetch test job, using fallback data');
      testJob = {
        title: 'Software Engineer',
        company: 'Test Company',
        location: 'Remote',
        description: 'Looking for a software engineer with experience in React, Node.js, and cloud technologies.'
      };
      testJobDescription = testJob.description;
    }
  });

  describe('Resume Review', () => {
    it('Unit: should review resume with job description', async () => {
      const reviewData = {
        resumeText: TEST_RESUME,
        jobDescription: testJobDescription || 'Software engineer position with React and Node.js experience required'
      };

      const response = await openAIAPI.optimizeResume(reviewData);
      
      validateOptimizeResumeResponse(response);
      
      expect(response.data).toBeDefined();
      expect(response.data.overallScore).toBeDefined();
      expect(response.data.overallScore).toBeGreaterThanOrEqual(0);
      expect(response.data.overallScore).toBeLessThanOrEqual(100);
      
      console.log(`Resume reviewed for ${testJob?.title || 'Software Engineer'} position`);
      console.log(`Overall score: ${response.data.overallScore}/100`);
    });

    it('Unit: should review resume without job description', async () => {
      const reviewData = {
        resumeText: TEST_RESUME
      };

      const response = await openAIAPI.generalReview(reviewData);
      
      expect(response).toBeDefined();
      expect(response.status).toBeDefined();
      expect(response.status.code).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.overallScore).toBeDefined();
      
      console.log('General resume review completed');
      console.log(`Overall score: ${response.data.overallScore}/100`);
    });

    it('Unit: should provide specific optimization suggestions', async () => {
      const reviewData = {
        resumeText: TEST_RESUME,
        jobDescription: 'Senior Full Stack Engineer position requiring React, Node.js, AWS, and team leadership experience'
      };

      const response = await openAIAPI.optimizeResume(reviewData);
      
      expect(response.data).toBeDefined();
      expect(response.data.suggestions).toBeDefined();
      expect(Array.isArray(response.data.suggestions)).toBe(true);
      expect(response.data.suggestions.length).toBeGreaterThan(0);
      
      console.log(`Generated ${response.data.suggestions.length} optimization suggestions`);
      
      // Check for sections analysis
      if (response.data.sections) {
        expect(response.data.sections).toHaveProperty('skills');
        expect(response.data.sections).toHaveProperty('experience');
        expect(response.data.sections).toHaveProperty('education');
        console.log('Sections analysis completed');
      }
    });
  });

  describe('Project Generation', () => {
    it('Unit: should generate projects based on job requirements', async () => {
      const projectData = {
        jobTitle: testJob?.title || 'Full Stack Developer',
        company: testJob?.company || 'Tech Company',
        jobDescription: testJobDescription || 'Full Stack Developer with React and Node.js experience'
      };

      const response = await openAIAPI.generateProjects(projectData);
      
      validateProjectsResponse(response);
      
      expect(response.data.projects.length).toBeGreaterThan(0);
      
      const project = response.data.projects[0];
      expect(project.title).toBeDefined();
      expect(project.description).toBeDefined();
      expect(project.techStack).toBeDefined();
      expect(Array.isArray(project.techStack)).toBe(true);
      
      console.log(`Generated ${response.data.projects.length} projects for ${projectData.jobTitle}`);
      console.log('First project:', project.title);
    });

    it('Unit: should generate projects with implementation details', async () => {
      const projectData = {
        jobTitle: 'React Developer',
        company: 'Startup',
        jobDescription: 'React developer for building modern web applications'
      };

      const response = await openAIAPI.generateProjects(projectData);
      
      expect(response.data.projects).toBeDefined();
      
      response.data.projects.forEach((project: any) => {
        expect(project.steps).toBeDefined();
        expect(Array.isArray(project.steps)).toBe(true);
        expect(project.steps.length).toBeGreaterThan(0);
        
        // Check first step structure
        if (project.steps.length > 0) {
          const step = project.steps[0];
          expect(step).toHaveProperty('title');
          expect(step).toHaveProperty('description');
        }
      });
      
      console.log('Projects generated with detailed implementation steps');
    });

    it('Unit: should generate skill-appropriate projects', async () => {
      const projectData = {
        jobTitle: 'Junior Developer',
        jobDescription: 'Entry-level position for recent graduates'
      };

      const response = await openAIAPI.generateProjects(projectData);
      
      expect(response.data.projects).toBeDefined();
      
      // Check difficulty levels
      response.data.projects.forEach((project: any) => {
        if (project.difficulty) {
          expect(['beginner', 'intermediate', 'advanced', 'expert']).toContain(project.difficulty);
          console.log(`Project "${project.title}" - Difficulty: ${project.difficulty}`);
        }
      });
    });
  });

  describe('LeetCode Question Generation', () => {
    it('Unit: should generate LeetCode questions for job requirements', async () => {
      const leetcodeData = {
        role: testJob?.title || 'Software Engineer',
        company: testJob?.company || 'Tech Company',
        description: testJobDescription || 'Software engineering position',
        difficulty: 'medium' as const,
        count: 3
      };

      const response = await openAIAPI.generateLeetCode(leetcodeData);
      
      validateLeetCodeResponse(response);
      
      expect(response.data.problems).toBeDefined();
      expect(response.data.problems.length).toBeGreaterThan(0);
      
      const problem = response.data.problems[0];
      expect(problem.title).toBeDefined();
      expect(problem.difficulty).toBeDefined();
      expect(problem.problemStatement).toBeDefined();
      
      console.log(`Generated ${response.data.problems.length} LeetCode problems for ${leetcodeData.role}`);
      console.log('First problem:', problem.title);
    });

    it('Unit: should generate questions with solutions', async () => {
      const leetcodeData = {
        role: 'Backend Engineer',
        company: 'Tech Startup',
        difficulty: 'easy' as const,
        count: 2,
        topic: 'arrays'
      };

      const response = await openAIAPI.generateLeetCode(leetcodeData);
      
      expect(response.data.problems).toBeDefined();
      
      response.data.problems.forEach((problem: any) => {
        expect(problem.solutionApproach).toBeDefined();
        expect(problem.timeComplexity).toBeDefined();
        expect(problem.spaceComplexity).toBeDefined();
        
        // Check for examples
        if (problem.examples) {
          expect(Array.isArray(problem.examples)).toBe(true);
          if (problem.examples.length > 0) {
            expect(problem.examples[0]).toHaveProperty('input');
            expect(problem.examples[0]).toHaveProperty('output');
          }
        }
      });
      
      console.log('LeetCode problems generated with solutions and complexity analysis');
    });

    it('Unit: should generate difficulty-appropriate questions', async () => {
      const difficulties = ['easy', 'medium', 'hard'] as const;
      
      for (const difficulty of difficulties) {
        const leetcodeData = {
          role: 'Software Developer',
          difficulty: difficulty,
          count: 1
        };

        const response = await openAIAPI.generateLeetCode(leetcodeData);
        
        expect(response.data.problems).toBeDefined();
        expect(response.data.problems.length).toBeGreaterThan(0);
        
        const problem = response.data.problems[0];
        expect(problem.difficulty).toBe(difficulty);
        
        console.log(`Generated ${difficulty} problem: ${problem.title}`);
      }
    });
  });
});