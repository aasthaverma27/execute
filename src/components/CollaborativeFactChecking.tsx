import { useState, useEffect } from 'react';
import { Avatar } from './ui/Avatar';
import { Tooltip } from './ui/Tooltip';
import { storyDetectionService } from '../services/storyDetection';

interface FactCheckingProps {
  onClose: () => void;
}

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

const activeUsers = [
  { id: 1, name: "Fact Checker 1", avatar: "https://i.pravatar.cc/150?img=1", status: "online" },
  { id: 2, name: "Fact Checker 2", avatar: "https://i.pravatar.cc/150?img=2", status: "online" },
  { id: 3, name: "Fact Checker 3", avatar: "https://i.pravatar.cc/150?img=3", status: "online" },
  { id: 4, name: "Fact Checker 4", avatar: "https://i.pravatar.cc/150?img=4", status: "away" },
  { id: 5, name: "Fact Checker 5", avatar: "https://i.pravatar.cc/150?img=5", status: "online" }
];

export function CollaborativeFactChecking({ onClose }: FactCheckingProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, keyof Story['votes']>>({});
  const [totalActiveUsers] = useState(234);
  const [filter, setFilter] = useState<'all' | 'investigating' | 'real' | 'fake' | 'debunked'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    fetchStories();
  }, []);

  useEffect(() => {
    if (selectedStory) {
      analyzeStory(selectedStory);
    }
  }, [selectedStory]);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const fetchedStories = await storyDetectionService.fetchGlobalStories();
      setStories(fetchedStories);
      setError(null);
    } catch (err) {
      setError('Failed to fetch stories. Please try again later.');
      console.error('Error fetching stories:', err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeStory = async (story: Story) => {
    try {
      const result = await storyDetectionService.analyzeStoryContent(story);
      setAnalysis(result);
    } catch (err) {
      console.error('Error analyzing story:', err);
    }
  };

  const handleStoryClick = (story: Story) => {
    setSelectedStory(story);
  };

  const handleVote = async (storyId: string, voteType: keyof Story['votes']) => {
    if (userVotes[storyId]) return;

    try {
      await storyDetectionService.updateStoryVote(storyId, voteType);
      
      setStories(prevStories =>
        prevStories.map(story => {
          if (story.id === storyId) {
            return {
              ...story,
              votes: {
                ...story.votes,
                [voteType]: story.votes[voteType] + 1
              }
            };
          }
          return story;
        })
      );

      setUserVotes(prev => ({
        ...prev,
        [storyId]: voteType
      }));

      // Re-analyze the story after voting
      const updatedStory = stories.find(s => s.id === storyId);
      if (updatedStory) {
        analyzeStory(updatedStory);
      }
    } catch (error) {
      console.error('Error updating vote:', error);
      // Revert the vote if the update fails
      setStories(prevStories =>
        prevStories.map(story => {
          if (story.id === storyId) {
            return {
              ...story,
              votes: {
                ...story.votes,
                [voteType]: story.votes[voteType] - 1
              }
            };
          }
          return story;
        })
      );
      setUserVotes(prev => {
        const newVotes = { ...prev };
        delete newVotes[storyId];
        return newVotes;
      });
    }
  };

  const getVotePercentage = (votes: Story['votes']) => {
    const total = votes.credible + votes.suspicious + votes.fake;
    return {
      credible: Math.round((votes.credible / total) * 100),
      suspicious: Math.round((votes.suspicious / total) * 100),
      fake: Math.round((votes.fake / total) * 100)
    };
  };

  const filteredStories = stories.filter(story => 
    filter === 'all' ? true : story.verificationStatus === filter
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading stories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchStories}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Collaborative Fact-Checking</h1>
            <p className="text-sm text-gray-500">
              <span className="inline-block animate-pulse mr-2">🟢</span>
              {totalActiveUsers} fact checkers online
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar - Active Users */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Active Fact Checkers</h2>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {activeUsers.map(user => (
                      <Tooltip key={user.id} content={user.name}>
                        <div className="relative">
                          <Avatar src={user.avatar} alt={user.name} size="sm" />
                          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                            user.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                          }`}></span>
                        </div>
                      </Tooltip>
                    ))}
                  </div>
                  <div className="text-sm text-gray-500">
                    +{totalActiveUsers - activeUsers.length} more fact checkers
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content - Stories */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold">Stories to Verify</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setFilter('all')}
                      className={`px-3 py-1 rounded-full text-sm ${
                        filter === 'all'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilter('investigating')}
                      className={`px-3 py-1 rounded-full text-sm ${
                        filter === 'investigating'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Investigating
                    </button>
                    <button
                      onClick={() => setFilter('real')}
                      className={`px-3 py-1 rounded-full text-sm ${
                        filter === 'real'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Verified
                    </button>
                    <button
                      onClick={() => setFilter('fake')}
                      className={`px-3 py-1 rounded-full text-sm ${
                        filter === 'fake'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Fake
                    </button>
                    <button
                      onClick={() => setFilter('debunked')}
                      className={`px-3 py-1 rounded-full text-sm ${
                        filter === 'debunked'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Debunked
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {filteredStories.map(story => (
                    <div
                      key={story.id}
                      className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                        selectedStory?.id === story.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => handleStoryClick(story)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-medium">{story.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          story.verificationStatus === 'investigating'
                            ? 'bg-yellow-100 text-yellow-800'
                            : story.verificationStatus === 'real'
                            ? 'bg-green-100 text-green-800'
                            : story.verificationStatus === 'fake'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {story.verificationStatus.charAt(0).toUpperCase() + story.verificationStatus.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">{story.description}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500">
                            Source: {story.sources.join(', ')}
                          </span>
                          <span className="text-sm text-gray-500">
                            Date Detected: {story.dateDetected}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 mr-2">
                            Spread: {story.spread.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500">
                            Confidence: {story.confidence.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {selectedStory?.id === story.id && analysis && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold mb-2">Analysis & Explanation</h4>
                          <div className="space-y-4">
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Credibility Factors</h5>
                              <div className="space-y-2">
                                {analysis.explanation.factors.map((factor, index) => (
                                  <div key={index} className="flex items-center justify-between">
                                    <div>
                                      <span className="text-sm font-medium">{factor.name}</span>
                                      <p className="text-xs text-gray-600">{factor.description}</p>
                                    </div>
                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${factor.score * 100}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Evidence</h5>
                              <ul className="list-disc list-inside text-sm text-gray-600">
                                {analysis.explanation.evidence.map((item, index) => (
                                  <li key={index}>{item}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Conclusion</h5>
                              <p className="text-sm text-gray-600">{analysis.explanation.conclusion}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          {story.sources.map((source, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
                            >
                              {source}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVote(story.id, 'credible');
                            }}
                            disabled={!!userVotes[story.id]}
                            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${
                              userVotes[story.id] === 'credible'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            Credible ({getVotePercentage(story.votes).credible}%)
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVote(story.id, 'suspicious');
                            }}
                            disabled={!!userVotes[story.id]}
                            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${
                              userVotes[story.id] === 'suspicious'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            Suspicious ({getVotePercentage(story.votes).suspicious}%)
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVote(story.id, 'fake');
                            }}
                            disabled={!!userVotes[story.id]}
                            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${
                              userVotes[story.id] === 'fake'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            Fake ({getVotePercentage(story.votes).fake}%)
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 