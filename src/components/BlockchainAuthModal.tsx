import { useState } from 'react';

interface BlockchainAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BlockchainRecord {
  id: string;
  hash: string;
  timestamp: string;
  contentType: string;
  status: 'verified' | 'pending' | 'failed';
  source: string;
}

export function BlockchainAuthModal({ isOpen, onClose }: BlockchainAuthModalProps) {
  const [activeTab, setActiveTab] = useState<'verify' | 'track' | 'stats'>('verify');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [records, setRecords] = useState<BlockchainRecord[]>([
    {
      id: '1',
      hash: '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      timestamp: new Date().toISOString(),
      contentType: 'image/jpeg',
      status: 'verified',
      source: 'Local Upload'
    }
  ]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setVerificationStatus('idle');
  };

  const simulateVerification = () => {
    if (!selectedFile) return;

    setVerificationStatus('processing');
    setTimeout(() => {
      const newRecord: BlockchainRecord = {
        id: Math.random().toString(36).substr(2, 9),
        hash: '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
          .map(b => b.toString(16).padStart(2, '0'))
          .join(''),
        timestamp: new Date().toISOString(),
        contentType: selectedFile.type,
        status: Math.random() > 0.2 ? 'verified' : 'failed',
        source: 'Local Upload'
      };

      setRecords(prev => [newRecord, ...prev]);
      setVerificationStatus(newRecord.status === 'verified' ? 'success' : 'error');
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative bg-gray-900 rounded-xl max-w-4xl w-full">
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/80 hover:text-white text-xl p-2"
        >
          ✕
        </button>
        
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            Blockchain Authentication
          </h2>

          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('verify')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'verify'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              Verify Content
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'track'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              Track Changes
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'stats'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              Source Stats
            </button>
          </div>

          {activeTab === 'verify' && (
            <div className="space-y-6">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-gray-700 hover:border-red-500/50'
                }`}
              >
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer"
                >
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-red-600/10 flex items-center justify-center">
                      <span className="text-3xl">🔐</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        Drop your file here or click to upload
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        Supports images, videos, and documents up to 50MB
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              {selectedFile && (
                <div className="bg-white/5 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-white font-medium">{selectedFile.name}</h3>
                      <p className="text-sm text-gray-400">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    {verificationStatus === 'idle' && (
                      <button
                        onClick={simulateVerification}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Verify Authenticity
                      </button>
                    )}
                  </div>

                  {verificationStatus === 'processing' && (
                    <div className="flex items-center space-x-3 text-white">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Verifying content on blockchain...</span>
                    </div>
                  )}

                  {verificationStatus === 'success' && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-green-400">
                        <span>✓</span>
                        <span className="font-medium">Content verified!</span>
                      </div>
                      <p className="text-sm text-green-300 mt-2">
                        This content has been successfully verified on the blockchain.
                      </p>
                    </div>
                  )}

                  {verificationStatus === 'error' && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-red-400">
                        <span>⚠</span>
                        <span className="font-medium">Verification failed</span>
                      </div>
                      <p className="text-sm text-red-300 mt-2">
                        Could not verify this content. It may have been manipulated.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'track' && (
            <div className="space-y-4">
              {records.map(record => (
                <div
                  key={record.id}
                  className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        record.status === 'verified' ? 'bg-green-500' :
                        record.status === 'pending' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="text-white font-medium">
                          {record.hash.slice(0, 18)}...{record.hash.slice(-4)}
                        </p>
                        <p className="text-sm text-gray-400">
                          {new Date(record.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">{record.contentType}</p>
                      <p className="text-sm text-gray-500">{record.source}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">Verification Stats</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Success Rate</span>
                      <span className="text-white">92%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Average Time</span>
                      <span className="text-white">1.2s</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Network Load</span>
                      <span className="text-white">65%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">Content Types</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Images</span>
                      <span className="text-white">45%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Videos</span>
                      <span className="text-white">30%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: '30%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Documents</span>
                      <span className="text-white">25%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 