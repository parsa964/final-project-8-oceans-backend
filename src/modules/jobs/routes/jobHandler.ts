import { Request, Response } from 'express';
import { BaseHandler } from '../../../utils/handler/baseHandler';
import { BaseRequestBody, BaseResponse } from '../../../utils/response/baseResponse';
import { JobSearchRequest, JobDetailRequest } from '../types/jobTypes';
import { JobService } from '../services/jobService';

export class JobHandler extends BaseHandler {
    private jobService: JobService;

    constructor() {
        super({
            name: 'job-service',
            port: parseInt(process.env.JOB_SERVICE_PORT || '4001'),
            version: 'v1',
            basePath: 'jobs'
        });
        this.jobService = new JobService();
    }

    public setupRoutes(): void {
        // Search jobs
        this.router.post('/search', this.searchJobs);
        
        // Get job by ID
        this.router.post('/detail', this.getJobDetail);
        
        // Get recommended jobs
        this.router.post('/recommended', this.getRecommendedJobs);
        
        // Get location suggestions
        this.router.get('/locations/suggest', this.getLocationSuggestions);
        
        // API validation/health check
        this.router.get('/health', this.checkApiHealth);
        
        // Get API stats
        this.router.get('/stats', this.getApiStats);
    }

    private searchJobs = async (req: Request, res: Response): Promise<void> => {
        try {
            const requestBody = this.validateRequest<JobSearchRequest>(req);
            const requestId = (req as any).requestId;

            const searchResult = await this.jobService.searchJobs(requestBody.data);

            const response = BaseResponse.success(
                requestId,
                this.config.name,
                searchResult
            );

            this.sendResponse(res, response);
        } catch (error) {
            const requestId = (req as any).requestId || this.generateRequestId();
            const errorMessage = error instanceof Error ? error.message : 'Failed to search jobs';
            
            const response = BaseResponse.badRequest(
                requestId,
                this.config.name,
                errorMessage
            );

            this.sendResponse(res, response);
        }
    };

    private getJobDetail = async (req: Request, res: Response): Promise<void> => {
        try {
            const requestBody = this.validateRequest<JobDetailRequest>(req);
            const requestId = (req as any).requestId;

            const job = await this.jobService.getJobById(requestBody.data.jobId);

            if (!job) {
                const response = BaseResponse.notFound(
                    requestId,
                    this.config.name,
                    `Job with ID ${requestBody.data.jobId} not found`
                );
                this.sendResponse(res, response);
                return;
            }

            const response = BaseResponse.success(
                requestId,
                this.config.name,
                job
            );

            this.sendResponse(res, response);
        } catch (error) {
            const requestId = (req as any).requestId || this.generateRequestId();
            const errorMessage = error instanceof Error ? error.message : 'Failed to get job details';
            
            const response = BaseResponse.badRequest(
                requestId,
                this.config.name,
                errorMessage
            );

            this.sendResponse(res, response);
        }
    };

    private getRecommendedJobs = async (req: Request, res: Response): Promise<void> => {
        try {
            const requestBody = this.validateRequest<{ userId: string }>(req);
            const requestId = (req as any).requestId;

            const recommendedJobs = await this.jobService.getRecommendedJobs(requestBody.data.userId);

            const response = BaseResponse.success(
                requestId,
                this.config.name,
                { jobs: recommendedJobs }
            );

            this.sendResponse(res, response);
        } catch (error) {
            const requestId = (req as any).requestId || this.generateRequestId();
            const errorMessage = error instanceof Error ? error.message : 'Failed to get recommended jobs';
            
            const response = BaseResponse.badRequest(
                requestId,
                this.config.name,
                errorMessage
            );

            this.sendResponse(res, response);
        }
    };

    private getLocationSuggestions = async (req: Request, res: Response): Promise<void> => {
        try {
            const requestId = (req as any).requestId;
            const query = req.query.q as string;

            if (!query) {
                const response = BaseResponse.badRequest(
                    requestId,
                    this.config.name,
                    'Query parameter "q" is required'
                );
                this.sendResponse(res, response);
                return;
            }

            const suggestions = await this.jobService.getLocationSuggestions(query);

            const response = BaseResponse.success(
                requestId,
                this.config.name,
                { suggestions }
            );

            this.sendResponse(res, response);
        } catch (error) {
            const requestId = (req as any).requestId || this.generateRequestId();
            const errorMessage = error instanceof Error ? error.message : 'Failed to get location suggestions';
            
            const response = BaseResponse.badRequest(
                requestId,
                this.config.name,
                errorMessage
            );

            this.sendResponse(res, response);
        }
    };

    private checkApiHealth = async (req: Request, res: Response): Promise<void> => {
        try {
            const requestId = (req as any).requestId;

            const isHealthy = await this.jobService.validateLinkedInConnection();

            const response = BaseResponse.success(
                requestId,
                this.config.name,
                { 
                    healthy: isHealthy, 
                    message: isHealthy ? 'JobSpy API connection is healthy' : 'JobSpy API connection failed'
                }
            );

            this.sendResponse(res, response);
        } catch (error) {
            const requestId = (req as any).requestId || this.generateRequestId();
            const errorMessage = error instanceof Error ? error.message : 'Failed to check API health';
            
            const response = BaseResponse.badRequest(
                requestId,
                this.config.name,
                errorMessage
            );

            this.sendResponse(res, response);
        }
    };

    private getApiStats = async (req: Request, res: Response): Promise<void> => {
        try {
            const requestId = (req as any).requestId;

            const stats = await this.jobService.getApiStats();

            const response = BaseResponse.success(
                requestId,
                this.config.name,
                stats || { message: 'No stats available' }
            );

            this.sendResponse(res, response);
        } catch (error) {
            const requestId = (req as any).requestId || this.generateRequestId();
            const errorMessage = error instanceof Error ? error.message : 'Failed to get API stats';
            
            const response = BaseResponse.badRequest(
                requestId,
                this.config.name,
                errorMessage
            );

            this.sendResponse(res, response);
        }
    };

} 