// JobSpy API Response Models
export interface JobSpySalaryRange {
    min: number | null;
    max: number | null;
    currency: string;
    period: string | null;
}

export interface JobSpyJob {
    job_id: string;
    title: string;
    company: string;
    location: string | null;
    description: string | null;
    application_url: string;
    posted_date: string | null;
    salary_range: JobSpySalaryRange | null;
    is_remote: boolean;
    tech_keywords: string[] | null;
    source: 'linkedin' | 'indeed';
}

export interface JobSpySearchResponse {
    jobs: JobSpyJob[];
    total_count: number;
    page_size: number;
    page_offset: number;
    has_more: boolean;
    search_params: Record<string, any>;
}

export interface JobSpyDetailResponse {
    job_id: string;
    title: string;
    company: string;
    description: string | null;
    application_url: string;
    company_url: string | null;
    location: string | null;
    posted_date: string | null;
    salary_range: JobSpySalaryRange | null;
    is_remote: boolean;
    tech_keywords: string[] | null;
    job_type: string | null;
    experience_level: string | null;
    source: string;
}

// Internal Models (for frontend compatibility)
export interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    applicationUrl: string;
    salary?: {
        min: number | null;
        max: number | null;
        currency: string;
        period?: string | null;
    };
    type?: string;
    experience?: string;
    postedDate: string;
    techKeywords: string[];
    remote: boolean;
    source: 'linkedin' | 'indeed';
}

// Request Models
export interface JobSearchRequest {
    location?: string;
    field?: string;
    search?: string;
    remote?: boolean;
    minSalary?: number;
    maxSalary?: number;
    company?: string;
    experienceLevel?: string;
    postedWithinDays?: number;
    limit?: number;
    offset?: number;
}

export interface JobSearchResponse {
    jobs: Job[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

export interface JobDetailRequest {
    jobId: string;
}

// Helper function to clean job descriptions
function cleanJobDescription(description: string): string {
    if (!description) return description;
    
    let cleaned = description;
    

    
    // First, decode HTML entities
    cleaned = cleaned
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/&mdash;/g, '—')
        .replace(/&ndash;/g, '–')
        .replace(/&rsquo;/g, "'")
        .replace(/&lsquo;/g, "'")
        .replace(/&rdquo;/g, '"')
        .replace(/&ldquo;/g, '"');
    
    // Remove unnecessary escape characters - comprehensive list
    cleaned = cleaned
        .replace(/\\-/g, '-') // Unescape hyphens
        .replace(/\\\+/g, '+') // Unescape plus signs
        .replace(/\\\*/g, '*') // Unescape asterisks
        .replace(/\\\./g, '.') // Unescape periods
        .replace(/\\\(/g, '(') // Unescape parentheses
        .replace(/\\\)/g, ')') // Unescape parentheses
        .replace(/\\\[/g, '[') // Unescape brackets
        .replace(/\\\]/g, ']') // Unescape brackets
        .replace(/\\\{/g, '{') // Unescape braces
        .replace(/\\\}/g, '}') // Unescape braces
        .replace(/\\\|/g, '|') // Unescape pipes
        .replace(/\\\//g, '/') // Unescape forward slashes
        .replace(/\\&/g, '&') // Unescape ampersands
        .replace(/\\%/g, '%') // Unescape percent
        .replace(/\\#/g, '#') // Unescape hash
        .replace(/\\@/g, '@') // Unescape at
        .replace(/\\!/g, '!') // Unescape exclamation
        .replace(/\\~/g, '~') // Unescape tilde
        .replace(/\\'/g, "'") // Unescape single quote
        .replace(/\\"/g, '"') // Unescape double quote
        .replace(/\\(\d)/g, '$1') // Unescape numbers like \404 -> 404
        .replace(/\\([a-zA-Z])/g, '$1') // Unescape letters if accidentally escaped
        .replace(/\\\\/g, '\\') // Unescape backslashes (do this last)
        .replace(/\s*#\s*$/gm, '') // Remove trailing # symbols
        .replace(/^#\s+/gm, '') // Remove leading # symbols (not markdown headers)
        .replace(/\s+#\s+/g, ' '); // Replace standalone # with space
    
    // Remove HTML tags but preserve line breaks from <br> and <p> tags
    cleaned = cleaned
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<p[^>]*>/gi, '')
        .replace(/<[^>]*>/g, '');
    
    // Remove everything before "JOB DESCRIPTION" or "Description" (case insensitive)
    const jobDescIndex = cleaned.search(/job\s+description/i);
    const descIndex = cleaned.toLowerCase().indexOf('description');
    
    if (jobDescIndex > 0 && jobDescIndex < 200) {
        cleaned = cleaned.substring(jobDescIndex);
    } else if (descIndex > 0 && descIndex < 200) {
        cleaned = cleaned.substring(descIndex);
    }
    
    // Remove unwanted sections and phrases
    const unwantedSections = [
        /\bsubmit\s+resume\b/gi,
        /\bapply\s+now\b/gi,
        /\bclick\s+to\s+apply\b/gi,
        /\bapply\s+for\s+this\s+position\b/gi,
        /\bapply\s+online\b/gi,
        /\bsubmit\s+application\b/gi,
        /\bsend\s+resume\b/gi,
        /\bemail\s+resume\b/gi,
        /\bupload\s+resume\b/gi,
        /\battach\s+resume\b/gi,
        /\bcompany\s+overview\b/gi,
        /\babout\s+us\b/gi,
        /\bwho\s+we\s+are\b/gi,
        /\bour\s+company\b/gi,
        /\bjob\s+overview\b/gi,
        /\bposition\s+overview\b/gi,
        /\brole\s+overview\b/gi,
        /\beoe\s+statement\b/gi,
        /\bequal\s+opportunity\s+employer\b/gi
    ];
    
    unwantedSections.forEach(section => {
        cleaned = cleaned.replace(section, '');
    });
    
    // Remove ALL types of decorative lines and separators (comprehensive)
    cleaned = cleaned
        .replace(/^[-=_*~+#]{3,}\s*$/gm, '') // Remove lines of just symbols (3 or more)
        .replace(/^[-=_*~+#\s]{3,}$/gm, '') // Remove lines of symbols with spaces
        .replace(/^\.{3,}\s*$/gm, '') // Remove lines of dots
        .replace(/^-{2,}\s*-{2,}\s*$/gm, '') // Remove broken dash lines
        .replace(/^\*\s*\*\s*\*+\s*$/gm, '') // Remove * * * patterns
        .replace(/^\/\*{2,}\/*\s*$/gm, '') // Remove /** or /* patterns
        .replace(/^\s*[<>]{3,}\s*$/gm, '') // Remove <<< or >>> lines
        .replace(/^[^\w\s]{5,}$/gm, '') // Remove any line with 5+ non-word chars
        .replace(/^_{10,}$/gm, '') // Remove long underscore lines
        .replace(/^-{10,}$/gm, '') // Remove long dash lines
        .replace(/^={10,}$/gm, '') // Remove long equals lines
        .replace(/^[\s\t]*[-=_*~+#]{2,}[\s\t]*$/gm, '') // Remove short decorative lines with spacing
        .replace(/^[\s\t]*[\|\\\/<>\[\]\{\}\(\)]{3,}[\s\t]*$/gm, ''); // Remove lines of brackets/slashes
    
    // COMPREHENSIVE dash and underscore cleaning for ALL job descriptions
    cleaned = cleaned
        // Remove excessive dashes and underscores
        .replace(/-{3,}/g, '--') // 3+ dashes become double dash
        .replace(/_{3,}/g, '__') // 3+ underscores become double underscore
        .replace(/--+/g, '-') // Multiple dashes become single
        .replace(/__+/g, '_') // Multiple underscores become single
        
        // Remove standalone dashes and underscores
        .replace(/\s+-\s+/g, ' ') // Space-dash-space becomes space
        .replace(/\s+_\s+/g, ' ') // Space-underscore-space becomes space
        .replace(/^-+$/gm, '') // Lines of just dashes
        .replace(/^_+$/gm, '') // Lines of just underscores
        
        // Clean up dash/underscore combinations
        .replace(/[-_]{2,}/g, '-') // Mixed dashes and underscores
        .replace(/\s*[-_]\s*[-_]\s*/g, ' ') // Multiple with spaces
        
        // Remove decorative patterns
        .replace(/^[-_\s]{5,}$/gm, '') // Lines of dashes/underscores/spaces
        .replace(/^[\s\t]*[-_]+[\s\t]*$/gm, '') // Any dash/underscore line
        
        // Clean up inline issues
        .replace(/([a-zA-Z])[-_]{2,}([a-zA-Z])/g, '$1-$2') // Multiple between letters
        .replace(/[-_]+$/gm, '') // Trailing dashes/underscores
        .replace(/^[-_]+/gm, '') // Leading dashes/underscores
        .replace(/\s+[-_]+$/gm, '') // Space + trailing
        .replace(/^[-_]+\s+/gm, '') // Leading + space
        
        // Fix common patterns
        .replace(/([.!?])\s*[-_]{2,}\s*([A-Z])/g, '$1\n\n$2') // Between sentences
        .replace(/\n\s*[-_]{2,}\s*\n/g, '\n\n') // Between paragraphs
        .replace(/[-_]\s*[-_]/g, '-') // Dash-space-dash becomes single dash
        .replace(/\s+[-_]\s+/g, ' - '); // Standardize dashes with spaces
    
    // IMMEDIATELY clean up equals signs and asterisks before words
    cleaned = cleaned
        // Remove all variations of equals patterns
        .replace(/={2,}/g, '') // Any 2+ equals in a row
        .replace(/\s*=+\s*([A-Za-z])/g, ' $1') // Equals before words
        .replace(/([A-Za-z])\s*=+\s*/g, '$1 ') // Equals after words
        
        // Remove asterisks before words - be very aggressive
        .replace(/^(\s*)\*([A-Z])/gm, '$1$2') // *Word at line start
        .replace(/\n\*([A-Z])/g, '\n$1') // *Word after newline  
        .replace(/([.!?])\s*\*([A-Z])/g, '$1 $2') // *Word after punctuation
        .replace(/\s+\*([A-Z])/g, ' $1') // *Word after space
        .replace(/\*([A-Z][a-z]+:)/g, '$1') // *Word: patterns
        .replace(/\*([A-Z][a-z]+)/g, '$1') // Any remaining *Word
    
    // Fix common weird characters and formatting issues
    cleaned = cleaned
        .replace(/[""]/g, '"')
        .replace(/['']/g, "'")
        .replace(/…/g, '...')
        .replace(/–/g, '-')
        .replace(/—/g, '-')
        .replace(/•/g, '*')
        .replace(/◦/g, '-')
        .replace(/▪/g, '*')
        .replace(/▸/g, '*')
        .replace(/►/g, '*')
        .replace(/◆/g, '*')
        .replace(/■/g, '*')
        .replace(/□/g, '*')
        .replace(/○/g, '*')
        .replace(/●/g, '*')
        .replace(/→/g, '->')
        .replace(/←/g, '<-')
        .replace(/↑/g, '^')
        .replace(/↓/g, 'v')
        .replace(/©/g, '(c)')
        .replace(/®/g, '(R)')
        .replace(/™/g, '(TM)')
        .replace(/½/g, '1/2')
        .replace(/¼/g, '1/4')
        .replace(/¾/g, '3/4')
        .replace(/€/g, 'EUR ') // Euro symbol
        .replace(/£/g, 'GBP ') // Pound symbol
        .replace(/¥/g, 'JPY ') // Yen symbol
        .replace(/\u200B/g, '') // Zero-width space
        .replace(/\u00A0/g, ' ') // Non-breaking space
        .replace(/\t/g, '  '); // Tabs to spaces
    
    // Preserve paragraph breaks - first normalize different line break styles
    cleaned = cleaned
        .replace(/\r\n/g, '\n') // Windows to Unix line breaks
        .replace(/\r/g, '\n') // Mac to Unix line breaks
        .replace(/[ \t]+/g, ' ') // Replace multiple spaces/tabs with single space
        .replace(/\n[ \t]+/g, '\n') // Remove leading spaces after line breaks
        .replace(/[ \t]+\n/g, '\n') // Remove trailing spaces before line breaks
        .replace(/\n{3,}/g, '\n\n'); // Replace 3+ line breaks with 2
    
    // Comprehensive symbol cleaning - handle any combination
    // Remove various arrow patterns
    cleaned = cleaned
        .replace(/={2,}>/g, '->') // ==> or ===> etc to ->
        .replace(/<{2,}=/g, '<-') // <== or <=== etc to <-
        .replace(/-{2,}>/g, '->') // --> or ---> etc to ->
        .replace(/<{2,}-/g, '<-') // <-- or <--- etc to <-
        .replace(/>{2,}/g, '>>') // >>> becomes >>
        .replace(/<{2,}/g, '<<') // <<< becomes <<
        .replace(/\|{2,}/g, '|') // || or ||| becomes |
        .replace(/#{3,}/g, '') // Remove ### or more
        .replace(/\*{4,}/g, '') // Remove **** or more
        .replace(/\+{3,}/g, '') // Remove +++ or more
        .replace(/~{3,}/g, '') // Remove ~~~ or more
        .replace(/`{3,}/g, '') // Remove ``` or more (unless code block)
        .replace(/_{3,}/g, '') // Remove ___ or more
        .replace(/\^{3,}/g, '') // Remove ^^^ or more
        .replace(/&{2,}/g, '&') // && or &&& becomes &
        .replace(/@{2,}/g, '@') // @@ or @@@ becomes @
        .replace(/!{3,}/g, '!') // !!! becomes !
        .replace(/\?{3,}/g, '?') // ??? becomes ?
        .replace(/\.{4,}/g, '...') // .... or more becomes ...
        .replace(/,{2,}/g, ',') // ,, or more becomes ,
        .replace(/;{2,}/g, ';') // ;; or more becomes ;
        .replace(/:{3,}/g, ':') // ::: or more becomes :
        .replace(/\/{3,}(?!\/)/g, '/') // /// becomes / (unless it's ////)
        .replace(/\[{2,}/g, '[') // [[ becomes [
        .replace(/\]{2,}/g, ']') // ]] becomes ]
        .replace(/\({2,}/g, '(') // (( becomes (
        .replace(/\){2,}/g, ')') // )) becomes )
        .replace(/\${2,}/g, '$') // $$ becomes $
        .replace(/%{2,}/g, '%'); // %% becomes %
    
    // Handle headers with any number of special characters
    // This regex captures lines that start with any combination of *, #, =, - followed by text
    cleaned = cleaned.replace(/^[\*#=\-\+~_]{1,}\s*([A-Z][A-Za-z\s]+?)[\*#=\-\+~_]*\s*$/gm, (match, content) => {
        const trimmedContent = content.trim();
        // Check if this looks like a header (capitalized, relatively short)
        if (trimmedContent.length < 50 && /^[A-Z]/.test(trimmedContent)) {
            return '\n\n## ' + trimmedContent + '\n\n';
        }
        return match;
    });
    
    // Format known section headers with any symbol decoration
    const sectionHeaders = [
        'Description', 'Job Description', 'Overview', 'Summary',
        'Responsibilities', 'Key Responsibilities', 'Duties',
        'Requirements', 'Required Qualifications', 'Minimum Qualifications',
        'Preferred Qualifications', 'Nice to Have', 'Ideally you\'ll have',
        'Skills', 'Technical Skills', 'Required Skills',
        'Experience', 'Work Experience',
        'Education', 'Educational Requirements',
        'Benefits', 'Perks', 'What We Offer',
        'About', 'About Us', 'About The Team', 'About The Company',
        'How to Apply', 'Application Process',
        'Compensation', 'Salary', 'Pay',
        'Premium healthcare', 'Healthcare', 'Health Benefits',
        'Why join us', 'Why work here', 'Culture',
        'Tech Stack', 'Technologies', 'Tools',
        'Location', 'Work Location', 'Office Location',
        'Flexibility', 'Working Conditions', 'Work Environment',
        'What you\'ll do', 'What you will do', 'Your role',
        'Who you are', 'About you', 'Your background'
    ];
    
    sectionHeaders.forEach(header => {
        // Match header with any number of special chars before/after
        const regex = new RegExp(`(^|\\n)\\s*[\\*#=\\-\\+~_]{0,}\\s*(${header})\\s*[\\*#=\\-\\+~_:]{0,}\\s*$`, 'gmi');
        cleaned = cleaned.replace(regex, '\n\n## $2\n\n');
    });
    
    // Format bullet points consistently - handle complex cases
    cleaned = cleaned
        .replace(/^[\*\-\+•◦▪▸►◆■□○●]\s*/gm, '* ') // Standardize various bullet types
        .replace(/^[\s\t]*[\*\-\+•◦▪▸►◆■□○●]\s*/gm, '* ') // Handle indented bullets
        .replace(/^(\d+)[.)]\s*/gm, '$1. ') // Fix numbered lists
        .replace(/^[a-zA-Z][.)]\s*/gm, '* ') // Convert letter bullets to standard bullets
        .replace(/\*\s*\*/g, '*') // Fix double asterisks
        .replace(/\*{2,}\s+/g, '* '); // Multiple asterisks before text becomes single bullet
    
    // COMPREHENSIVE paragraph breaking for ALL job descriptions
    // This ensures proper formatting for any job posting
    cleaned = cleaned
        // First, ensure sentences end with proper spacing
        .replace(/([.!?])([A-Z])/g, '$1 $2') // Add space between period and capital letter
        
        // Add paragraph breaks after sentences
        .replace(/([.!?])\s+([A-Z])/g, '$1\n\n$2') // Basic sentence endings
        .replace(/([.!?])\s*\n\s*([A-Z])/g, '$1\n\n$2') // Normalize existing breaks
        
        // Break before common job description sections (works for all companies)
        .replace(/([.!?])\s*(Responsibilities:|Requirements:|Qualifications:|What you['']ll do:|What we offer:|About the role:|About us:|About the company:|The role:|The position:|Key responsibilities:|Essential duties:|Primary responsibilities:|Core responsibilities:|Main responsibilities:|Job duties:|Your responsibilities:|You will:|In this role, you will:|As a .+, you will:)/gi, '$1\n\n## $2')
        
        // Break before qualification sections
        .replace(/([.!?])\s*(Basic qualifications:|Minimum qualifications:|Required qualifications:|Preferred qualifications:|Nice to have:|Must have:|Required skills:|Technical skills:|Experience required:|What we['']re looking for:|What you need:|You should have:|Ideal candidate:|We['']re looking for someone who:)/gi, '$1\n\n## $2')
        
        // Break before benefit/culture sections
        .replace(/([.!?])\s*(Benefits:|Perks:|What we offer:|Why join us\??|Why work here\??|Culture:|Our culture:|Company culture:|Work environment:|What['']s in it for you:|We offer:|Our benefits:|Total rewards:)/gi, '$1\n\n## $2')
        
        // Break before common sentence starters (universal patterns)
        .replace(/([.!?])\s+(We are|We['']re|We have|We offer|We provide|We believe|We value|We need|We seek|We want)/gi, '$1\n\n$2')
        .replace(/([.!?])\s+(You will|You['']ll|You are|You['']re|You have|You should|You must|You need|Your role|Your responsibilities)/gi, '$1\n\n$2')
        .replace(/([.!?])\s+(The team|The role|The position|The ideal candidate|The company|The opportunity|This role|This position|This is)/gi, '$1\n\n$2')
        .replace(/([.!?])\s+(Our team|Our company|Our mission|Our vision|Our values|Our culture|Our client|Our product|Our platform)/gi, '$1\n\n$2')
        
        // Break before action verbs commonly starting new responsibilities
        .replace(/([.!?])\s+(Lead|Manage|Develop|Design|Build|Create|Implement|Maintain|Collaborate|Partner|Drive|Own|Define|Establish|Ensure|Support|Analyze|Optimize|Coordinate|Execute|Deliver|Monitor|Review|Assess|Evaluate|Research|Investigate|Communicate|Present|Report|Document|Train|Mentor|Guide|Coach)/g, '$1\n\n$2')
        
        // Break before transitional phrases
        .replace(/([.!?])\s+(Additionally|Furthermore|Moreover|However|Therefore|In addition|Also|Plus|Finally|Lastly|First|Second|Third|Next)/gi, '$1\n\n$2')
        
        // Break before experience/year patterns
        .replace(/([.!?])\s+(\d+\+?\s*years?\s+of\s+experience)/gi, '$1\n\n$2')
        .replace(/([.!?])\s+(Experience with|Experience in|Knowledge of|Familiarity with|Understanding of|Expertise in|Proficiency in|Strong background in)/gi, '$1\n\n$2')
        
        // Break before education requirements
        .replace(/([.!?])\s+(Bachelor|Master|PhD|Degree|Education:|Educational background:|Academic qualifications:)/gi, '$1\n\n$2')
        
        // Break before location/remote work mentions
        .replace(/([.!?])\s+(Location:|Based in|Remote work|Hybrid work|On-site|Office location:|Work location:|This position is based)/gi, '$1\n\n$2')
        
        // Break before equal opportunity statements
        .replace(/([.!?])\s+([A-Za-z]+ is an equal opportunity employer|EOE|Equal [Oo]pportunity|Affirmative [Aa]ction|We are committed to|Diversity statement:)/gi, '$1\n\n$2')
        
        // Break before salary/compensation mentions
        .replace(/([.!?])\s+(Salary:|Compensation:|Pay:|Base salary:|Total compensation:|The salary range|Salary range)/gi, '$1\n\n$2')
        
        // Clean up excessive breaks
        .replace(/\n{3,}/g, '\n\n')
    
    // Transform bullet points that are just location/metadata into proper format
    // Look for patterns like "* United States * Los Angeles * Hybrid"
    const locationPattern = /^\*\s+(United States|[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*\*\s+/gm;
    if (locationPattern.test(cleaned)) {
        // This looks like location/metadata bullets, transform them
        const lines = cleaned.split('\n');
        let transformed = [];
        let isMetadataSection = false;
        
        for (const line of lines) {
            if (line.match(/^\*\s+(United States|[A-Z][a-z]+|[0-9]+|Remote|Hybrid|Engineering|Development|Regular|Senior|Junior)/)) {
                // Skip these metadata lines - they'll be handled by the frontend
                continue;
            } else if (line.trim()) {
                transformed.push(line);
            }
        }
        cleaned = transformed.join('\n');
    }
    
    // Special handling for remaining bullet points
    cleaned = cleaned
        .replace(/([^\n])\s*\*\s+/g, '$1\n\n* ') // Add break before bullets if not already there
        .replace(/\*\s+([^\n]+?)([.!?])\s*\*\s+/g, '* $1$2\n* ') // Separate consecutive bullets
        .replace(/\*\s+([^\n]+?)([.!?])\s+([A-Z])/g, '* $1$2\n\n$3'); // Break after bullet to paragraph
    
    // Ensure section headers have proper spacing
    cleaned = cleaned
        .replace(/\n*##\s+/g, '\n\n## ') // Normalize header spacing
        .replace(/^##\s+/, '## '); // Don't add extra space at start
    
    // Clean up any remaining formatting issues
    cleaned = cleaned
        .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive line breaks
        .replace(/^\s+|\s+$/g, '') // Trim start and end
        .replace(/\s+$/gm, ''); // Trim trailing spaces on each line
    
    // Ensure the description starts cleanly
    if (cleaned.toLowerCase().startsWith('description')) {
        cleaned = cleaned.replace(/^description\s*:?\s*/i, '');
    }
    
    // Final pass - ensure consistent paragraph spacing and better formatting
    const lines = cleaned.split('\n');
    const formattedLines = [];
    let inList = false;
    let lastWasBullet = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const isBullet = line.startsWith('* ') || /^\d+\.\s/.test(line);
        const isHeader = line.startsWith('## ');
        const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
        
        // Add the current line
        formattedLines.push(line);
        
        // Add spacing logic
        if (isHeader) {
            // Always add space after headers
            if (nextLine) {
                formattedLines.push('');
            }
            inList = false;
            lastWasBullet = false;
        } else if (isBullet) {
            // Check if next line is also a bullet
            const nextIsBullet = nextLine.startsWith('* ') || /^\d+\.\s/.test(nextLine);
            
            if (!nextIsBullet && nextLine) {
                // This is the last bullet in a list, add space after
                formattedLines.push('');
            }
            
            inList = true;
            lastWasBullet = true;
        } else {
            // Regular paragraph
            if (lastWasBullet || inList) {
                // Already added space after last bullet
                inList = false;
                lastWasBullet = false;
            } else if (nextLine && !nextLine.startsWith('* ') && !isHeader) {
                // Add space between paragraphs
                const endsWithPeriod = line.endsWith('.');
                const nextStartsCapital = /^[A-Z]/.test(nextLine);
                
                if (endsWithPeriod && nextStartsCapital) {
                    formattedLines.push('');
                }
            }
        }
    }
    
    cleaned = formattedLines.join('\n');
    
    // Remove lines that are just symbols
    cleaned = cleaned
        .replace(/^[\*#=\-\+~_\|<>\[\]\(\)\{\}\/\\@!?\.:;,&$%\^]{1,}\s*$/gm, '') // Remove lines with only symbols
        .replace(/^[\s\*#=\-\+~_]+$/gm, ''); // Remove lines with symbols and spaces
    
    // Clean up symbol combinations at the end of lines
    cleaned = cleaned
        .replace(/[\*#=\-\+~_]{2,}\s*$/gm, '') // Remove multiple symbols at end of lines
        .replace(/\s+[#\*]{1,}\s*$/gm, '') // Remove # or * at end of lines with space before
        .replace(/([A-Za-z0-9])[#\*=\-\+~_]+$/gm, '$1'); // Remove symbols right after text
    
    // Fix ALL inline asterisks comprehensively
    cleaned = cleaned
        // Remove asterisks before words (like "As a *Senior" -> "As a Senior")
        .replace(/(\s+)\*([A-Z][a-zA-Z])/g, '$1$2') // Remove * before capitalized words
        .replace(/(\s+)\*([a-z])/g, '$1$2') // Remove * before lowercase words
        .replace(/(^|\n)\*([A-Z][a-zA-Z])/g, '$1$2') // Remove * at start of line before words
        
        // Fix patterns like "* + Design" -> "Design"
        .replace(/\*\s*\+\s*/g, '') // Remove "* + " patterns
        .replace(/\+\s*\*/g, '') // Remove "+ *" patterns
        
        // Remove other inline asterisk patterns
        .replace(/([a-z])\s+\*\s+([A-Za-z])/g, '$1. $2') // "members * Required" -> "members. Required"
        .replace(/\s\*\s\*\s+([A-Za-z])/g, ' - $1') // "* * J.P." -> "- J.P."
        .replace(/([a-z])\*([A-Z])/g, '$1. $2') // "span*Preferred" -> "span. Preferred"
        .replace(/\.\s*\*([A-Z])/g, '. $1') // ". *Ideally" -> ". Ideally"
        .replace(/\n\*([A-Z][a-zA-Z]+:)/g, '\n## $1') // "*Flexibility:" -> "## Flexibility:"
        
        // Clean up any remaining patterns
        .replace(/\*{2,}\s*([A-Za-z])/g, '$1') // ** text becomes text
        .replace(/#{2}\s*#{1,}/g, '##') // ## ### becomes ##
        .replace(/\s*[#\*]{1,}\s*\n/g, '\n') // Remove trailing symbols before newline
        .replace(/\n\s*[#\*]{1,}\s*\n/g, '\n\n') // Remove lines with just # or *
        .replace(/J\.\s*P\./g, 'J.P.') // Fix J.P. spacing
        .replace(/\\\&/g, '&'); // Unescape & symbols
    
    // Final cleanup pass for any remaining issues
    cleaned = cleaned
        .replace(/\s{2,}/g, ' ') // Collapse multiple spaces
        .replace(/\n\s+\n/g, '\n\n'); // Remove spaces on empty lines
    
    // One more pass to clean up any issues
    cleaned = cleaned
        .replace(/\n{3,}/g, '\n\n') // Max 2 line breaks
        .replace(/^\n+/, '') // Remove leading line breaks
        .replace(/\n+$/, '') // Remove trailing line breaks
        .replace(/^\s*$/gm, '') // Remove empty lines with just whitespace
        .replace(/\s{2,}/g, ' ') // Collapse multiple spaces
        .trim(); // Final trim
    

    
    return cleaned;
}

// Helper function to extract salary from job description
function extractSalaryFromDescription(description: string): { min: number | null; max: number | null; currency: string; period: string } | null {
    if (!description) return null;
    
    // COMPREHENSIVE salary patterns for ALL job descriptions
    const salaryPatterns = [
        // Standard range patterns
        /\$([0-9,]+)\s*[-–—]\s*\$([0-9,]+)\s*(?:per\s+)?(?:year|yr|annually)/gi,
        /\$([0-9]+)k\s*[-–—]\s*\$([0-9]+)k\s*(?:per\s+)?(?:year|yr|annually)/gi,
        /\$([0-9,]+)\s+to\s+\$([0-9,]+)\s*(?:per\s+)?(?:year|yr|annually)/gi,
        /\$([0-9]+)k\s+to\s+\$([0-9]+)k\s*(?:per\s+)?(?:year|yr|annually)/gi,
        
        // "up to" patterns (like Amazon's format)
        /\$([0-9,]+)\/year\s+up\s+to\s+\$([0-9,]+)\/year/gi,
        /\$([0-9]+)k\/year\s+up\s+to\s+\$([0-9]+)k\/year/gi,
        /ranges?\s+from\s+\$([0-9,]+)(?:\/year)?\s+up\s+to\s+\$([0-9,]+)(?:\/year)?/gi,
        /from\s+\$([0-9,]+)(?:\/year)?\s+(?:up\s+)?to\s+\$([0-9,]+)(?:\/year)?/gi,
        
        // Hourly rates
        /\$([0-9]+)\s*[-–—]\s*\$([0-9]+)\s*(?:per\s+)?(?:hour|hr)/gi,
        /\$([0-9]+)\s+to\s+\$([0-9]+)\s*(?:per\s+)?(?:hour|hr)/gi,
        /\$([0-9]+)\/(?:hour|hr)\s*[-–—]\s*\$([0-9]+)\/(?:hour|hr)/gi,
        
        // Base + bonus patterns
        /base\s+(?:salary\s+)?(?:of\s+)?\$([0-9,]+)\s*(?:[-–—]|to)\s*\$([0-9,]+)/gi,
        /\$([0-9,]+)\s*(?:[-–—]|to)\s*\$([0-9,]+)\s+base/gi,
        
        // Total compensation patterns
        /total\s+compensation\s+(?:of\s+)?\$([0-9,]+)\s*(?:[-–—]|to)\s*\$([0-9,]+)/gi,
        /TC\s*:?\s*\$([0-9,]+)\s*(?:[-–—]|to)\s*\$([0-9,]+)/gi,
        
        // No period specified (assume yearly)
        /\$([0-9,]+)\s*[-–—]\s*\$([0-9,]+)(?:\s|$)/gi,
        /\$([0-9]+)k\s*[-–—]\s*\$([0-9]+)k(?:\s|$)/gi,
        
        // Single salary values
        /\$([0-9,]+)\s*(?:per\s+)?(?:year|yr|annually)/gi,
        /\$([0-9]+)k\s*(?:per\s+)?(?:year|yr|annually)/gi,
        /\$([0-9,]+)\/(?:year|yr)/gi,
        /\$([0-9]+)k\/(?:year|yr)/gi,
        /\$([0-9]+)\s*(?:per\s+)?(?:hour|hr)/gi,
        /\$([0-9]+)\/(?:hour|hr)/gi,
        
        // European format with spaces
        /([0-9]{1,3}(?:\s[0-9]{3})*)[\s]*\$\s*(?:[-–—]|to)\s*([0-9]{1,3}(?:\s[0-9]{3})*)[\s]*\$/gi,
        
        // Salary mentioned in text
        /salary\s+(?:is\s+)?(?:between\s+)?\$([0-9,]+)\s*(?:and|[-–—]|to)\s*\$([0-9,]+)/gi,
        /compensation\s+(?:is\s+)?(?:between\s+)?\$([0-9,]+)\s*(?:and|[-–—]|to)\s*\$([0-9,]+)/gi
    ];
    
    for (const pattern of salaryPatterns) {
        const matches = description.match(pattern);
        if (matches) {
            const match = matches[0];
            
            // Extract numbers from the match
            const numbers = match.match(/\$([0-9,]+)/g) || match.match(/\$([0-9]+)k/g);
            if (!numbers || numbers.length === 0) continue;
            
            // Convert to numbers
            const salaryNumbers = numbers.map(num => {
                const cleanNum = num.replace(/[$,]/g, '');
                if (cleanNum.includes('k')) {
                    return parseInt(cleanNum.replace('k', '')) * 1000;
                }
                return parseInt(cleanNum);
            });
            
            // Determine if it's hourly or yearly
            const isHourly = /hour|hr/i.test(match);
            const isYearly = /year|yr|annually/i.test(match);
            
            let minSalary = salaryNumbers[0];
            let maxSalary = salaryNumbers[1] || salaryNumbers[0];
            
            // Convert hourly to yearly if needed
            if (isHourly || (!isYearly && maxSalary < 10000)) {
                minSalary = minSalary * 40 * 4 * 12; // 40 hours/week * 4 weeks/month * 12 months
                maxSalary = maxSalary * 40 * 4 * 12;
            }
            
            return {
                min: minSalary,
                max: maxSalary,
                currency: 'USD',
                period: 'yearly'
            };
        }
    }
    
    return null;
}

// Helper function to get truncated description for job cards
function getTruncatedDescription(description: string, maxLength: number = 250): string {
    if (!description) return description;
    
    // First, strip markdown formatting for the preview
    let plainText = description
        .replace(/#{1,6}\s+/g, '') // Remove markdown headers
        .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
        .replace(/\*([^*]+)\*/g, '$1') // Remove italic
        .replace(/^\* /gm, '') // Remove bullet points
        .replace(/^\d+\. /gm, '') // Remove numbered lists
        .replace(/\n{2,}/g, ' ') // Replace multiple line breaks with space
        .replace(/\n/g, ' ') // Replace single line breaks with space
        .trim();
    
    if (plainText.length <= maxLength) {
        return plainText;
    }
    
    // Try to truncate at a sentence boundary
    const truncated = plainText.substring(0, maxLength);
    const lastPeriod = truncated.lastIndexOf('.');
    const lastExclamation = truncated.lastIndexOf('!');
    const lastQuestion = truncated.lastIndexOf('?');
    
    const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion);
    
    if (lastSentenceEnd > maxLength * 0.7) { // If we found a sentence end in the last 30% of the text
        return truncated.substring(0, lastSentenceEnd + 1).trim() + '...';
    }
    
    // Otherwise, truncate at word boundary
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.8) { // If we found a space in the last 20% of the text
        return truncated.substring(0, lastSpace).trim() + '...';
    }
    
    return truncated.trim() + '...';
}

// Helper functions to transform JobSpy responses to internal models
export function transformJobSpyJob(jobSpyJob: JobSpyJob): Job {
    const cleanedDescription = cleanJobDescription(jobSpyJob.description || 'No description available');
    
    // Try to extract salary from description first
    const extractedSalary = extractSalaryFromDescription(cleanedDescription);
    
    // Use extracted salary if found, otherwise use API salary
    let salary = undefined;
    if (extractedSalary) {
        salary = extractedSalary;
    } else if (jobSpyJob.salary_range) {
        // Apply the same logic to API salary data
        let minSalary = jobSpyJob.salary_range.min;
        let maxSalary = jobSpyJob.salary_range.max;
        
        // If salary is less than 10,000 and period is hourly or not specified, convert to yearly
        if (maxSalary && maxSalary < 10000 && 
            (jobSpyJob.salary_range.period?.toLowerCase().includes('hour') || 
             !jobSpyJob.salary_range.period || 
             jobSpyJob.salary_range.period.toLowerCase().includes('hour'))) {
            minSalary = minSalary ? minSalary * 40 * 4 * 12 : null;
            maxSalary = maxSalary ? maxSalary * 40 * 4 * 12 : null;
        }
        
        salary = {
            min: minSalary,
            max: maxSalary,
            currency: jobSpyJob.salary_range.currency,
            period: 'yearly'
        };
    }
    
    return {
        id: jobSpyJob.job_id,
        title: jobSpyJob.title,
        company: jobSpyJob.company,
        location: jobSpyJob.location || 'Not specified',
        description: cleanedDescription,
        applicationUrl: jobSpyJob.application_url,
        salary: salary,
        postedDate: jobSpyJob.posted_date || new Date().toISOString(),
        techKeywords: jobSpyJob.tech_keywords || [],
        remote: jobSpyJob.is_remote,
        source: jobSpyJob.source
    };
}

export function transformJobSpyDetailResponse(detail: JobSpyDetailResponse): Job {
    const cleanedDescription = cleanJobDescription(detail.description || '');
    
    // Try to extract salary from description first
    const extractedSalary = extractSalaryFromDescription(cleanedDescription);
    
    // Use extracted salary if found, otherwise use API salary
    let salary = undefined;
    if (extractedSalary) {
        salary = extractedSalary;
    } else if (detail.salary_range) {
        // Apply the same logic to API salary data
        let minSalary = detail.salary_range.min;
        let maxSalary = detail.salary_range.max;
        
        // If salary is less than 10,000 and period is hourly or not specified, convert to yearly
        if (maxSalary && maxSalary < 10000 && 
            (detail.salary_range.period?.toLowerCase().includes('hour') || 
             !detail.salary_range.period || 
             detail.salary_range.period.toLowerCase().includes('hour'))) {
            minSalary = minSalary ? minSalary * 40 * 4 * 12 : null;
            maxSalary = maxSalary ? maxSalary * 40 * 4 * 12 : null;
        }
        
        salary = {
            min: minSalary,
            max: maxSalary,
            currency: detail.salary_range.currency,
            period: 'yearly'
        };
    }
    
    return {
        id: detail.job_id,
        title: detail.title,
        company: detail.company,
        location: detail.location || 'Not specified',
        description: cleanedDescription,
        applicationUrl: detail.application_url,
        salary: salary,
        type: detail.job_type || undefined,
        experience: detail.experience_level || undefined,
        postedDate: detail.posted_date || new Date().toISOString(),
        techKeywords: detail.tech_keywords || [],
        remote: detail.is_remote,
        source: detail.source as 'linkedin' | 'indeed'
    };
} 