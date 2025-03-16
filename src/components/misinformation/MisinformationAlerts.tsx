import { useState, useEffect } from 'react';
import { storyDetectionService } from '../../services/storyDetection';

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  category: string;
  timestamp: string;
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

interface MisinformationAlertsProps {
  onClose: () => void;
}

export function MisinformationAlerts({ onClose }: MisinformationAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [filter, setFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  useEffect(() => {
    fetchAlerts();
    // Set up polling for new alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const stories = await storyDetectionService.fetchGlobalStories();
      
      // Transform stories into alerts
      const newAlerts: Alert[] = stories.map(story => ({
        id: story.id,
        title: story.title,
        description: story.description,
        severity: story.confidence > 0.8 ? 'high' : story.confidence > 0.5 ? 'medium' : 'low',
        category: story.category,
        timestamp: story.dateDetected,
        explanation: {
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
          conclusion: story.verificationStatus === 'fake' 
            ? 'This story has been identified as false based on multiple factors including lack of credible sources and contradiction with established facts.'
            : story.verificationStatus === 'real'
            ? 'This story has been verified as true with strong evidence and expert consensus.'
            : 'This story is currently under investigation. While some evidence suggests credibility, further verification is needed.'
        }
      }));

      setAlerts(newAlerts);
      setError(null);
    } catch (err) {
      setError('Failed to fetch alerts. Please try again later.');
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAlerts = alerts.filter(alert => 
    filter === 'all' ? true : alert.severity === filter
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading alerts...</p>
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
            onClick={fetchAlerts}
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
            <h1 className="text-2xl font-bold text-gray-900">Misinformation Alerts</h1>
            <p className="text-sm text-gray-500">
              <span className="inline-block animate-pulse mr-2">🔴</span>
              Real-time alerts and explanations
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
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Active Alerts</h2>
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
                  onClick={() => setFilter('low')}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filter === 'low'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Low
                </button>
                <button
                  onClick={() => setFilter('medium')}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filter === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Medium
                </button>
                <button
                  onClick={() => setFilter('high')}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filter === 'high'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  High
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {filteredAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                    selectedAlert?.id === alert.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedAlert(alert)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium">{alert.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      alert.severity === 'high'
                        ? 'bg-red-100 text-red-800'
                        : alert.severity === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)} Risk
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{alert.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        Category: {alert.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        Detected: {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {selectedAlert?.id === alert.id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Analysis & Explanation</h4>
                      <div className="space-y-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Risk Factors</h5>
                          <div className="space-y-2">
                            {alert.explanation.factors.map((factor, index) => (
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
                            {alert.explanation.evidence.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Conclusion</h5>
                          <p className="text-sm text-gray-600">{alert.explanation.conclusion}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 