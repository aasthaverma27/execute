import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

interface GeneratedStory {
  id: number;
  title: string;
  description: string;
  spread: number;
  date: string;
  locations: Array<{
    lat: number;
    lng: number;
    intensity: number;
  }>;
  image: string;
}

interface CountryData {
  name: string;
  code: string;
  stories: GeneratedStory[];
  totalMisinformation: number;
  topCategories: string[];
}

export async function generateCountryData(countryCode: string): Promise<CountryData> {
  try {
    console.log(`Generating data for country: ${countryCode}`);
    
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not set. Please check your .env file.');
    }

    // Generate story content using GPT-4
    console.log('Generating story content with GPT-4...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Generate realistic misinformation data for ${countryCode}. Include:
          1. A list of 2-3 current misinformation stories
          2. Each story should have a title, description, spread percentage (0-100), and date
          3. Include realistic locations with lat/lng coordinates
          4. Add relevant categories for the country
          5. Calculate total misinformation score
          Format the response as JSON.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    console.log('Parsing GPT-4 response...');
    const generatedData = JSON.parse(completion.choices[0].message.content || '{}');

    // Generate image URLs using DALL-E
    console.log('Generating images with DALL-E...');
    const storiesWithImages = await Promise.all(
      generatedData.stories.map(async (story: Omit<GeneratedStory, 'id'>, index: number) => {
        try {
          const imageCompletion = await openai.images.generate({
            model: "dall-e-3",
            prompt: `Create a realistic news image for: ${story.title}. The image should be professional and relevant to the story.`,
            n: 1,
            size: "1024x1024",
          });

          return {
            ...story,
            id: index + 1,
            image: imageCompletion.data[0].url,
          };
        } catch (imageError) {
          console.error(`Error generating image for story ${index + 1}:`, imageError);
          // Fallback to a placeholder image if DALL-E fails
          return {
            ...story,
            id: index + 1,
            image: 'https://via.placeholder.com/1024x1024?text=Image+Generation+Failed',
          };
        }
      })
    );

    console.log('Data generation completed successfully');
    return {
      ...generatedData,
      stories: storiesWithImages,
    };
  } catch (error) {
    console.error('Error generating country data:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate data for ${countryCode}: ${error.message}`);
    }
    throw error;
  }
}

export async function generateAllCountriesData(): Promise<{ [key: string]: CountryData }> {
  const countryCodes = ['US', 'GB', 'IN', 'BR', 'CN', 'RU'];
  const countryData: { [key: string]: CountryData } = {};

  for (const code of countryCodes) {
    try {
      console.log(`Processing country: ${code}`);
      countryData[code] = await generateCountryData(code);
    } catch (error) {
      console.error(`Error generating data for ${code}:`, error);
      // Continue with other countries even if one fails
      continue;
    }
  }

  return countryData;
} 