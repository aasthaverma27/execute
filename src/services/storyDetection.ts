import OpenAI from 'openai';
import axios from 'axios';

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
}

class StoryDetectionService {
  private openai: OpenAI;
  private newsApiKey: string;

  constructor() {
    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
    this.newsApiKey = import.meta.env.VITE_NEWS_API_KEY;
  }

  async fetchGlobalStories(): Promise<Story[]> {
    try {
      // Fetch recent news from multiple regions
      const regions = await this.fetchNewsFromMultipleRegions();
      
      // Analyze each story for misinformation
      const analyzedStories = await Promise.all(
        regions.map(async (story) => {
          const analysis = await this.analyzeStoryWithAI(story);
          return {
            ...story,
            ...analysis
          };
        })
      );

      // Filter and sort stories by spread and confidence
      return analyzedStories
        .filter(story => story.verificationStatus === 'fake' || story.verificationStatus === 'likely_fake')
        .sort((a, b) => b.spread - a.spread);
    } catch (error) {
      console.error('Error fetching global stories:', error);
      // Return sample data for development/testing
      return this.getSampleStories();
    }
  }

  private async fetchNewsFromMultipleRegions(): Promise<Partial<Story>[]> {
    try {
      const response = await axios.get(
        `https://newsapi.org/v2/top-headlines?language=en&pageSize=100`,
        {
          headers: {
            'X-Api-Key': this.newsApiKey
          }
        }
      );

      return response.data.articles.map((article: any) => ({
        title: article.title,
        description: article.description,
        sources: [article.url],
        dateDetected: new Date().toISOString(),
        region: article.country || 'Unknown'
      }));
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  }

  private async analyzeStoryWithAI(story: Partial<Story>): Promise<Partial<Story>> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert fact-checker and misinformation analyst. Analyze the given news story and provide a detailed assessment of its credibility."
          },
          {
            role: "user",
            content: `Please analyze this news story for potential misinformation:
              Title: ${story.title}
              Description: ${story.description}
              
              Provide an analysis with:
              1. Verification status (fake, likely_fake, unverified, likely_true, true)
              2. Confidence score (0-100)
              3. Category of misinformation (if applicable)
              4. Estimated spread level (0-100)`
          }
        ]
      });

      const analysis = completion.choices[0].message.content;
      // Parse the AI response and extract relevant information
      const verificationStatus = this.extractVerificationStatus(analysis);
      const confidence = this.extractConfidence(analysis);
      const category = this.extractCategory(analysis);
      const spread = this.extractSpread(analysis);

      return {
        verificationStatus,
        confidence,
        category,
        spread,
        coordinates: this.getRandomCoordinatesForRegion(story.region || 'Unknown')
      };
    } catch (error) {
      console.error('Error analyzing story with AI:', error);
      // Return default values for development/testing
      return {
        verificationStatus: 'unverified',
        confidence: 50,
        category: 'general',
        spread: 50,
        coordinates: [0, 0]
      };
    }
  }

  private extractVerificationStatus(analysis: string): Story['verificationStatus'] {
    if (analysis.toLowerCase().includes('fake')) return 'fake';
    if (analysis.toLowerCase().includes('likely fake')) return 'likely_fake';
    if (analysis.toLowerCase().includes('likely true')) return 'likely_true';
    if (analysis.toLowerCase().includes('true')) return 'true';
    return 'unverified';
  }

  private extractConfidence(analysis: string): number {
    const match = analysis.match(/confidence[:\s]+(\d+)/i);
    return match ? Math.min(100, Math.max(0, parseInt(match[1]))) : 50;
  }

  private extractCategory(analysis: string): string {
    const categories = ['political', 'health', 'science', 'technology', 'social'];
    for (const category of categories) {
      if (analysis.toLowerCase().includes(category)) return category;
    }
    return 'general';
  }

  private extractSpread(analysis: string): number {
    const match = analysis.match(/spread[:\s]+(\d+)/i);
    return match ? Math.min(100, Math.max(0, parseInt(match[1]))) : 50;
  }

  private getRandomCoordinatesForRegion(region: string): [number, number] {
    const regionCoordinates: { [key: string]: [number, number] } = {
      'US': [37.0902, -95.7129],
      'GB': [55.3781, -3.4360],
      'IN': [20.5937, 78.9629],
      'Unknown': [0, 0]
    };

    const coordinates = regionCoordinates[region] || regionCoordinates['Unknown'];
    return [
      coordinates[0] + (Math.random() - 0.5) * 10,
      coordinates[1] + (Math.random() - 0.5) * 10
    ];
  }

  private getSampleStories(): Story[] {
    return [
      {
        id: '1',
        title: 'Breaking News Story',
        description: 'Important development in current events',
        spread: 85,
        confidence: 0.92,
        region: 'North America',
        coordinates: [37.7749, -122.4194],
        sources: ['source1.com', 'source2.com'],
        verificationStatus: 'investigating',
        dateDetected: new Date().toISOString(),
        votes: {
          credible: 150,
          suspicious: 50,
          fake: 20
        }
      },
      {
        id: '2',
        title: 'Sample Fake Story 1',
        description: 'This is a sample fake story for testing purposes',
        spread: 75,
        confidence: 85,
        region: "US",
        coordinates: [37.0902, -95.7129],
        sources: ["https://example.com"],
        verificationStatus: "fake",
        dateDetected: new Date().toISOString(),
        votes: {
          credible: 100,
          suspicious: 0,
          fake: 0
        }
      },
      {
        id: '3',
        title: 'Sample Fake Story 2',
        description: 'Another sample fake story for testing',
        spread: 60,
        confidence: 75,
        region: "GB",
        coordinates: [55.3781, -3.4360],
        sources: ["https://example.com"],
        verificationStatus: "likely_fake",
        dateDetected: new Date().toISOString(),
        votes: {
          credible: 50,
          suspicious: 0,
          fake: 0
        }
      }
    ];
  }
}

export const storyDetectionService = new StoryDetectionService();

export function detectStories(content: string): Story[] {
  // Mock implementation
  const stories: Story[] = [
    {
      id: '1',
      title: 'Breaking News Story',
      description: 'Important development in current events',
      spread: 85,
      confidence: 0.92,
      region: 'North America',
      coordinates: [37.7749, -122.4194],
      sources: ['source1.com', 'source2.com'],
      verificationStatus: 'investigating',
      dateDetected: new Date().toISOString(),
      votes: {
        credible: 150,
        suspicious: 50,
        fake: 20
      }
    }
  ];

  return stories.sort((a, b) => b.spread - a.spread);
}

export function analyzeStoryContent(content: string): {
  sentiment: number;
  topics: string[];
  entities: string[];
  credibilityScore: number;
} {
  // Mock implementation
  return {
    sentiment: 0.75,
    topics: ['politics', 'technology'],
    entities: ['Organization A', 'Person B'],
    credibilityScore: 0.85
  };
}

export function validateSource(url: string): Promise<boolean> {
  // Mock implementation
  return Promise.resolve(true);
} 