import axios, { AxiosInstance } from 'axios';
import { 
    Job, 
    JobSearchRequest, 
    JobSearchResponse, 
    JobSpySearchResponse, 
    JobSpyDetailResponse,
    transformJobSpyJob,
    transformJobSpyDetailResponse
} from '../types/jobTypes';

export class JobService {
    private readonly apiClient: AxiosInstance;
    private readonly jobSpyApiUrl: string;

    constructor() {
        this.jobSpyApiUrl = process.env.JOBSPY_API_URL || 'http://localhost:8000';
        
        this.apiClient = axios.create({
            baseURL: this.jobSpyApiUrl,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        // Request interceptor for logging
        this.apiClient.interceptors.request.use(
            (config) => {
                console.log(`Making request to JobSpy API: ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                console.error('Request error:', error);
                return Promise.reject(error);
            }
        );

        // Response interceptor for error handling
        this.apiClient.interceptors.response.use(
            (response) => response,
            (error) => {
                console.error('JobSpy API error:', error.response?.data || error.message);
                throw error;
            }
        );
    }

    public async searchJobs(searchRequest: JobSearchRequest): Promise<JobSearchResponse> {
        try {
            // Transform our internal request to JobSpy format
            // Filter out empty strings and undefined values
            const jobSpyRequest: any = {
                posted_within_days: searchRequest.postedWithinDays || 7,
                limit: searchRequest.limit || 50,
                offset: searchRequest.offset || 0
            };

            // Only include non-empty values
            if (searchRequest.location && searchRequest.location.trim()) {
                jobSpyRequest.location = searchRequest.location;
            }
            if (searchRequest.field && searchRequest.field.trim()) {
                jobSpyRequest.field = searchRequest.field;
            }
            if (searchRequest.search && searchRequest.search.trim()) {
                jobSpyRequest.search = searchRequest.search;
            }
            if (searchRequest.remote === true) {
                jobSpyRequest.remote = true;
            }
            if (searchRequest.minSalary) {
                jobSpyRequest.min_salary = searchRequest.minSalary;
            }
            if (searchRequest.maxSalary) {
                jobSpyRequest.max_salary = searchRequest.maxSalary;
            }
            if (searchRequest.company && searchRequest.company.trim()) {
                jobSpyRequest.company = searchRequest.company;
            }
            if (searchRequest.experienceLevel && searchRequest.experienceLevel.trim()) {
                jobSpyRequest.experience_level = searchRequest.experienceLevel;
            }

            // If no search criteria specified, default to searching for tech jobs
            if (!jobSpyRequest.field && !jobSpyRequest.search && !jobSpyRequest.location && !jobSpyRequest.company) {
                jobSpyRequest.field = "software engineer";
            }

            console.log('Searching jobs with params:', jobSpyRequest);

            // Use POST endpoint for enhanced search capabilities
            const response = await this.apiClient.post<JobSpySearchResponse>('/jobs/search-advanced', jobSpyRequest);
            
            const jobSpyResponse = response.data;

            // Transform JobSpy response to our internal format
            // Filter out jobs without meaningful descriptions (minimum 50 characters)
            const transformedJobs = jobSpyResponse.jobs
                .filter(job => job.description && job.description.trim().length >= 50)
                .map(transformJobSpyJob);
            
            console.log(`Filtered ${jobSpyResponse.jobs.length - transformedJobs.length} jobs without proper descriptions. Showing ${transformedJobs.length} jobs.`);

            // Calculate pagination
            const pageSize = jobSpyResponse.page_size;
            const currentPage = Math.floor(jobSpyResponse.page_offset / pageSize) + 1;
            
            // Adjust total count based on filtered results
            // This is an approximation since we don't know how many total jobs have descriptions
            const filteredRatio = transformedJobs.length / jobSpyResponse.jobs.length;
            const estimatedTotal = Math.floor(jobSpyResponse.total_count * filteredRatio);

            return {
                jobs: transformedJobs,
                total: estimatedTotal || transformedJobs.length,
                page: currentPage,
                pageSize: transformedJobs.length,
                hasMore: jobSpyResponse.has_more && transformedJobs.length > 0
            };
        } catch (error) {
            console.error('Failed to search jobs:', error);
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 429) {
                    throw new Error('Rate limit exceeded. Please try again later.');
                }
                throw new Error(error.response?.data?.detail || 'Failed to search jobs');
            }
            throw error;
        }
    }

    public async getJobById(jobId: string): Promise<Job | null> {
        try {
            const response = await this.apiClient.get<JobSpyDetailResponse>(`/jobs/${jobId}`);
            
            if (!response.data) {
                return null;
            }

            return transformJobSpyDetailResponse(response.data);
        } catch (error) {
            console.error(`Failed to get job ${jobId}:`, error);
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    }

    public async getRecommendedJobs(userId: string): Promise<Job[]> {
        // For now, return popular tech jobs
        // In a real implementation, this would use user preferences/history
        try {
            const searchRequest: JobSearchRequest = {
                field: 'software engineer',
                limit: 10,
                postedWithinDays: 7
            };

            const response = await this.searchJobs(searchRequest);
            return response.jobs;
        } catch (error) {
            console.error('Failed to get recommended jobs:', error);
            return [];
        }
    }

    public async getLocationSuggestions(query: string): Promise<any[]> {
        try {
            const response = await this.apiClient.get('/locations/suggest', {
                params: { q: query }
            });
            return response.data.suggestions || [];
        } catch (error) {
            console.error('Failed to get location suggestions:', error);
            return [];
        }
    }

    public async getApiStats(): Promise<any> {
        try {
            const response = await this.apiClient.get('/stats');
            return response.data;
        } catch (error) {
            console.error('Failed to get API stats:', error);
            return null;
        }
    }

    // Remove LinkedIn-specific methods as they're no longer needed
    public async postJob(jobData: any): Promise<string> {
        throw new Error('Job posting is not supported through JobSpy API');
    }

    public async updateJobStatus(jobId: string, status: string): Promise<void> {
        throw new Error('Job status update is not supported through JobSpy API');
    }

    public async getJobApplications(jobId: string): Promise<any[]> {
        throw new Error('Job applications retrieval is not supported through JobSpy API');
    }

    public async getLinkedInAuthUrl(redirectUri: string, state?: string): Promise<string> {
        throw new Error('LinkedIn OAuth is not supported through JobSpy API');
    }

    public async exchangeLinkedInCode(code: string, redirectUri: string): Promise<string> {
        throw new Error('LinkedIn OAuth is not supported through JobSpy API');
    }

    public async validateLinkedInConnection(): Promise<boolean> {
        // Validate JobSpy API connection instead
        try {
            const response = await this.apiClient.get('/health');
            return response.data.status === 'healthy';
        } catch (error) {
            return false;
        }
    }
}
