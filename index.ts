import { config } from 'dotenv';
import { JobHandler } from './src/modules/jobs/routes/jobHandler';
import { OpenAIHandler } from './src/modules/openai/routes/openaiHandler';

// Load environment variables
config();

interface ServiceInfo {
    name: string;
    handler: any;
    enabled: boolean;
}

class MicroserviceOrchestrator {
    private services: ServiceInfo[] = [
        {
            name: 'job-service',
            handler: JobHandler,
            enabled: process.env.ENABLE_JOB_SERVICE !== 'false'
        },
        {
            name: 'openai-service',
            handler: OpenAIHandler,
            enabled: process.env.ENABLE_OPENAI_SERVICE !== 'false'
        }
    ];

    async start(): Promise<void> {
        console.log('Starting Microservices Orchestrator...');
        
        const startPromises = this.services
            .filter(service => service.enabled)
            .map(service => this.startService(service));

        try {
            await Promise.all(startPromises);
            console.log('All enabled services started successfully');
            this.setupGracefulShutdown();
        } catch (error) {
            console.error('Failed to start services:', error);
            process.exit(1);
        }
    }

    private async startService(serviceInfo: ServiceInfo): Promise<void> {
        try {
            console.log(`Starting ${serviceInfo.name}...`);
            const handler = new serviceInfo.handler();
            handler.listen();
            console.log(`${serviceInfo.name} started successfully`);
        } catch (error) {
            console.error(`Failed to start ${serviceInfo.name}:`, error);
            throw error;
        }
    }

    private setupGracefulShutdown(): void {
        process.on('SIGTERM', this.handleShutdown);
        process.on('SIGINT', this.handleShutdown);
    }

    private handleShutdown = (): void => {
        console.log('Shutting down services...');
        // In a real implementation, you would gracefully close connections here
        process.exit(0);
    };
}

// Main entry point
if (import.meta.main) {
    const orchestrator = new MicroserviceOrchestrator();
    orchestrator.start().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}