// Test data for backend testing
export const TEST_RESUME = `
John Doe
Software Engineer
Email: john.doe@example.com | Phone: (555) 123-4567
LinkedIn: linkedin.com/in/johndoe | GitHub: github.com/johndoe

SUMMARY
Experienced Full Stack Developer with 5+ years of experience building scalable web applications. 
Proficient in JavaScript, TypeScript, React, Node.js, and cloud technologies. Strong problem-solving 
skills and passion for creating efficient, user-friendly solutions.

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, Java, SQL
Frontend: React, Redux, Next.js, Vue.js, HTML5, CSS3, Tailwind CSS
Backend: Node.js, Express, NestJS, Django, Spring Boot
Databases: PostgreSQL, MongoDB, MySQL, Redis
Cloud & DevOps: AWS (EC2, S3, Lambda), Docker, Kubernetes, CI/CD, GitHub Actions
Tools: Git, Jira, Figma, Postman, VS Code

PROFESSIONAL EXPERIENCE

Senior Software Engineer | TechCorp Inc. | San Francisco, CA | 2021 - Present
• Led development of microservices architecture serving 1M+ daily active users
• Reduced API response time by 40% through optimization and caching strategies
• Mentored team of 5 junior developers and conducted code reviews
• Implemented CI/CD pipelines reducing deployment time from 2 hours to 15 minutes
• Built real-time notification system using WebSockets and Redis

Full Stack Developer | StartupXYZ | Remote | 2019 - 2021
• Developed e-commerce platform from scratch using React and Node.js
• Integrated payment processing with Stripe API handling $2M+ in transactions
• Implemented responsive design improving mobile conversion rate by 25%
• Built RESTful APIs and GraphQL endpoints for mobile applications
• Collaborated with UX team to improve user experience and accessibility

Junior Developer | WebDev Solutions | Boston, MA | 2018 - 2019
• Created dynamic web applications using React and Redux
• Developed and maintained REST APIs using Express.js
• Participated in agile development process and daily standups
• Fixed bugs and improved application performance
• Wrote unit tests achieving 80% code coverage

EDUCATION
Bachelor of Science in Computer Science | MIT | 2014 - 2018
GPA: 3.8/4.0
Relevant Coursework: Data Structures, Algorithms, Database Systems, Web Development

PROJECTS
Open Source Contribution - React Native Library
• Contributed to popular React Native UI library with 10k+ GitHub stars
• Fixed critical bug affecting iOS devices and improved documentation
• Pull request merged and included in v2.0 release

Personal Finance Tracker
• Built full-stack application for personal finance management
• Features include budget tracking, expense categorization, and data visualization
• Tech stack: Next.js, PostgreSQL, Chart.js, deployed on Vercel

CERTIFICATIONS
• AWS Certified Solutions Architect - Associate (2022)
• Google Cloud Professional Cloud Developer (2021)
`;

export const TEST_JOB_SEARCH_QUERY = "software engineer remote";
export const TEST_LOCATION = "United States";

// Helper to store job data between tests
export let savedJobData: any = null;
export let savedJobId: string | null = null;

export function saveJobData(job: any) {
  savedJobData = job;
  savedJobId = job.id || job.job_id || job.url;
}

export function getSavedJobData() {
  return { job: savedJobData, id: savedJobId };
}

// Test timeout settings
export const TEST_TIMEOUT = 60000; 
export const LONG_TEST_TIMEOUT = 120000; 