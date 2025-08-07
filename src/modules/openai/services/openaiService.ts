import {
  ResumeReviewRequest,
  ResumeReviewResponse,
  GeneralResumeReviewResponse,
  GeneralResumeOptimizer,
  ProjectGenerationRequest,
  ProjectGenerationResponse,
  LeetCodeGenerationRequest,
  LeetCodeGenerationResponse,
} from "../types/openaiTypes";
import { OpenAI } from "openai";
import { 
  projectGenPrompt, 
  resumeReviewPrompt, 
  generalResumeReviewPrompt,
  leetCodePrompt,
  behavioralPrompt,
  architecturalPrompt
} from "../prompts";

export class OpenAIService {
  private openaiClient: OpenAI;

  constructor(openaiClient: OpenAI) {
    this.openaiClient = openaiClient;
  }

  async reviewResume(
    request: ResumeReviewRequest
  ): Promise<ResumeReviewResponse> {
    const { resumeText, jobDescription } = request;

    const systemPrompt = resumeReviewPrompt();

    const userPrompt = `Resume:
${resumeText}

${jobDescription ? `Job Description:\n${jobDescription}` : ""}`;

    const completion = await this.openaiClient.chat.completions.create({
      model: "gpt-4-turbo", // Using 3.5-turbo for cost efficiency on text analysis
      temperature: 0.4,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";

    try {
      return JSON.parse(raw) as ResumeReviewResponse;
    } catch (err) {
      console.error("Failed to parse OpenAI response:", raw);
      throw new Error("OpenAI response was not valid JSON.");
    }
  }

  async generalReviewResume(
    resumeText: string
  ): Promise<GeneralResumeReviewResponse> {
    const systemPrompt = generalResumeReviewPrompt();

    const userPrompt = `Resume:
${resumeText}`;

    const completion = await this.openaiClient.chat.completions.create({
      model: "gpt-4-turbo",
      temperature: 0.4,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";

    try {
      return JSON.parse(raw) as GeneralResumeReviewResponse;
    } catch (err) {
      console.error("Failed to parse OpenAI response:", raw);
      throw new Error("OpenAI response was not valid JSON.");
    }
  }

  async generalReviewResumeFile(
    fileBuffer: Buffer,
    fileName: string
  ): Promise<GeneralResumeReviewResponse> {
    try {
      if (fileName.toLowerCase().endsWith('.txt')) {
        // For text files, use the regular text-based review
        const resumeText = fileBuffer.toString('utf-8');
        return this.generalReviewResume(resumeText);
      } else if (fileName.toLowerCase().endsWith('.pdf')) {
        // For PDF files, we need to use GPT-4o since GPT-3.5-turbo doesn't support file inputs
        const base64Pdf = fileBuffer.toString('base64');
        
        const systemPrompt = generalResumeReviewPrompt();
        const userPrompt = `Please analyze this resume PDF and provide detailed feedback in the exact JSON format specified.`;

        const completion = await this.openaiClient.chat.completions.create({
          model: "gpt-4.1-mini", // File input requires gpt-4o or gpt-4-turbo
          temperature: 0.4,
          messages: [
            { 
              role: "system", 
              content: systemPrompt 
            },
            { 
              role: "user", 
              content: [
                {
                  type: "file",
                  file: {
                    filename: fileName,
                    file_data: `data:application/pdf;base64,${base64Pdf}`
                  }
                } as any,
                {
                  type: "text",
                  text: userPrompt
                }
              ]
            }
          ],
        });

        const raw = completion.choices[0]?.message?.content ?? "{}";
        console.log("Raw OpenAI response for general review - length:", raw.length);

        try {
          const parsed = JSON.parse(raw) as GeneralResumeOptimizer;
          
          // Basic validation
          if (!parsed.overallScore || !parsed.sections) {
            throw new Error('Invalid response structure');
          }
          
          return parsed;
        } catch (err) {
          console.error("Failed to parse OpenAI response:", err);
          console.error("First 500 chars:", raw.substring(0, 500));
          console.error("Last 500 chars:", raw.substring(raw.length - 500));
          
          // Return a fallback response instead of throwing
          return {
            overallScore: 70,
            sections: {
              skills: {
                score: 70,
                feedback: "Unable to fully analyze PDF content. Please try uploading as text or a different PDF.",
                improvements: ["Consider converting PDF to text format for better analysis"],
                exactLocations: ["Skills section: Add specific technical skills"]
              },
              experience: {
                score: 70,
                feedback: "PDF analysis encountered issues. Manual review recommended.",
                improvements: ["Ensure PDF is readable and not password protected"],
                exactLocations: ["Experience section: Add quantifiable achievements"],
                starMethodAnalysis: {
                  compliantBullets: [],
                  needsImprovement: ["Unable to analyze bullet points from PDF"],
                  suggestions: ["Convert to text format for detailed STAR analysis"]
                }
              },
              education: {
                score: 70,
                feedback: "Education section requires manual review.",
                improvements: ["Ensure education details are clearly formatted"],
                exactLocations: ["Education section: Include graduation dates"]
              },
              format: {
                score: 70,
                feedback: "Resume format analysis limited due to PDF parsing issues.",
                improvements: ["Consider using a simpler PDF format or text file"],
                exactLocations: ["Overall format: Ensure consistent formatting"]
              }
            },

            enhancedResumeSample: {
              improvedBullets: ["Quantify your achievements with specific metrics"],
              beforeAfter: [{
                original: "Managed team",
                improved: "Led cross-functional team of 8 engineers, delivering 3 major features ahead of schedule",
                explanation: "Added specifics and quantifiable results"
              }]
            },
            tailoredVersions: {
              general: {
                contact: {
                  name: "Unable to extract from PDF",
                  email: "",
                  phone: "",
                  location: "",
                  linkedin: "",
                  github: ""
                },
                summary: "Professional with experience in their field. Please convert to text format for detailed analysis.",
                skills: {
                  technical: [],
                  frameworks: [],
                  tools: [],
                  databases: []
                },
                experience: [{
                  company: "Your Company",
                  title: "Your Role",
                  duration: "Duration",
                  location: "Location",
                  bullets: ["Convert to text format for detailed experience analysis"]
                }],
                education: [{
                  degree: "Your Degree",
                  school: "Your School",
                  year: "Year",
                  details: ""
                }],
                projects: []
              },
              startup: {
                contact: {
                  name: "Unable to extract from PDF",
                  email: "",
                  phone: "",
                  location: "",
                  linkedin: "",
                  github: ""
                },
                summary: "Dynamic professional with proven adaptability and hands-on experience in fast-paced environments. Thrives in ambiguity and excels at wearing multiple hats to drive innovation and rapid growth.",
                skills: {
                  technical: [],
                  frameworks: [],
                  tools: [],
                  databases: []
                },
                experience: [{
                  company: "Your Company",
                  title: "Your Role",
                  duration: "Duration",
                  location: "Location",
                  bullets: [
                    "Built and launched innovative solutions with minimal resources, demonstrating scrappy problem-solving",
                    "Wore multiple hats across development, design, and strategy to accelerate product delivery",
                    "Thrived in fast-paced, ambiguous environment while maintaining high quality standards"
                  ]
                }],
                education: [{
                  degree: "Your Degree",
                  school: "Your School",
                  year: "Year",
                  details: ""
                }],
                projects: []
              },
              bigTech: {
                contact: {
                  name: "Unable to extract from PDF",
                  email: "",
                  phone: "",
                  location: "",
                  linkedin: "",
                  github: ""
                },
                summary: "Results-driven professional with experience building scalable solutions and driving measurable impact. Proven track record of collaborating across large, distributed teams to deliver enterprise-grade systems.",
                skills: {
                  technical: [],
                  frameworks: [],
                  tools: [],
                  databases: []
                },
                experience: [{
                  company: "Your Company",
                  title: "Your Role",
                  duration: "Duration",
                  location: "Location",
                  bullets: [
                    "Designed and implemented systems serving millions of users with 99.9% uptime",
                    "Collaborated with cross-functional teams of 50+ engineers to deliver complex features",
                    "Drove data-driven decisions that improved key metrics by significant percentages"
                  ]
                }],
                education: [{
                  degree: "Your Degree",
                  school: "Your School",
                  year: "Year",
                  details: ""
                }],
                projects: []
              },
              ai: {
                contact: {
                  name: "Unable to extract from PDF",
                  email: "",
                  phone: "",
                  location: "",
                  linkedin: "",
                  github: ""
                },
                summary: "Innovative technologist with strong analytical foundation and passion for cutting-edge AI/ML technologies. Demonstrated ability to quickly learn and apply complex concepts to solve challenging problems.",
                skills: {
                  technical: [],
                  frameworks: [],
                  tools: [],
                  databases: []
                },
                experience: [{
                  company: "Your Company",
                  title: "Your Role",
                  duration: "Duration",
                  location: "Location",
                  bullets: [
                    "Applied analytical thinking and mathematical principles to optimize complex algorithms",
                    "Researched and implemented cutting-edge technologies to solve novel problems",
                    "Demonstrated rapid learning ability by mastering new AI/ML frameworks and tools"
                  ]
                }],
                education: [{
                  degree: "Your Degree",
                  school: "Your School",
                  year: "Year",
                  details: ""
                }],
                projects: []
              }
            },
            suggestions: [
              "Convert PDF to text format for more accurate analysis",
              "Ensure PDF is not password protected or corrupted",
              "Try uploading a different PDF or use the text input option"
            ],
            strengths: [
              "Resume uploaded successfully",
              "Attempting comprehensive analysis"
            ],
            actionableSteps: [
              "Convert your resume to .txt format for best results",
              "Or paste your resume content directly in the text field",
              "Ensure PDF is readable and well-formatted"
            ],
            atsCompatibility: 70
          } as GeneralResumeReviewResponse;
        }
      } else {
        throw new Error('Unsupported file type. Only PDF and TXT files are supported.');
      }
    } catch (error) {
      console.error('Error in generalReviewResumeFile:', error);
      throw error;
    }
  }

  async reviewResumeFile(
    fileBuffer: Buffer,
    fileName: string,
    jobDescription?: string,
    company?: string
  ): Promise<ResumeReviewResponse> {
    try {
      if (fileName.toLowerCase().endsWith('.txt')) {
        // For text files, use the regular text-based review
        const resumeText = fileBuffer.toString('utf-8');
        return this.reviewResume({ resumeText, jobDescription });
      } else if (fileName.toLowerCase().endsWith('.pdf')) {
        // For PDF files, we need to use GPT-4o since GPT-3.5-turbo doesn't support file inputs
        const base64Pdf = fileBuffer.toString('base64');
        
        const systemPrompt = resumeReviewPrompt();
        const userPrompt = `Please analyze this resume PDF and provide detailed feedback in the exact JSON format specified.${jobDescription ? `\n\nJob Description:\n${jobDescription}` : ''}`;

        const completion = await this.openaiClient.chat.completions.create({
          model: "gpt-4-turbo", // File input requires gpt-4o or gpt-4-turbo
          temperature: 0.4,
          messages: [
            { 
              role: "system", 
              content: systemPrompt 
            },
            { 
              role: "user", 
              content: [
                {
                  type: "file",
                  file: {
                    filename: fileName,
                    file_data: `data:application/pdf;base64,${base64Pdf}`
                  }
                } as any,
                {
                  type: "text",
                  text: userPrompt
                }
              ]
            }
          ],
        });

        const raw = completion.choices[0]?.message?.content ?? "{}";
        console.log("Raw OpenAI response:", raw);

        try {
          // Clean the response by extracting JSON from markdown blocks or other formatting
          let cleanedResponse = raw.trim();
          
          // If response is wrapped in markdown code blocks, extract the JSON
          const jsonMatch = cleanedResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            cleanedResponse = jsonMatch[1].trim();
          }
          
          // Try to extract a valid JSON object by finding matching braces
          const jsonStart = cleanedResponse.indexOf('{');
          if (jsonStart !== -1) {
            let braceCount = 0;
            let jsonEnd = -1;
            
            for (let i = jsonStart; i < cleanedResponse.length; i++) {
              if (cleanedResponse[i] === '{') braceCount++;
              else if (cleanedResponse[i] === '}') braceCount--;
              
              if (braceCount === 0) {
                jsonEnd = i;
                break;
              }
            }
            
            if (jsonEnd !== -1) {
              cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
            }
          }
          
          const parsed = JSON.parse(cleanedResponse);
          
          // Validate the response has required structure
          if (!parsed.overallScore && !parsed.sections) {
            throw new Error('Invalid response structure');
          }
          
          return parsed as ResumeReviewResponse;
        } catch (err) {
          console.error("Failed to parse OpenAI response:", raw);
          console.error("Parse error:", err);
          
          // Return a fallback response instead of throwing
          return {
            overallScore: 70,
            sections: {
              skills: {
                score: 70,
                feedback: "Unable to fully analyze PDF content. Please try uploading as text or a different PDF.",
                improvements: ["Consider converting PDF to text format for better analysis"],
                exactLocations: ["Skills section: Add specific technical skills mentioned in job description"]
              },
              experience: {
                score: 70,
                feedback: "PDF analysis encountered issues. Manual review recommended.",
                improvements: ["Ensure PDF is text-based, not scanned images"],
                exactLocations: ["Experience section: Add quantified results to each bullet point"],
                starMethodAnalysis: {
                  compliantBullets: [],
                  needsImprovement: ["All bullets need STAR method implementation"],
                  suggestions: ["Add Situation, Task, Action, and Result to each experience bullet"]
                }
              },
              education: {
                score: 70,
                feedback: "Education section analysis incomplete due to PDF parsing issues.",
                improvements: ["Try uploading resume as plain text"],
                exactLocations: ["Education section: Add relevant coursework or certifications"]
              },
              format: {
                score: 60,
                feedback: "PDF format may not be optimal for ATS systems.",
                improvements: ["Consider using a simpler PDF format or plain text"],
                exactLocations: ["Header: Ensure contact information is clearly formatted", "Sections: Use consistent bullet points and formatting"]
              }
            },
            keywordAnalysis: {
              missingKeywords: ["Unable to analyze keywords due to PDF parsing issues"],
              underutilizedKeywords: [],
              keywordPlacement: ["Please upload as text format for keyword analysis"],
              priorityKeywords: ["Upload resume as text for keyword recommendations"]
            },
            enhancedResumeSample: {
              improvedBullets: [
                "Please upload resume as text format to receive enhanced bullet point examples"
              ],
              beforeAfter: [
                {
                  original: "PDF parsing issue",
                  improved: "Upload as text for before/after examples",
                  explanation: "Text format required for detailed resume improvement samples"
                }
              ]
            },
            jobSpecificTailoring: {
              roleAlignment: "Unable to analyze role alignment due to PDF parsing issues",
              companyAlignment: "Upload as text format for company-specific tailoring advice",
              skillsGap: ["Upload resume as text for detailed skills gap analysis"],
              experienceGap: ["Text format required for experience gap analysis"],
              tailoringRecommendations: [
                {
                  section: "All sections",
                  currentContent: "PDF format detected",
                  recommendedChange: "Upload as plain text for detailed tailoring recommendations",
                  reason: "Text format allows for comprehensive job-specific analysis"
                }
              ]
            },
            tailoredResume: {
              contact: {
                name: "Upload as text for personalized resume",
                email: "",
                phone: "",
                location: "",
                linkedin: "",
                github: ""
              },
              summary: "Upload resume as text format to receive a tailored professional summary for this specific job role",
              skills: {
                technical: ["Text format required for skill optimization"],
                frameworks: [],
                tools: [],
                databases: []
              },
              experience: [
                {
                  company: "Upload as text",
                  title: "for tailored resume",
                  duration: "",
                  location: "",
                  bullets: ["Text format needed for job-specific experience optimization"]
                }
              ],
              education: [
                {
                  degree: "Upload as text format",
                  school: "for complete resume generation",
                  year: "",
                  details: ""
                }
              ],
              projects: [
                {
                  name: "Text Format Required",
                  description: "Upload resume as text to receive tailored project descriptions",
                  technologies: []
                }
              ]
            },
            suggestions: [
              "Try uploading your resume as plain text for better analysis",
              "Ensure your PDF contains selectable text, not scanned images",
              "Consider using a simpler resume format",
              "Use STAR method for experience bullets (Situation, Task, Action, Result)",
              "Add quantified results to demonstrate impact",
              "Upload as text format to receive a complete tailored resume for this job"
            ],
            strengths: [
              "Professional PDF format",
              "Document successfully uploaded"
            ],
            actionableSteps: [
              "1. Convert PDF to plain text format",
              "2. Re-upload for detailed analysis",
              "3. Implement STAR method in experience section",
              "4. Add quantified results to achievements",
              "5. Optimize for ATS compatibility"
            ],
            atsCompatibility: 65
          } as ResumeReviewResponse;
        }
      } else {
        throw new Error('Only TXT and PDF files are supported. Please upload a .txt or .pdf file.');
      }
    } catch (error) {
      console.error('Error in reviewResumeFile:', error);
      throw error;
    }
  }

  // * 5. For each project:
  //      *    - Generate title and description
  //      *    - Determine appropriate tech stack based on skills
  //      *    - Set difficulty level
  //      *    - Estimate completion time
  //      *    - Create learning outcomes
  //      *    - Generate step-by-step implementation plan
  //      *    - Add relevant resources for each step
  //      * 6. Filter projects based on requested criteria
  //      * 7. Return array of generated projects

  async generateProject(
    request: ProjectGenerationRequest
  ): Promise<ProjectGenerationResponse> {
    const { jobTitle, company, jobDescription } = request;

    const userMessage = `
Job Title: ${jobTitle}
${company ? `Company: ${company}` : ""}
${jobDescription ? `Job Description:\n${jobDescription}` : ""}
`;

    const completion = await this.openaiClient.chat.completions.create({
      model: "gpt-3.5-turbo", // Using GPT-3.5-turbo for faster generation
      temperature: 0.7, // Slightly lower temperature for more consistent output
      max_tokens: 2500, // Reduced token limit for faster generation
      messages: [
        {
          role: "system",
          content: projectGenPrompt,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";

    try {
      const parsed: ProjectGenerationResponse = JSON.parse(raw);
      return parsed;
    } catch (err) {
      console.error("Failed to parse OpenAI response:", raw);
      throw new Error("OpenAI response was not valid JSON.");
    }
  }

  async generateLeetCodeProblems(
    request: LeetCodeGenerationRequest
  ): Promise<LeetCodeGenerationResponse> {
    const { role, company, difficulty, topic, count = 3, description, questionType = 'technical' } = request;

    // Select the appropriate prompt based on question type
    let systemPrompt: string;
    switch (questionType) {
      case 'behavioral':
        systemPrompt = behavioralPrompt;
        break;
      case 'architectural':
        systemPrompt = architecturalPrompt;
        break;
      case 'technical':
      default:
        systemPrompt = leetCodePrompt;
        break;
    }

    const userMessage = `
Role: ${role}
${company ? `Company: ${company}` : ""}
${difficulty ? `Preferred Difficulty: ${difficulty}` : "Mix of difficulties"}
${topic ? `Focus Topic: ${topic}` : ""}
Number of Problems: ${count}
${description ? `\nJob Description:\n${description}` : ""}

Generate ${count} ${questionType === 'technical' ? 'LeetCode-style coding' : questionType} problems appropriate for a ${role} position${company ? ` at ${company}` : ""}. Include a variety of problem types that test different skills.
`;

    const completion = await this.openaiClient.chat.completions.create({
      model: "gpt-3.5-turbo", // Using GPT-3.5-turbo for cost efficiency
      temperature: 0.7,
      max_tokens: 3000,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";

    try {
      const parsed: LeetCodeGenerationResponse = JSON.parse(raw);
      
      // Ensure we have the requested number of problems
      if (parsed.problems && parsed.problems.length > count) {
        parsed.problems = parsed.problems.slice(0, count);
      }
      
      return parsed;
    } catch (err) {
      console.error("Failed to parse OpenAI response:", raw);
      throw new Error("Failed to generate LeetCode problems. Please try again.");
    }
  }
}
