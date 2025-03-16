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
      // In a real implementation, this would fetch from an API
      // For now, we'll return mock data with explanations
      return [
        {
          id: '1',
          title: 'Breaking News: Major Scientific Discovery',
          description: 'Scientists have made a groundbreaking discovery in quantum computing.',
          sources: ['reliable-news.com', 'science-journal.org'],
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
          title: 'Viral Social Media Claim',
          description: 'A viral post claims a new miracle cure for a common condition.',
          sources: ['social-media.com'],
          dateDetected: new Date().toISOString(),
          verificationStatus: 'fake',
          confidence: 0.95,
          spread: 85,
          region: 'Global',
          coordinates: [0, 0],
          category: 'Health',
          votes: {
            credible: 10,
            suspicious: 30,
            fake: 150
          },
          explanation: {
            factors: [
              {
                name: 'Source Reliability',
                score: 0.2,
                description: 'Unverified social media post without credible sources'
              },
              {
                name: 'Scientific Evidence',
                score: 0.1,
                description: 'No peer-reviewed studies or clinical trials supporting the claim'
              },
              {
                name: 'Expert Consensus',
                score: 0.15,
                description: 'Contradicts established medical knowledge'
              }
            ],
            evidence: [
              'No scientific studies cited',
              'Contradicts FDA guidelines',
              'Similar claims previously debunked'
            ],
            conclusion: 'This claim is likely false due to lack of evidence and contradiction with medical consensus.'
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