# 🚀 Final Project 8 Oceans - Backend

Backend microservices for job search and AI-powered features.

## 📦 Services

This backend includes two microservices:
- **Job Service** (Port 3001): Handles job search functionality via JobSpy API
- **OpenAI Service** (Port 3002): Provides AI features (resume review, project generation, interview prep)

## 🛠️ Technologies

- **Runtime:** Bun
- **Framework:** Express.js
- **AI:** OpenAI GPT-4
- **Deployment:** Railway (recommended)
- **Container:** Docker

## 🚀 Quick Start

### Local Development

1. **Clone the repository:**
```bash
git clone https://github.com/parsa964/final-project-8-oceans-backend.git
cd final-project-8-oceans-backend
```

2. **Install dependencies:**
```bash
bun install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your API keys
```

4. **Run the services:**
```bash
bun run dev  # Runs both services
# OR run individually:
bun run dev:jobs    # Job service only
bun run dev:openai  # OpenAI service only
```

## 🌐 Deployment to Railway

### Step 1: Fork/Clone this repo
```bash
git clone https://github.com/parsa964/final-project-8-oceans-backend.git
```

### Step 2: Deploy to Railway
1. Go to [Railway](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select this repository
4. Railway will auto-detect the configuration

### Step 3: Set Environment Variables
Add these in Railway's dashboard:
```env
# Required
OPENAI_API_KEY=your-openai-key
JOBSPY_API_URL=your-jobspy-url
CORS_ORIGINS=https://your-frontend.vercel.app

# Service Configuration
JOB_SERVICE_PORT=3001
OPENAI_SERVICE_PORT=3002
ENABLE_JOB_SERVICE=true
ENABLE_OPENAI_SERVICE=true
NODE_ENV=production
```

### Step 4: Get your URL
Railway will provide a URL like: `https://your-app.railway.app`

## 🔗 API Endpoints

### Job Service (`/api/v1/jobs`)
- `POST /search` - Search for jobs
- `POST /detail` - Get job details
- `POST /recommended` - Get recommended jobs
- `GET /locations/suggest` - Get location suggestions
- `GET /health` - Health check

### OpenAI Service (`/api/v1/ai`)
- `POST /resume/review` - Review resume
- `POST /resume/optimize` - Optimize resume for job
- `POST /project/generate` - Generate project ideas
- `POST /interview/questions` - Get interview questions
- `POST /leetcode/generate` - Generate LeetCode problems
- `GET /health` - Health check

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `JOBSPY_API_URL` | JobSpy API endpoint | Yes |
| `CORS_ORIGINS` | Allowed origins (comma-separated) | Yes |
| `JOB_SERVICE_PORT` | Port for job service | No (default: 3001) |
| `OPENAI_SERVICE_PORT` | Port for OpenAI service | No (default: 3002) |
| `ENABLE_JOB_SERVICE` | Enable job service | No (default: true) |
| `ENABLE_OPENAI_SERVICE` | Enable OpenAI service | No (default: true) |

## 🐳 Docker Deployment

```bash
# Build the image
docker build -t backend .

# Run the container
docker run -p 3001:3001 -p 3002:3002 \
  -e OPENAI_API_KEY=your-key \
  -e JOBSPY_API_URL=your-url \
  -e CORS_ORIGINS=your-frontend-url \
  backend
```

## 📊 Testing

```bash
# Run all tests
bun test

# Run specific test suites
bun test:unit
bun test:integration
bun test:coverage
```

## 🤝 Frontend Integration

Update your frontend's environment variables:
```env
# In frontend/.env.production
VITE_JOB_SERVICE_URL=https://your-backend.railway.app/api/v1/jobs
VITE_OPENAI_SERVICE_URL=https://your-backend.railway.app/api/v1/ai
```

## 📝 License

Private repository - All rights reserved

## 🆘 Support

For issues or questions, please open an issue in this repository.

## 🔗 Related Repositories

- [Frontend Repository](https://github.com/CMPT-276-SUMMER-2025/final-project-8-oceans)

---

Built with ❤️ by Team 8 Oceans