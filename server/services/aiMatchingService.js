import axios from 'axios';

class AIMatchingService {
  constructor() {
    this.groqApiKey = process.env.GROQ_API_KEY;
    this.groqBaseUrl = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1';
  }

  /**
   * Calculate match score between CV and Job using direct Groq API
   */
  async calculateMatchScore(cvProfile, job) {
    try {
      // Prepare structured data for analysis
      const cvData = this.extractCVData(cvProfile);
      const jobData = this.extractJobData(job);

      // Direct Groq API call
      const analysis = await this.groqAPIAnalysis(cvData, jobData);
      
      if (analysis.success) {
        return {
          success: true,
          analysis: {
            matchScore: analysis.matchScore,
            explanation: analysis.explanation,
            skillsMatch: analysis.skillsMatch,
            experienceMatch: analysis.experienceMatch,
            educationMatch: analysis.educationMatch,
            overallRecommendation: analysis.overallRecommendation,
            analyzedAt: new Date(),
            aiModel: 'llama3-8b-8192'
          }
        };
      } else {
        throw new Error(analysis.error);
      }

    } catch (error) {
      console.error('AI Matching Error:', error);
      return {
        success: false,
        error: error.message,
        fallbackScore: this.calculateFallbackScore(cvProfile, job)
      };
    }
  }

  /**
   * Direct API call to Groq
   */
  async groqAPIAnalysis(cvData, jobData) {
    try {
      const prompt = this.buildAnalysisPrompt(cvData, jobData);

      const response = await axios.post(`${this.groqBaseUrl}/chat/completions`, {
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are an expert HR AI assistant specializing in candidate-job matching analysis. Always respond with valid JSON format only, no additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      }, {
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      });

      if (response.data && response.data.choices && response.data.choices[0]) {
        const aiResponse = response.data.choices[0].message.content;
        const analysis = this.parseAIResponse(aiResponse);
        
        return {
          success: true,
          ...analysis
        };
      } else {
        throw new Error('Invalid response from Groq API');
      }

    } catch (error) {
      console.error('Groq API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get top 5 candidates for a job (for employers)
   */
  async getTopCandidates(applications, limit = 5) {
    try {
      // Filter applications that have been analyzed
      const analyzedApplications = applications.filter(
        app => app.aiAnalysis && app.aiAnalysis.matchScore !== null
      );

      // Sort by match score and recommendation
      const sortedApps = analyzedApplications.sort((a, b) => {
        // First priority: overall recommendation
        const recommendationScore = {
          'highly_recommended': 4,
          'recommended': 3,
          'consider': 2,
          'not_recommended': 1
        };

        const aRecScore = recommendationScore[a.aiAnalysis.overallRecommendation] || 0;
        const bRecScore = recommendationScore[b.aiAnalysis.overallRecommendation] || 0;

        if (aRecScore !== bRecScore) {
          return bRecScore - aRecScore;
        }

        // Second priority: match score
        return (b.aiAnalysis.matchScore || 0) - (a.aiAnalysis.matchScore || 0);
      });

      // Return top candidates with enhanced analysis
      const topCandidates = sortedApps.slice(0, limit).map(app => ({
        applicationId: app._id,
        userId: app.userId,
        matchScore: app.aiAnalysis.matchScore,
        recommendation: app.aiAnalysis.overallRecommendation,
        keyStrengths: this.extractKeyStrengths(app.aiAnalysis),
        concerns: this.extractConcerns(app.aiAnalysis),
        summary: this.generateCandidateSummary(app.aiAnalysis)
      }));

      return {
        success: true,
        topCandidates,
        totalAnalyzed: analyzedApplications.length,
        analysisDate: new Date()
      };

    } catch (error) {
      console.error('Top Candidates Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Extract structured CV data
   */
  extractCVData(cvProfile) {
    return {
      summary: cvProfile.summary || '',
      skills: cvProfile.skills || [],
      workExperience: cvProfile.workExperience || [],
      education: cvProfile.education || [],
      languages: cvProfile.languages || [],
      certifications: cvProfile.certifications || [],
      totalYearsExperience: this.calculateTotalExperience(cvProfile.workExperience)
    };
  }

  /**
   * Extract structured Job data
   */
  extractJobData(job) {
    return {
      title: job.title,
      description: job.description,
      location: job.location,
      experienceYears: job.experienceYears || 0,
      minSalary: job.minSalary,
      maxSalary: job.maxSalary,
      requiredSkills: this.extractSkillsFromDescription(job.description),
      state: job.state
    };
  }

  /**
   * Format CV for AI analysis
   */
  formatCVForAnalysis(cvData) {
    return `
CANDIDATE PROFILE:
Summary: ${cvData.summary}

Skills: ${cvData.skills.map(s => `${s.skillName} (${s.level}, ${s.yearsOfExperience} years)`).join(', ')}

Work Experience (${cvData.totalYearsExperience} total years):
${cvData.workExperience.map(exp => 
  `- ${exp.position} at ${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'}): ${exp.description}`
).join('\n')}

Education:
${cvData.education.map(edu => 
  `- ${edu.degree} in ${edu.fieldOfStudy} from ${edu.institution} (GPA: ${edu.gpa || 'N/A'})`
).join('\n')}

Languages: ${cvData.languages.map(lang => `${lang.language} (${lang.proficiency})`).join(', ')}

Certifications: ${cvData.certifications.map(cert => `${cert.name} by ${cert.issuer}`).join(', ')}
    `.trim();
  }

  /**
   * Format Job for AI analysis
   */
  formatJobForAnalysis(jobData) {
    return `
JOB REQUIREMENTS:
Position: ${jobData.title}
Location: ${jobData.location}
Required Experience: ${jobData.experienceYears} years
Salary Range: $${jobData.minSalary} - $${jobData.maxSalary}

Job Description:
${jobData.description}

Key Skills Required: ${jobData.requiredSkills.join(', ')}
    `.trim();
  }

  /**
   * Build analysis prompt for Groq
   */
  buildAnalysisPrompt(cvData, jobData) {
    return `
Analyze the compatibility between this candidate's CV and job requirements. Provide a comprehensive assessment in this exact JSON format:

{
  "matchScore": [0-100 integer],
  "explanation": "[Detailed explanation of the overall score]",
  "skillsMatch": {
    "matched": ["skill1", "skill2"],
    "missing": ["missing_skill1", "missing_skill2"],
    "additional": ["bonus_skill1", "bonus_skill2"]
  },
  "experienceMatch": {
    "score": [0-100 integer],
    "explanation": "[Why this experience score]"
  },
  "educationMatch": {
    "score": [0-100 integer],
    "explanation": "[Why this education score]"
  },
  "overallRecommendation": "[highly_recommended|recommended|consider|not_recommended]"
}

CANDIDATE PROFILE:
${this.formatCVForAnalysis(cvData)}

JOB REQUIREMENTS:
${this.formatJobForAnalysis(jobData)}

Analysis Criteria:
1. Skills alignment (technical + soft skills)
2. Experience relevance and duration
3. Education background appropriateness
4. Overall cultural and role fit
5. Growth potential

Return only the JSON response, no additional text.
    `;
  }

  /**
   * Parse AI response to structured data
   */
  parseAIResponse(responseText) {
    try {
      // Clean the response text
      let cleanResponse = responseText.trim();
      
      // Remove markdown code blocks if present
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Extract JSON from response
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validate and sanitize response
        return {
          matchScore: Math.max(0, Math.min(100, parseInt(parsed.matchScore) || 0)),
          explanation: parsed.explanation || 'No explanation provided',
          skillsMatch: {
            matched: Array.isArray(parsed.skillsMatch?.matched) ? parsed.skillsMatch.matched : [],
            missing: Array.isArray(parsed.skillsMatch?.missing) ? parsed.skillsMatch.missing : [],
            additional: Array.isArray(parsed.skillsMatch?.additional) ? parsed.skillsMatch.additional : []
          },
          experienceMatch: {
            score: Math.max(0, Math.min(100, parseInt(parsed.experienceMatch?.score) || 0)),
            explanation: parsed.experienceMatch?.explanation || ''
          },
          educationMatch: {
            score: Math.max(0, Math.min(100, parseInt(parsed.educationMatch?.score) || 0)),
            explanation: parsed.educationMatch?.explanation || ''
          },
          overallRecommendation: this.validateRecommendation(parsed.overallRecommendation)
        };
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.log('Raw response:', responseText);
    }

    // Fallback response
    return {
      matchScore: 50,
      explanation: 'Analysis could not be completed, using fallback scoring',
      skillsMatch: { matched: [], missing: [], additional: [] },
      experienceMatch: { score: 50, explanation: 'Could not analyze experience' },
      educationMatch: { score: 50, explanation: 'Could not analyze education' },
      overallRecommendation: 'consider'
    };
  }

  /**
   * Calculate fallback score using simple rule-based logic
   */
  calculateFallbackScore(cvProfile, job) {
    let score = 0;
    
    // Skills match (40% weight)
    if (cvProfile.skills && cvProfile.skills.length > 0) {
      const jobSkills = this.extractSkillsFromDescription(job.description);
      const matchedSkills = cvProfile.skills.filter(skill =>
        jobSkills.some(jobSkill => 
          jobSkill.toLowerCase().includes(skill.skillName.toLowerCase()) ||
          skill.skillName.toLowerCase().includes(jobSkill.toLowerCase())
        )
      );
      score += (matchedSkills.length / Math.max(jobSkills.length, 1)) * 40;
    }

    // Experience match (35% weight)
    const totalExp = this.calculateTotalExperience(cvProfile.workExperience);
    if (job.experienceYears) {
      if (totalExp >= job.experienceYears) {
        score += 35;
      } else {
        score += (totalExp / job.experienceYears) * 35;
      }
    } else {
      score += 25; // Default if no experience requirement
    }

    // Education match (25% weight)
    if (cvProfile.education && cvProfile.education.length > 0) {
      score += 25;
    } else {
      score += 10;
    }

    return Math.min(100, Math.round(score));
  }

  /**
   * Helper methods
   */
  calculateTotalExperience(workExperience) {
    if (!workExperience || workExperience.length === 0) return 0;
    
    let totalMonths = 0;
    workExperience.forEach(exp => {
      const start = new Date(exp.startDate);
      const end = exp.endDate ? new Date(exp.endDate) : new Date();
      const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                    (end.getMonth() - start.getMonth());
      totalMonths += Math.max(0, months);
    });
    
    return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal
  }

  extractSkillsFromDescription(description) {
    // Common tech skills pattern matching
    const skillPatterns = [
      /JavaScript|JS/gi, /Python/gi, /Java(?!Script)/gi, /React/gi, /Node\.?js/gi,
      /Angular/gi, /Vue/gi, /PHP/gi, /C\+\+/gi, /C#/gi, /SQL/gi, /MongoDB/gi,
      /PostgreSQL/gi, /MySQL/gi, /AWS/gi, /Azure/gi, /Docker/gi, /Kubernetes/gi,
      /DevOps/gi, /Machine Learning/gi, /AI/gi, /Data Science/gi, /UI\/UX/gi,
      /Figma/gi, /Photoshop/gi, /Marketing/gi, /SEO/gi, /Project Management/gi
    ];

    const foundSkills = [];
    skillPatterns.forEach(pattern => {
      const matches = description.match(pattern);
      if (matches) {
        foundSkills.push(...matches.map(m => m.trim()));
      }
    });

    return [...new Set(foundSkills)]; // Remove duplicates
  }

  validateRecommendation(recommendation) {
    const validRecommendations = ['highly_recommended', 'recommended', 'consider', 'not_recommended'];
    return validRecommendations.includes(recommendation) ? recommendation : 'consider';
  }

  extractKeyStrengths(analysis) {
    const strengths = [];
    
    if (analysis.matchScore >= 80) strengths.push('High overall match');
    if (analysis.skillsMatch.matched.length > 3) strengths.push('Strong skill alignment');
    if (analysis.experienceMatch.score >= 75) strengths.push('Relevant experience');
    if (analysis.educationMatch.score >= 75) strengths.push('Strong educational background');
    
    return strengths;
  }

  extractConcerns(analysis) {
    const concerns = [];
    
    if (analysis.matchScore < 60) concerns.push('Low overall match');
    if (analysis.skillsMatch.missing.length > 2) concerns.push('Missing key skills');
    if (analysis.experienceMatch.score < 50) concerns.push('Limited relevant experience');
    
    return concerns;
  }

  generateCandidateSummary(analysis) {
    if (analysis.matchScore >= 80) {
      return 'Excellent candidate with strong alignment to job requirements';
    } else if (analysis.matchScore >= 65) {
      return 'Good candidate with minor gaps that can be addressed';
    } else if (analysis.matchScore >= 50) {
      return 'Potential candidate requiring additional evaluation';
    } else {
      return 'Limited match to current requirements';
    }
  }
}

export default new AIMatchingService(); 