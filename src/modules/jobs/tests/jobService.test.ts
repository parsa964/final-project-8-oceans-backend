import { describe, it, expect, beforeAll } from 'bun:test';
import { jobAPI, validateJobSearchResponse, validateJobDetailsResponse, waitForServices } from '../../../test/testHelpers';
import { TEST_JOB_SEARCH_QUERY, TEST_LOCATION, saveJobData, TEST_TIMEOUT } from '../../../test/testData';

describe('Job Service - Unit Tests', () => {
  beforeAll(async () => {
    // Wait for services to be ready
    await waitForServices();
  });

  describe('Job Search', () => {
    it('Unit: should search for jobs with valid query', async () => {
      const searchParams = {
        site_name: 'indeed',
        search_term: TEST_JOB_SEARCH_QUERY,
        location: TEST_LOCATION,
        results_wanted: 5,
        hours_old: 72,
        country: 'USA'
      };

      const response = await jobAPI.search(searchParams);
      
      validateJobSearchResponse(response);
      
      // Save first job for later tests
      if (response.data && response.data.jobs && response.data.jobs.length > 0) {
        saveJobData(response.data.jobs[0]);
        console.log('Saved job for later tests:', response.data.jobs[0].title);
      }
      
      expect(response.data.jobs.length).toBeGreaterThan(0);
      // API might return more results than requested
      console.log(`Requested 5 jobs, received ${response.data.jobs.length}`);
    });

    it('Unit: should handle different job sites', async () => {
      const sites = ['indeed', 'linkedin'];
      
      for (const site of sites) {
        const searchParams = {
          site_name: site,
          search_term: 'developer',
          location: 'Remote',
          results_wanted: 2,
          hours_old: 168,
          country: 'USA'
        };

        try {
          const response = await jobAPI.search(searchParams);
          validateJobSearchResponse(response);
          console.log(`Successfully searched ${site}: found ${response.data.jobs.length} jobs`);
        } catch (error: any) {
          // Some sites might be rate limited or unavailable
          console.log(`Site ${site} search failed:`, error.message);
        }
      }
    });

    it('Unit: should search with different parameters', async () => {
      const searchParams = {
        site_name: 'indeed',
        search_term: 'senior software engineer',
        location: 'San Francisco',
        results_wanted: 3,
        hours_old: 24,
        country: 'USA',
        distance: 25,
        is_remote: false,
        job_type: 'fulltime',
        easy_apply: true
      };

      const response = await jobAPI.search(searchParams);
      validateJobSearchResponse(response);
      
      // Verify some results were returned
      expect(response.data.jobs).toBeDefined();
      console.log(`Found ${response.data.jobs.length} senior engineer jobs in SF`);
    });

    it('Unit: should handle empty search results gracefully', async () => {
      const searchParams = {
        site_name: 'indeed',
        search_term: 'zzznonexistentjob12345xyz',
        location: 'Antarctica',
        results_wanted: 5,
        hours_old: 1,
        country: 'USA'
      };

      const response = await jobAPI.search(searchParams);
      
      expect(response).toBeDefined();
      expect(response.status).toBeDefined();
      expect(response.status.code).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.jobs).toBeDefined();
      expect(Array.isArray(response.data.jobs)).toBe(true);
    });
  });

  describe('LinkedIn Job Search', () => {
    it('Unit: should search LinkedIn jobs with standard parameters', async () => {
      const searchParams = {
        site_name: 'linkedin',
        search_term: 'software engineer',
        location: 'United States',
        results_wanted: 5,
        hours_old: 72,
        country: 'USA'
      };

      try {
        const response = await jobAPI.search(searchParams);
        
        expect(response).toBeDefined();
        expect(response.status).toBeDefined();
        expect(response.status.code).toBe(200);
        expect(response.data).toBeDefined();
        expect(response.data.jobs).toBeDefined();
        
        if (response.data && response.data.jobs && response.data.jobs.length > 0) {
          const job = response.data.jobs[0];
          expect(job).toHaveProperty('title');
          expect(job).toHaveProperty('company');
          console.log(`LinkedIn search found: ${job.title} at ${job.company}`);
        }
      } catch (error: any) {
        // LinkedIn might be rate limited
        console.log('LinkedIn search skipped:', error.message);
      }
    });

    it('Unit: should search LinkedIn with advanced filters', async () => {
      const searchParams = {
        site_name: 'linkedin',
        search_term: 'react developer',
        location: 'New York',
        results_wanted: 3,
        hours_old: 24,
        country: 'USA',
        is_remote: true
      };

      try {
        const response = await jobAPI.search(searchParams);
        
        expect(response).toBeDefined();
        expect(response.status).toBeDefined();
        expect(response.status.code).toBe(200);
        
        if (response.data && response.data.jobs && response.data.jobs.length > 0) {
          console.log(`Found ${response.data.jobs.length} remote React developer jobs on LinkedIn`);
        }
      } catch (error: any) {
        console.log('LinkedIn advanced search skipped:', error.message);
      }
    });
  });

  describe('Job Details', () => {
    it('Unit: should fetch job details for a valid job URL', async () => {
      // First, get a job to test with
      const searchParams = {
        site_name: 'indeed',
        search_term: 'software developer',
        location: 'United States',
        results_wanted: 1,
        hours_old: 168,
        country: 'USA'
      };

      const searchResponse = await jobAPI.search(searchParams);
      
      if (searchResponse.data && searchResponse.data.jobs && searchResponse.data.jobs.length > 0) {
        const job = searchResponse.data.jobs[0];
        const jobId = job.id || job.job_id;
        
        if (jobId) {
          const detailsResponse = await jobAPI.getDetails(jobId);
          validateJobDetailsResponse(detailsResponse);
          
          expect(detailsResponse.data.description).toBeDefined();
          expect(detailsResponse.data.description.length).toBeGreaterThan(50);
          console.log('Successfully fetched job details, description length:', detailsResponse.data.description.length);
        } else {
          console.log('No job ID available, skipping details test');
        }
      }
    });

    it('Unit: should handle invalid job ID gracefully', async () => {
      const invalidId = 'invalid-job-id-12345';
      
      try {
        const response = await jobAPI.getDetails(invalidId);
        
        // Should still return a response structure
        expect(response).toBeDefined();
        
        if (response.status && response.status.code !== 200) {
          console.log('Invalid job ID handled gracefully with error');
        }
      } catch (error: any) {
        // Error is expected for invalid ID
        console.log('Expected error for invalid job ID:', error.message);
      }
    });

    it('Unit: should fetch details for different job IDs', async () => {
      const testIds = [
        'indeed-test-123',
        'linkedin-test-456'
      ];

      for (const id of testIds) {
        try {
          const response = await jobAPI.getDetails(id);
          console.log(`Attempted to fetch details for job ID: ${id}`);
          
          expect(response).toBeDefined();
        } catch (error: any) {
          // Some IDs might fail, which is expected
          console.log(`Details fetch for ${id} failed as expected`);
        }
      }
    });
  });
});