# Backend API with LinkedIn Integration

This backend service provides comprehensive job management functionality through **LinkedIn's Talent Solutions API** integration.

## 🔗 LinkedIn API Integration

This service integrates with the official [LinkedIn Talent Solutions API](https://learn.microsoft.com/en-us/linkedin/) to provide:

- **Job Search**: Search LinkedIn's job database with advanced filtering
- **Job Details**: Get detailed information about specific jobs  
- **Job Posting**: Post new job listings to LinkedIn
- **Job Management**: Update job status and manage applications
- **Recommendations**: Get personalized job recommendations
- **OAuth Authentication**: Secure LinkedIn API access via OAuth 2.0

## 📋 Prerequisites

### LinkedIn API Access

1. **LinkedIn Developer Account**: Create account at [LinkedIn Developer Portal](https://developer.linkedin.com/)
2. **App Registration**: Register your application for Talent Solutions access
3. **Client Credentials**: Obtain Client ID and Client Secret from your LinkedIn app
4. **Required Scopes**: 
   - `r_basicprofile`
   - `r_organization_social` 
   - `w_organization_social`
   - `rw_jobs`

### Environment Setup

Create a `.env` file in the project root:

```bash
# LinkedIn API Configuration (OAuth 2.0)
LINKEDIN_CLIENT_ID=86oc01fwxhwuvi
LINKEDIN_CLIENT_SECRET=WPL_AP1.nd1BjpG67NgO2fW3.V2zV1w==

# Service Configuration  
ENABLE_JOB_SERVICE=true
ENABLE_OPENAI_SERVICE=true

# Port Configuration
JOB_SERVICE_PORT=3001
OPENAI_SERVICE_PORT=3002

# Environment
NODE_ENV=development
```

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
bun install

# Start the services
bun run dev

# Start only job service
bun run dev:jobs

# Start only OpenAI service  
bun run dev:openai
```

### LinkedIn OAuth Flow

#### 1. Get Authorization URL
```bash
curl -X GET "http://localhost:3001/api/v1/jobs/auth/linkedin?redirect_uri=http://localhost:3001/callback&state=mystate"
```

#### 2. Handle OAuth Callback
```bash
curl -X POST http://localhost:3001/api/v1/jobs/auth/linkedin/callback \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "req-auth-123",
    "timestamp": "2024-01-01T00:00:00Z", 
    "service": "linkedin-oauth",
    "data": {
      "code": "authorization_code_from_linkedin",
      "redirect_uri": "http://localhost:3001/callback"
    }
  }'
```

### Validate LinkedIn Connection

```bash
curl -X GET http://localhost:3001/api/v1/jobs/linkedin/validate
```

## 📚 API Endpoints

### Base URL: `http://localhost:3001/api/v1/jobs`

### OAuth Endpoints

#### Get LinkedIn Authorization URL
**GET** `/auth/linkedin?redirect_uri=<uri>&state=<state>`

Generates LinkedIn OAuth authorization URL.

**Response:**
```json
{
  "status": {
    "code": 200,
    "message": "Success"
  },
  "data": {
    "authUrl": "https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=...",
    "message": "LinkedIn authorization URL generated successfully"
  }
}
```

#### Handle OAuth Callback
**POST** `/auth/linkedin/callback`

Exchange authorization code for access token.

```json
{
  "requestId": "req-auth-123",
  "timestamp": "2024-01-01T00:00:00Z",
  "service": "linkedin-oauth", 
  "data": {
    "code": "authorization_code_from_linkedin",
    "redirect_uri": "http://localhost:3001/callback"
  }
}
```

**Response:**
```json
{
  "status": {
    "code": 200,
    "message": "Success"
  },
  "data": {
    "token": {
      "access_token": "access_token_here",
      "expires_in": 5184000,
      "scope": "r_basicprofile w_organization_social rw_jobs",
      "token_type": "Bearer"
    },
    "message": "LinkedIn authentication successful"
  }
}
```

### 1. Job Search
**POST** `/search`

Search LinkedIn jobs with advanced filtering.

```json
{
  "requestId": "req-123",
  "timestamp": "2024-01-01T00:00:00Z",
  "service": "job-search",
  "data": {
    "query": "software engineer",
    "filters": {
      "type": ["full_time"],
      "experience": ["mid", "senior"],
      "location": ["San Francisco"],
      "remote": true,
      "tags": ["JavaScript", "React"]
    },
    "pagination": {
      "page": 1,
      "limit": 25,
      "sortBy": "date",
      "sortOrder": "desc"
    }
  }
}
```

**Response:**
```json
{
  "status": {
    "code": 200,
    "message": "Success"
  },
  "data": {
    "jobs": [
      {
        "id": "linkedin-job-id",
        "title": "Senior Software Engineer",
        "company": "Tech Company",
        "location": "San Francisco, CA",
        "description": "Job description...",
        "requirements": ["5+ years experience", "React expertise"],
        "type": "full_time",
        "experience": "senior",
        "postedDate": "2024-01-01T00:00:00Z",
        "tags": ["JavaScript", "React", "Node.js"],
        "remote": true
      }
    ],
    "total": 150,
    "page": 1,
    "totalPages": 6
  }
}
```

### 2. Job Details
**POST** `/detail`

Get detailed information about a specific job.

```json
{
  "requestId": "req-124",
  "timestamp": "2024-01-01T00:00:00Z",
  "service": "job-detail",
  "data": {
    "jobId": "linkedin-job-id-here"
  }
}
```

### 3. Recommended Jobs
**POST** `/recommended`

Get personalized job recommendations.

```json
{
  "requestId": "req-125",
  "timestamp": "2024-01-01T00:00:00Z",
  "service": "job-recommendations",
  "data": {
    "userId": "user-123"
  }
}
```

### 4. Post Job
**POST** `/post`

Post a new job to LinkedIn.

```json
{
  "requestId": "req-126",
  "timestamp": "2024-01-01T00:00:00Z",
  "service": "job-post",
  "data": {
    "author": "urn:li:company:123456",
    "lifecycleState": "OPEN",
    "title": "Senior Software Engineer", 
    "description": "We are looking for...",
    "location": {
      "countryCode": "US",
      "city": "San Francisco",
      "region": "CA"
    },
    "jobFunction": {
      "function": "eng"
    },
    "employmentStatus": "FULL_TIME",
    "jobSeniority": "MID_SENIOR",
    "industries": ["technology"]
  }
}
```

### 5. Update Job Status
**POST** `/status`

Update the status of a posted job.

```json
{
  "requestId": "req-127",
  "timestamp": "2024-01-01T00:00:00Z",
  "service": "job-status",
  "data": {
    "jobId": "linkedin-job-id",
    "status": "CLOSED"
  }
}
```

### 6. Get Job Applications
**POST** `/applications`

Get applications for a specific job.

```json
{
  "requestId": "req-128", 
  "timestamp": "2024-01-01T00:00:00Z",
  "service": "job-applications",
  "data": {
    "jobId": "linkedin-job-id"
  }
}
```

### 7. Validate LinkedIn Connection
**GET** `/linkedin/validate`

Check if LinkedIn API connection is working.

## 🔧 Configuration

### Job Types
- `full_time`: Full-time position
- `part_time`: Part-time position  
- `contract`: Contract/freelance work
- `internship`: Internship position
- `freelance`: Freelance work

### Experience Levels
- `entry`: Entry level (0-1 years)
- `junior`: Junior level (1-3 years)
- `mid`: Mid level (3-5 years)
- `senior`: Senior level (5-8 years)
- `lead`: Lead level (8+ years)
- `executive`: Executive level

### Sort Options
- `date`: Sort by posted date
- `relevance`: Sort by relevance to query

## 🛠 Development

### Architecture

The backend follows a microservices architecture:

```
backend/
├── src/
│   ├── modules/
│   │   ├── jobs/           # Job service module
│   │   │   ├── routes/     # API route handlers
│   │   │   ├── services/   # Business logic
│   │   │   └── types/      # TypeScript interfaces
│   │   └── openai/         # OpenAI service module
│   └── utils/              # Shared utilities
├── index.ts                # Main orchestrator
└── package.json
```

### Key Components

1. **LinkedInService**: Handles all LinkedIn API interactions and OAuth flow
2. **JobService**: Business logic layer for job operations
3. **JobHandler**: HTTP route handlers and request validation
4. **BaseHandler**: Shared HTTP server functionality

### OAuth 2.0 Flow

The service implements LinkedIn OAuth 2.0 with:

1. **Authorization Code Flow**: For user-authorized access
2. **Client Credentials Flow**: For application-only access (limited scope)
3. **Automatic Token Management**: Handles token expiry and refresh
4. **Fallback to Mock Data**: In development mode when API is unavailable

### Error Handling

The service includes comprehensive error handling:

- **Authentication errors** (401): Invalid LinkedIn token with auto-retry
- **Rate limiting** (429): API rate limits exceeded  
- **Server errors** (500): LinkedIn API server issues
- **Validation errors** (400): Invalid request format

### Adding New Features

1. Add new methods to `LinkedInService`
2. Implement business logic in `JobService` 
3. Create route handlers in `JobHandler`
4. Update type definitions in `jobTypes.ts`

## 📖 LinkedIn API Documentation

For detailed LinkedIn API documentation, visit:
- [LinkedIn API Overview](https://learn.microsoft.com/en-us/linkedin/)
- [Talent Solutions](https://learn.microsoft.com/en-us/linkedin/talent/)
- [Job Search API](https://learn.microsoft.com/en-us/linkedin/talent/job-search-api)
- [Job Posting API](https://learn.microsoft.com/en-us/linkedin/talent/job-posting-api)
- [OAuth 2.0 Authentication](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow)

## 🔒 Security

- OAuth 2.0 authentication with secure token management
- Environment variables for sensitive configuration
- Request validation prevents malformed data
- Error messages don't expose sensitive information
- Automatic token refresh and retry mechanisms

## 🚨 Rate Limits

LinkedIn API has rate limits. The service handles:
- Automatic retry with exponential backoff
- Rate limit detection and warnings
- Graceful degradation when limits are reached
- Development mode fallbacks with mock data

## 🧪 Development Mode

When `NODE_ENV=development`, the service provides:
- Mock data when LinkedIn API is unavailable
- Detailed error logging
- Fallback responses for testing
- Relaxed authentication requirements

## 📞 Support

For issues related to:
- **LinkedIn API**: Check [LinkedIn Developer Support](https://developer.linkedin.com/support)
- **Backend Service**: Review logs and error messages
- **Integration**: Validate environment variables and API tokens
- **OAuth Flow**: Ensure correct redirect URIs and scopes 