import { useState } from 'react';
import { Avatar } from './ui/Avatar';
import { Tooltip } from './ui/Tooltip';

interface FactCheckingProps {
  onClose: () => void;
}

interface Story {
  id: string;
  title: string;
  content: string;
  source: string;
  datePosted: string;
  votes: {
    credible: number;
    suspicious: number;
    fake: number;
  };
  status: 'pending' | 'verified' | 'debunked';
  sources: string[];
  category: string;
  activeCheckers: number;
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
  const [totalActiveUsers] = useState(234); // Simulated total active users
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'debunked'>('all');

  const handleVote = (storyId: string, voteType: keyof Story['votes']) => {
    if (userVotes[storyId]) return; // User has already voted

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
    filter === 'all' ? true : story.status === filter
  );

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
                      onClick={() => setFilter('pending')}
                      className={`px-3 py-1 rounded-full text-sm ${
                        filter === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => setFilter('verified')}
                      className={`px-3 py-1 rounded-full text-sm ${
                        filter === 'verified'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Verified
                    </button>
                    <button
                      onClick={() => setFilter('debunked')}
                      className={`px-3 py-1 rounded-full text-sm ${
                        filter === 'debunked'
                          ? 'bg-red-100 text-red-800'
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
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-medium">{story.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          story.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : story.status === 'verified'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {story.status.charAt(0).toUpperCase() + story.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">{story.content}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500">
                            Source: {story.source}
                          </span>
                          <span className="text-sm text-gray-500">
                            Posted: {story.datePosted}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 mr-2">
                            {story.activeCheckers} active checkers
                          </span>
                          <div className="flex -space-x-2">
                            {[...Array(Math.min(3, story.activeCheckers))].map((_, i) => (
                              <div key={i} className="relative">
                                <Avatar
                                  src={`https://i.pravatar.cc/150?img=${i + 10}`}
                                  size="sm"
                                  className="border-2 border-white"
                                />
                              </div>
                            ))}
                            {story.activeCheckers > 3 && (
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 border-2 border-white">
                                <span className="text-xs text-gray-600">
                                  +{story.activeCheckers - 3}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

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
                            onClick={() => handleVote(story.id, 'credible')}
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
                            onClick={() => handleVote(story.id, 'suspicious')}
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
                            onClick={() => handleVote(story.id, 'fake')}
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