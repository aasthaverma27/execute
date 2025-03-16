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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Collaborative Fact-Checking</h1>
            <div className="flex items-center space-x-2">
              <span className="inline-block animate-pulse mr-2">🟢</span>
              <span className="text-sm text-gray-500">{totalActiveUsers} fact checkers online</span>
              <span className="text-sm text-gray-400">•</span>
              <span className="text-sm text-gray-500">{stories.length} stories being tracked</span>
            </div>
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
      <div className="pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar - Active Users & Stats */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
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

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold mb-4">Categories</h2>
                  <div className="space-y-2">
                    {Array.from(new Set(stories.map(s => s.category))).map(category => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{category}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {stories.filter(s => s.category === category).length}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold mb-4">Verification Status</h2>
                  <div className="space-y-2">
                    <button
                      onClick={() => setFilter('all')}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === 'all'
                          ? 'bg-blue-100 text-blue-800'
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      All Stories
                    </button>
                    <button
                      onClick={() => setFilter('investigating')}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === 'investigating'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      Investigating
                    </button>
                    <button
                      onClick={() => setFilter('real')}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === 'real'
                          ? 'bg-green-100 text-green-800'
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      Verified
                    </button>
                    <button
                      onClick={() => setFilter('fake')}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === 'fake'
                          ? 'bg-red-100 text-red-800'
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      Fake
                    </button>
                    <button
                      onClick={() => setFilter('debunked')}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === 'debunked'
                          ? 'bg-purple-100 text-purple-800'
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      Debunked
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content - Stories */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {filteredStories.map(story => (
                  <div
                    key={story.id}
                    className={`bg-white rounded-xl shadow-sm transition-all ${
                      selectedStory?.id === story.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                    }`}
                  >
                    <div className="p-6" onClick={() => handleStoryClick(story)}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
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
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                              {story.category}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">{story.title}</h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              Confidence: {(story.confidence * 100).toFixed(0)}%
                            </div>
                            <div className="text-sm text-gray-500">
                              Spread: {story.spread}%
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4">{story.description}</p>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <span className="text-sm text-gray-500">Sources:</span>
                            {story.sources.map((source, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded-full"
                              >
                                {source}
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          Detected: {new Date(story.dateDetected).toLocaleDateString()}
                        </span>
                      </div>

                      {selectedStory?.id === story.id && analysis && (
                        <div className="mt-6 space-y-6 border-t pt-6">
                          <div>
                            <h4 className="text-lg font-semibold mb-4">Analysis & Explanation</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <h5 className="font-medium text-gray-900">Credibility Factors</h5>
                                <div className="space-y-3">
                                  {analysis.explanation.factors.map((factor, index) => (
                                    <div key={index}>
                                      <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-gray-700">
                                          {factor.name}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                          {(factor.score * 100).toFixed(0)}%
                                        </span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                          className={`h-2 rounded-full ${
                                            factor.score > 0.7
                                              ? 'bg-green-500'
                                              : factor.score > 0.4
                                              ? 'bg-yellow-500'
                                              : 'bg-red-500'
                                          }`}
                                          style={{ width: `${factor.score * 100}%` }}
                                        ></div>
                                      </div>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {factor.description}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div>
                                  <h5 className="font-medium text-gray-900 mb-2">Evidence</h5>
                                  <ul className="space-y-2">
                                    {analysis.explanation.evidence.map((item, index) => (
                                      <li key={index} className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span className="text-sm text-gray-600">{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div>
                                  <h5 className="font-medium text-gray-900 mb-2">Conclusion</h5>
                                  <p className="text-sm text-gray-600">
                                    {analysis.explanation.conclusion}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="border-t pt-6">
                            <h5 className="font-medium text-gray-900 mb-4">Community Verification</h5>
                            <div className="grid grid-cols-3 gap-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVote(story.id, 'credible');
                                }}
                                disabled={!!userVotes[story.id]}
                                className={`flex flex-col items-center p-4 rounded-lg transition-colors ${
                                  userVotes[story.id] === 'credible'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-50 hover:bg-gray-100'
                                }`}
                              >
                                <span className="text-2xl mb-2">👍</span>
                                <span className="font-medium">Credible</span>
                                <span className="text-sm">
                                  {getVotePercentage(story.votes).credible}%
                                </span>
                                <span className="text-xs text-gray-500">
                                  {story.votes.credible} votes
                                </span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVote(story.id, 'suspicious');
                                }}
                                disabled={!!userVotes[story.id]}
                                className={`flex flex-col items-center p-4 rounded-lg transition-colors ${
                                  userVotes[story.id] === 'suspicious'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-50 hover:bg-gray-100'
                                }`}
                              >
                                <span className="text-2xl mb-2">🤔</span>
                                <span className="font-medium">Suspicious</span>
                                <span className="text-sm">
                                  {getVotePercentage(story.votes).suspicious}%
                                </span>
                                <span className="text-xs text-gray-500">
                                  {story.votes.suspicious} votes
                                </span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVote(story.id, 'fake');
                                }}
                                disabled={!!userVotes[story.id]}
                                className={`flex flex-col items-center p-4 rounded-lg transition-colors ${
                                  userVotes[story.id] === 'fake'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-50 hover:bg-gray-100'
                                }`}
                              >
                                <span className="text-2xl mb-2">❌</span>
                                <span className="font-medium">Fake</span>
                                <span className="text-sm">
                                  {getVotePercentage(story.votes).fake}%
                                </span>
                                <span className="text-xs text-gray-500">
                                  {story.votes.fake} votes
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 