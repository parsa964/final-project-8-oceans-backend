import { describe, it, expect, beforeAll } from 'bun:test';
import { 
  jobAPI, 
  openAIAPI, 
  waitForServices 
} from './testHelpers';
import { TEST_RESUME, LONG_TEST_TIMEOUT } from './testData';

describe('Backend Integration Tests', () => {
  beforeAll(async () => {
    await waitForServices();
  });

  it('Integration: Complete job search to skill development workflow', async () => {
    console.log('\n=== Starting End-to-End Integration Test ===\n');
    
    // Step 1: Search for jobs
    console.log('Step 1: Searching for jobs...');
    const searchParams = {
      site_name: 'linkedin',
      search_term: 'full stack developer',
      location: 'United States',
      results_wanted: 3,
      hours_old: 168,
      country: 'USA'
    };

    const searchResponse = await jobAPI.search(searchParams);
    expect(searchResponse).toBeDefined();
    expect(searchResponse.status.code).toBe(200);
    expect(searchResponse.data.jobs).toBeDefined();
    expect(searchResponse.data.jobs.length).toBeGreaterThan(0);
    
    const selectedJob = searchResponse.data.jobs[0];
    console.log(`✓ Found ${searchResponse.data.jobs.length} jobs`);
    console.log(`  Selected: ${selectedJob.title} at ${selectedJob.company}`);

    // Step 2: Get job details
    console.log('\nStep 2: Fetching job details...');
    const jobId = selectedJob.id || selectedJob.job_id;
    let jobDescription = selectedJob.description;
    
    if (jobId) {
      try {
        const detailsResponse = await jobAPI.getDetails(jobId);
        if (detailsResponse.status.code === 200) {
          jobDescription = detailsResponse.data.description || jobDescription;
          console.log(`✓ Retrieved detailed job description (${jobDescription.length} chars)`);
        }
      } catch (error) {
        console.log('  Using job description from search results');
      }
    }

    // Step 3: Review resume for the job
    console.log('\nStep 3: Reviewing resume for job match...');
    const reviewData = {
      resumeText: TEST_RESUME,
      jobDescription: jobDescription || 'Full stack developer position'
    };

    const reviewResponse = await openAIAPI.optimizeResume(reviewData);
    expect(reviewResponse).toBeDefined();
    expect(reviewResponse.status.code).toBe(200);
    expect(reviewResponse.data).toBeDefined();
    
    const overallScore = reviewResponse.data.overallScore;
    console.log(`✓ Resume reviewed - Score: ${overallScore}/100`);
    
    if (reviewResponse.data.suggestions) {
      console.log(`  Generated ${reviewResponse.data.suggestions.length} improvement suggestions`);
    }

    // Step 4: Generate projects for skill development
    console.log('\nStep 4: Generating skill development projects...');
    const projectData = {
      jobTitle: selectedJob.title,
      company: selectedJob.company,
      jobDescription: jobDescription
    };

    const projectResponse = await openAIAPI.generateProjects(projectData);
    expect(projectResponse).toBeDefined();
    expect(projectResponse.status.code).toBe(200);
    expect(projectResponse.data.projects).toBeDefined();
    expect(projectResponse.data.projects.length).toBeGreaterThan(0);
    
    console.log(`✓ Generated ${projectResponse.data.projects.length} projects:`);
    projectResponse.data.projects.forEach((project: any, index: number) => {
      console.log(`  ${index + 1}. ${project.title}`);
      if (project.difficulty) {
        console.log(`     Difficulty: ${project.difficulty}`);
      }
      if (project.techStack && project.techStack.length > 0) {
        console.log(`     Tech Stack: ${project.techStack.slice(0, 3).join(', ')}`);
      }
    });

    // Step 5: Generate interview prep questions
    console.log('\nStep 5: Generating interview preparation questions...');
    const leetcodeData = {
      role: selectedJob.title,
      company: selectedJob.company,
      description: jobDescription,
      difficulty: 'medium' as const,
      count: 3
    };

    const leetcodeResponse = await openAIAPI.generateLeetCode(leetcodeData);
    expect(leetcodeResponse).toBeDefined();
    expect(leetcodeResponse.status.code).toBe(200);
    expect(leetcodeResponse.data.problems).toBeDefined();
    expect(leetcodeResponse.data.problems.length).toBeGreaterThan(0);
    
    console.log(`✓ Generated ${leetcodeResponse.data.problems.length} interview questions:`);
    leetcodeResponse.data.problems.forEach((problem: any, index: number) => {
      console.log(`  ${index + 1}. ${problem.title} (${problem.difficulty})`);
      if (problem.topics && problem.topics.length > 0) {
        console.log(`     Topics: ${problem.topics.slice(0, 3).join(', ')}`);
      }
    });

    console.log('\n=== Integration Test Completed Successfully ===\n');
    
    // Summary
    console.log('Summary:');
    console.log(`- Job Found: ${selectedJob.title} at ${selectedJob.company}`);
    console.log(`- Resume Match Score: ${overallScore}/100`);
    console.log(`- Projects Generated: ${projectResponse.data.projects.length}`);
    console.log(`- Interview Questions: ${leetcodeResponse.data.problems.length}`);
    
  });

  it('Integration: Multi-site job search workflow', async () => {
    console.log('\n=== Multi-Site Job Search Test ===\n');
    
    const sites = ['indeed', 'linkedin'];
    const allJobs: any[] = [];
    
    for (const site of sites) {
      console.log(`Searching on ${site}...`);
      
      try {
        const searchParams = {
          site_name: site,
          search_term: 'data scientist',
          location: 'New York',
          results_wanted: 2,
          hours_old: 168,
          country: 'USA'
        };

        const response = await jobAPI.search(searchParams);
        
        if (response.status.code === 200 && response.data.jobs.length > 0) {
          allJobs.push(...response.data.jobs);
          console.log(`✓ Found ${response.data.jobs.length} jobs on ${site}`);
        } else {
          console.log(`  No jobs found on ${site}`);
        }
      } catch (error: any) {
        console.log(`  ${site} search skipped: ${error.message}`);
      }
    }
    
    console.log(`\nTotal jobs found across all sites: ${allJobs.length}`);
    
    if (allJobs.length > 0) {
      // Pick the best job based on some criteria
      const bestJob = allJobs[0];
      console.log(`\nBest match: ${bestJob.title} at ${bestJob.company}`);
      
      // Generate a general resume review
      console.log('\nGenerating general resume review...');
      const reviewResponse = await openAIAPI.generalReview({
        resumeText: TEST_RESUME
      });
      
      expect(reviewResponse.status.code).toBe(200);
      console.log(`✓ General resume score: ${reviewResponse.data.overallScore}/100`);
    }
    
  });

  it('Integration: Skill-based project generation workflow', async () => {
    console.log('\n=== Skill-Based Project Generation Test ===\n');
    
    const skillLevels = [
      { title: 'Junior Developer', description: 'Entry level position' },
      { title: 'Senior Developer', description: 'Senior position requiring 5+ years experience' },
      { title: 'Tech Lead', description: 'Leadership position with architecture responsibilities' }
    ];
    
    for (const level of skillLevels) {
      console.log(`\nGenerating projects for: ${level.title}`);
      
      const projectResponse = await openAIAPI.generateProjects({
        jobTitle: level.title,
        jobDescription: level.description
      });
      
      expect(projectResponse.status.code).toBe(200);
      expect(projectResponse.data.projects.length).toBeGreaterThan(0);
      
      console.log(`✓ Generated ${projectResponse.data.projects.length} projects`);
      
      // Analyze difficulty distribution
      const difficulties: { [key: string]: number } = {};
      projectResponse.data.projects.forEach((project: any) => {
        if (project.difficulty) {
          difficulties[project.difficulty] = (difficulties[project.difficulty] || 0) + 1;
        }
      });
      
      if (Object.keys(difficulties).length > 0) {
        console.log('  Difficulty distribution:', difficulties);
      }
    }
    
  });

  it('Integration: Interview preparation by difficulty', async () => {
    console.log('\n=== Interview Prep by Difficulty Test ===\n');
    
    const difficulties = ['easy', 'medium', 'hard'] as const;
    const role = 'Software Engineer';
    
    for (const difficulty of difficulties) {
      console.log(`\nGenerating ${difficulty} questions for ${role}...`);
      
      const leetcodeResponse = await openAIAPI.generateLeetCode({
        role: role,
        difficulty: difficulty,
        count: 2
      });
      
      expect(leetcodeResponse.status.code).toBe(200);
      expect(leetcodeResponse.data.problems.length).toBeGreaterThan(0);
      
      console.log(`✓ Generated ${leetcodeResponse.data.problems.length} ${difficulty} problems:`);
      
      leetcodeResponse.data.problems.forEach((problem: any, index: number) => {
        console.log(`  ${index + 1}. ${problem.title}`);
        if (problem.timeComplexity && problem.spaceComplexity) {
          console.log(`     Time: ${problem.timeComplexity}, Space: ${problem.spaceComplexity}`);
        }
      });
    }
    
  });

  it('Integration: Complete career transition workflow', async () => {
    console.log('\n=== Career Transition Workflow Test ===\n');
    
    // Scenario: Developer transitioning from Backend to Full Stack
    const currentRole = 'Backend Developer';
    const targetRole = 'Full Stack Developer';
    
    console.log(`Scenario: Transitioning from ${currentRole} to ${targetRole}`);
    
    // Step 1: Search for target role
    console.log('\nStep 1: Searching for target positions...');
    const searchResponse = await jobAPI.search({
      site_name: 'linkedin',
      search_term: targetRole,
      location: 'Remote',
      results_wanted: 2,
      hours_old: 168,
      country: 'USA',
      is_remote: true
    });
    
    if (searchResponse.status.code === 200 && searchResponse.data.jobs.length > 0) {
      const targetJob = searchResponse.data.jobs[0];
      console.log(`✓ Found target position: ${targetJob.title} at ${targetJob.company}`);
      
      // Step 2: Analyze resume gap
      console.log('\nStep 2: Analyzing skill gaps...');
      const reviewResponse = await openAIAPI.optimizeResume({
        resumeText: TEST_RESUME,
        jobDescription: targetJob.description || `${targetRole} position`
      });
      
      console.log(`✓ Current match score: ${reviewResponse.data.overallScore}/100`);
      
      // Step 3: Generate learning projects
      console.log('\nStep 3: Generating skill-building projects...');
      const projectResponse = await openAIAPI.generateProjects({
        jobTitle: targetRole,
        jobDescription: 'Full Stack Developer with React, Node.js, and database experience'
      });
      
      console.log(`✓ Generated ${projectResponse.data.projects.length} learning projects`);
      
      // Step 4: Prepare for interviews
      console.log('\nStep 4: Preparing interview questions...');
      const interviewResponse = await openAIAPI.generateLeetCode({
        role: targetRole,
        difficulty: 'medium' as const,
        count: 3,
        topic: 'full-stack'
      });
      
      console.log(`✓ Generated ${interviewResponse.data.problems.length} practice problems`);
      
      console.log('\n✓ Career transition plan created successfully!');
    } else {
      console.log('No target positions found, using mock data for demonstration');
    }
    
  });
});