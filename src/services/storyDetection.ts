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
    const rawStories = await this.fetchNewsFromMultipleRegions();
    const analyzedStories = await Promise.all(
      rawStories.map(story => this.analyzeStoryWithAI(story))
    );

    return analyzedStories
      .filter((story): story is Story => 
        story.id !== undefined && 
        story.title !== undefined && 
        story.description !== undefined &&
        story.verificationStatus === 'fake' || 
        story.verificationStatus === 'real' || 
        story.verificationStatus === 'unverified' || 
        story.verificationStatus === 'investigating' || 
        story.verificationStatus === 'debunked'
      )
      .sort((a, b) => (b.spread || 0) - (a.spread || 0));
  }

  private async fetchNewsFromMultipleRegions(): Promise<Partial<Story>[]> {
    const regions = ['US', 'EU', 'Asia', 'Africa', 'South America'];
    const stories: Partial<Story>[] = [];

    for (const region of regions) {
      try {
        const response = await axios.get(`https://newsapi.org/v2/top-headlines`, {
          params: {
            country: region.toLowerCase(),
            apiKey: this.newsApiKey
          }
        });

        const articles = response.data.articles || [];
        for (const article of articles) {
          if (article.title && article.description) {
            stories.push({
              id: article.url || Math.random().toString(36).substr(2, 9),
              title: article.title,
              description: article.description,
              spread: Math.floor(Math.random() * 100),
              confidence: Math.random(),
              region: region,
              coordinates: this.getRandomCoordinatesForRegion(region),
              sources: [article.url].filter(Boolean) as string[],
              verificationStatus: 'unverified',
              dateDetected: new Date().toISOString(),
              votes: {
                credible: 0,
                suspicious: 0,
                fake: 0
              }
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching news for region ${region}:`, error);
      }
    }

    return stories;
  }

  private async analyzeStoryWithAI(story: Partial<Story>): Promise<Partial<Story>> {
    try {
      const prompt = `Analyze this story for potential misinformation:
        Title: ${story.title}
        Description: ${story.description}
        
        Please provide:
        1. Verification status (fake, real, unverified, investigating, debunked)
        2. Confidence score (0-1)
        3. Category
        4. Spread potential (0-100)`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
      });

      const analysis = completion.choices[0]?.message?.content || '';
      
      return {
        ...story,
        verificationStatus: this.extractVerificationStatus(analysis),
        confidence: this.extractConfidence(analysis),
        spread: this.extractSpread(analysis)
      };
    } catch (error) {
      console.error('Error analyzing story with AI:', error);
      return story;
    }
  }

  private extractVerificationStatus(analysis: string): Story['verificationStatus'] {
    if (analysis.toLowerCase().includes('fake')) return 'fake';
    if (analysis.toLowerCase().includes('real')) return 'real';
    if (analysis.toLowerCase().includes('debunked')) return 'debunked';
    if (analysis.toLowerCase().includes('investigating')) return 'investigating';
    return 'unverified';
  }

  private extractConfidence(analysis: string): number {
    const match = analysis.match(/confidence[:\s]+(\d+)/i);
    return match ? Math.min(100, Math.max(0, parseInt(match[1]))) : 50;
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
}

export const storyDetectionService = new StoryDetectionService();

export function detectStories(): Story[] {
  return [];
}

export function analyzeStoryContent(): {
  sentiment: number;
  topics: string[];
  entities: string[];
  credibilityScore: number;
} {
  return {
    sentiment: 0,
    topics: [],
    entities: [],
    credibilityScore: 0
  };
}

export function validateSource(): Promise<boolean> {
  return Promise.resolve(true);
} 