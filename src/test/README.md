# Backend Testing Suite

## Overview
This comprehensive testing suite provides unit and integration tests for all backend services, ensuring robust functionality across the job search, resume optimization, and AI-powered features.

## Test Structure

### Unit Tests
- **Job Service Tests** (`modules/jobs/tests/jobService.test.ts`)
  - Job search functionality with multiple job sites
  - Job details retrieval
  - LinkedIn job search
  - Error handling

- **OpenAI Service Tests** (`modules/openai/tests/openaiService.test.ts`)
  - Resume optimization
  - Job matching with scoring
  - Project generation
  - LeetCode question generation
  - Cover letter creation
  - Interview preparation

### Integration Tests (`test/integration.test.ts`)
- End-to-end job application workflow
- Skill development pipeline
- Job matching and comparison
- Complete application pipeline with all features

## Key Features

### Real API Testing
- All tests use **real API calls** to external services
- No mocked data - tests against actual job postings
- Dynamic test data based on current job market

### Test Data
- Uses a comprehensive test resume (`testData.ts`)
- Automatically searches for real jobs
- Saves job data between tests for continuity
- Tests with actual job descriptions from Indeed, LinkedIn, etc.

## Running Tests

### Prerequisites
1. Ensure backend services are configured:
   ```bash
   cd backend
   cp .env.example .env
   # Add your API keys to .env file
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

### Running All Tests
```bash
# Run all tests with automatic service startup
bun run test:all

# Or manually start services and run tests
bun run start  # In one terminal
bun test       # In another terminal
```

### Running Specific Test Suites
```bash
# Run only unit tests
bun test:unit

# Run only integration tests
bun test:integration

# Run with coverage report
bun test:coverage

# Run specific test file
bun test jobService.test.ts
```

## Test Coverage

The test suite covers:

1. **Job Search Features**
   - Multiple job sites (Indeed, LinkedIn)
   - Various search parameters
   - Location-based searches
   - Remote job filtering

2. **Resume Optimization**
   - Tailored optimization for specific jobs
   - Keyword matching
   - ATS optimization suggestions
   - Skills gap analysis

3. **Job Matching**
   - Multi-job comparison
   - Scoring algorithm
   - Match reasoning
   - Recommendations

4. **Project Generation**
   - Skill-appropriate projects
   - Implementation steps
   - Technology recommendations
   - Portfolio building

5. **LeetCode Practice**
   - Difficulty-based questions
   - Topic-specific problems
   - Solution hints
   - Progressive difficulty

6. **Application Materials**
   - Cover letter generation
   - Interview Q&A preparation
   - Company-specific customization

## Test Timeouts

- Standard tests: 30 seconds
- Complex operations: 60 seconds
- Integration tests: Up to 3 minutes

## Validation

Each test includes comprehensive validation:
- Response structure verification
- Data type checking
- Content validation
- Error handling verification

## Example Test Output

```
🚀 Starting Backend Test Suite
================================

📦 Starting backend services...
✅ Services started

📝 Running Unit Tests...
------------------------
✓ Unit: should search for jobs with valid query (2341ms)
✓ Unit: should handle different job sites (5123ms)
✓ Unit: should optimize resume for a specific job (3456ms)
✓ Unit: should generate projects based on job requirements (2891ms)

📝 Running Integration Tests...
--------------------------------
✓ Integration: Search for real jobs (1823ms)
✓ Integration: Complete application workflow with all features (12456ms)

📊 Running All Tests with Coverage...
--------------------------------------
Coverage: 92.3%

✅ All tests completed successfully!
```

## Troubleshooting

### Common Issues

1. **API Rate Limiting**
   - Some tests may fail due to rate limits
   - Wait a few minutes and retry
   - Consider using API keys with higher limits

2. **Service Startup**
   - Ensure both job and OpenAI services start
   - Check `.env` file for correct API keys
   - Verify ports 3001 and 3002 are available

3. **Test Timeouts**
   - Increase timeout values in `testData.ts` if needed
   - Check network connection
   - Verify external APIs are accessible

## CI/CD Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Backend Tests
  run: |
    cd backend
    bun install
    bun test:coverage
```

## Contributing

When adding new features:
1. Add corresponding unit tests
2. Update integration tests if needed
3. Ensure all tests pass before committing
4. Maintain test coverage above 80%