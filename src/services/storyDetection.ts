interface Story {
  id: string;
  title: string;
  description: string;
  spread: number;
  confidence: number;
  region: string;
  coordinates: [number, number];
  sources: string[];
  verificationStatus: 'fake' | 'real' | 'unverified' | 'investigating' | 'debunked';
  dateDetected: string;
  votes: {
    credible: number;
    suspicious: number;
    fake: number;
  };
  category: string;
  explanation?: {
    factors: Array<{
      name: string;
      score: number;
      description: string;
    }>;
    evidence: string[];
    conclusion: string;
  };
}

interface AnalysisResult {
  sentiment: number;
  topics: string[];
  entities: string[];
  credibilityScore: number;
  explanation: {
    factors: Array<{
      name: string;
      score: number;
      description: string;
    }>;
    evidence: string[];
    conclusion: string;
  };
}

class StoryDetectionService {
  private stories: Story[] = [];

  async fetchGlobalStories(): Promise<Story[]> {
    try {
      return [
        {
          id: '1',
          title: 'Breaking News: Major Scientific Discovery',
          description: 'Scientists have made a groundbreaking discovery in quantum computing that could revolutionize data encryption.',
          sources: ['reliable-news.com', 'science-journal.org', 'quantum-research.edu'],
          dateDetected: new Date().toISOString(),
          verificationStatus: 'investigating',
          confidence: 0.7,
          spread: 60,
          region: 'Global',
          coordinates: [0, 0],
          category: 'Science',
          votes: {
            credible: 45,
            suspicious: 20,
            fake: 5
          },
          explanation: {
            factors: [
              {
                name: 'Source Reliability',
                score: 0.85,
                description: 'Published in peer-reviewed journals and reputable news sources'
              },
              {
                name: 'Expert Verification',
                score: 0.75,
                description: 'Multiple independent experts have reviewed the findings'
              },
              {
                name: 'Evidence Quality',
                score: 0.65,
                description: 'Strong experimental evidence with reproducible results'
              }
            ],
            evidence: [
              'Peer-reviewed publication in Nature',
              'Independent verification by three research teams',
              'Detailed methodology available'
            ],
            conclusion: 'This story appears credible based on strong evidence and expert verification.'
          }
        },
        {
          id: '2',
          title: 'Environmental Crisis Alert',
          description: 'New satellite data reveals unprecedented changes in Arctic ice coverage.',
          sources: ['climate-science.org', 'environmental-watch.com'],
          dateDetected: new Date().toISOString(),
          verificationStatus: 'real',
          confidence: 0.95,
          spread: 75,
          region: 'Arctic',
          coordinates: [82, -40],
          category: 'Environment',
          votes: {
            credible: 120,
            suspicious: 15,
            fake: 5
          },
          explanation: {
            factors: [
              {
                name: 'Data Reliability',
                score: 0.95,
                description: 'Verified satellite imagery from multiple sources'
              },
              {
                name: 'Expert Analysis',
                score: 0.90,
                description: 'Confirmed by leading climate scientists'
              },
              {
                name: 'Historical Consistency',
                score: 0.85,
                description: 'Aligns with long-term climate trends'
              }
            ],
            evidence: [
              'NASA satellite data',
              'Peer-reviewed climate studies',
              'Ground station measurements'
            ],
            conclusion: 'Multiple lines of evidence strongly support this environmental observation.'
          }
        },
        {
          id: '3',
          title: 'Viral Health Claim',
          description: 'Social media posts claim common household item cures serious illness.',
          sources: ['social-media.com', 'viral-news.net'],
          dateDetected: new Date().toISOString(),
          verificationStatus: 'fake',
          confidence: 0.92,
          spread: 85,
          region: 'Global',
          coordinates: [0, 0],
          category: 'Health',
          votes: {
            credible: 10,
            suspicious: 150,
            fake: 300
          },
          explanation: {
            factors: [
              {
                name: 'Source Credibility',
                score: 0.15,
                description: 'Unverified social media claims'
              },
              {
                name: 'Medical Evidence',
                score: 0.10,
                description: 'No clinical trials or medical studies'
              },
              {
                name: 'Expert Opinion',
                score: 0.05,
                description: 'Rejected by medical professionals'
              }
            ],
            evidence: [
              'No scientific backing',
              'FDA warnings issued',
              'Similar hoaxes debunked previously'
            ],
            conclusion: 'This claim is demonstrably false and potentially dangerous.'
          }
        },
        {
          id: '4',
          title: 'Tech Innovation Breakthrough',
          description: 'Startup claims revolutionary battery technology with infinite charge cycles.',
          sources: ['tech-daily.com', 'innovation-news.org'],
          dateDetected: new Date().toISOString(),
          verificationStatus: 'investigating',
          confidence: 0.60,
          spread: 45,
          region: 'Asia',
          coordinates: [35, 139],
          category: 'Technology',
          votes: {
            credible: 50,
            suspicious: 40,
            fake: 20
          },
          explanation: {
            factors: [
              {
                name: 'Technical Feasibility',
                score: 0.65,
                description: 'Theoretically possible but unproven'
              },
              {
                name: 'Company Credibility',
                score: 0.50,
                description: 'New startup with limited track record'
              },
              {
                name: 'Patent Verification',
                score: 0.70,
                description: 'Patent applications filed and pending'
              }
            ],
            evidence: [
              'Preliminary lab results',
              'Patent applications',
              'Industry expert interviews'
            ],
            conclusion: 'Further verification and independent testing required.'
          }
        },
        {
          id: '5',
          title: 'Political Controversy',
          description: 'Leaked documents reveal major policy changes affecting international relations.',
          sources: ['political-watch.org', 'global-affairs.net', 'diplomatic-times.com'],
          dateDetected: new Date().toISOString(),
          verificationStatus: 'debunked',
          confidence: 0.88,
          spread: 92,
          region: 'Europe',
          coordinates: [48, 2],
          category: 'Politics',
          votes: {
            credible: 30,
            suspicious: 200,
            fake: 180
          },
          explanation: {
            factors: [
              {
                name: 'Document Authenticity',
                score: 0.20,
                description: 'Documents proven to be altered'
              },
              {
                name: 'Official Statements',
                score: 0.15,
                description: 'Denied by multiple government sources'
              },
              {
                name: 'Timeline Analysis',
                score: 0.25,
                description: 'Inconsistencies in chronological order'
              }
            ],
            evidence: [
              'Forensic document analysis',
              'Official government statements',
              'Timeline inconsistencies'
            ],
            conclusion: 'Story based on manipulated documents and has been officially debunked.'
          }
        },
        {
          id: '6',
          title: 'Economic Forecast Alert',
          description: 'Analysis predicts significant market shifts based on emerging trends.',
          sources: ['financial-times.com', 'market-analysis.org', 'economic-research.edu'],
          dateDetected: new Date().toISOString(),
          verificationStatus: 'real',
          confidence: 0.85,
          spread: 55,
          region: 'Global',
          coordinates: [40, -74],
          category: 'Economics',
          votes: {
            credible: 180,
            suspicious: 20,
            fake: 10
          },
          explanation: {
            factors: [
              {
                name: 'Data Analysis',
                score: 0.90,
                description: 'Based on comprehensive market data'
              },
              {
                name: 'Expert Consensus',
                score: 0.85,
                description: 'Supported by leading economists'
              },
              {
                name: 'Methodology',
                score: 0.95,
                description: 'Uses established forecasting models'
              }
            ],
            evidence: [
              'Historical market data',
              'Economic indicators',
              'Expert analysis reports'
            ],
            conclusion: 'Well-supported economic analysis based on reliable data and expert consensus.'
          }
        }
      ];
    } catch (error) {
      console.error('Error fetching stories:', error);
      throw new Error('Failed to fetch stories');
    }
  }

  async analyzeStoryContent(story: Story): Promise<AnalysisResult> {
    try {
      // In a real implementation, this would use AI/ML models for analysis
      // For now, we'll return mock analysis based on the story's properties
      const sentiment = story.verificationStatus === 'fake' ? -0.8 : 0.6;
      const topics = [story.category, 'Misinformation', 'Fact Checking'];
      const entities = [story.region, ...story.sources];
      const credibilityScore = story.confidence;

      const explanation = {
        factors: [
          {
            name: 'Source Reliability',
            score: story.sources.length > 1 ? 0.8 : 0.4,
            description: `Story has ${story.sources.length} source${story.sources.length > 1 ? 's' : ''}`
          },
          {
            name: 'Spread Analysis',
            score: 1 - (story.spread / 100),
            description: `Story has spread to ${story.spread}% of potential audience`
          },
          {
            name: 'Community Consensus',
            score: story.votes.credible / (story.votes.credible + story.votes.suspicious + story.votes.fake),
            description: `${Math.round((story.votes.credible / (story.votes.credible + story.votes.suspicious + story.votes.fake)) * 100)}% of voters find it credible`
          }
        ],
        evidence: [
          `Verification Status: ${story.verificationStatus}`,
          `Confidence Score: ${Math.round(story.confidence * 100)}%`,
          `Category: ${story.category}`
        ],
        conclusion: this.generateConclusion(story)
      };

      return {
        sentiment,
        topics,
        entities,
        credibilityScore,
        explanation
      };
    } catch (error) {
      console.error('Error analyzing story:', error);
      throw new Error('Failed to analyze story');
    }
  }

  private generateConclusion(story: Story): string {
    if (story.verificationStatus === 'fake') {
      return 'This story has been identified as false based on multiple factors including lack of credible sources and contradiction with established facts.';
    } else if (story.verificationStatus === 'real') {
      return 'This story has been verified as true with strong evidence and expert consensus.';
    } else {
      return 'This story is currently under investigation. While some evidence suggests credibility, further verification is needed.';
    }
  }

  async updateStoryVote(storyId: string, voteType: 'credible' | 'suspicious' | 'fake'): Promise<void> {
    try {
      // In a real implementation, this would update the vote in a database
      // For now, we'll just simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const story = this.stories.find(s => s.id === storyId);
      if (story) {
        story.votes[voteType]++;
      }
    } catch (error) {
      console.error('Error updating vote:', error);
      throw new Error('Failed to update vote');
    }
  }
}

export const storyDetectionService = new StoryDetectionService();

export function detectStories(): Story[] {
  return [];
}

export function analyzeStoryContent(): AnalysisResult {
  return {
    sentiment: 0,
    topics: [],
    entities: [],
    credibilityScore: 0,
    explanation: {
      factors: [],
      evidence: [],
      conclusion: ''
    }
  };
}

export function validateSource(): Promise<boolean> {
  return Promise.resolve(true);
} 