import { useState, useEffect, useRef } from 'react';
import { BlockchainAuthModal } from './BlockchainAuthModal';

interface FeatureCard {
  title: string;
  description: string;
  icon: string;
  color: string;
  stats?: {
    value: string;
    label: string;
  };
  onClick?: () => void;
}

interface LandingPageProps {
  onFeatureClick: (feature: string) => void;
}

interface AnalysisResult {
  type: 'authentic' | 'manipulated' | 'ai-generated';
  confidence: number;
  details: {
    label: string;
    value: number;
  }[];
  warnings: string[];
}

export function LandingPage({ onFeatureClick }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false);
  const [animatedStats, setAnimatedStats] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showBlockchainModal, setShowBlockchainModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      if (window.scrollY > 300) {
        setAnimatedStats(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 80; // Approximate navbar height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const features: FeatureCard[] = [
    {
      title: "AI-Powered Media Detection",
      description: "Advanced deep learning algorithms to detect manipulated images and videos with high precision",
      icon: "🔍",
      color: "from-purple-500 to-indigo-600",
      stats: {
        value: "98%",
        label: "Detection Accuracy"
      },
      onClick: () => setShowMediaModal(true)
    },
    {
      title: "Explainable Misinformation Alerts",
      description: "Real-time alerts with detailed explanations of detected misinformation patterns",
      icon: "⚠️",
      color: "from-amber-500 to-orange-600",
      stats: {
        value: "500K+",
        label: "Daily Alerts"
      },
      onClick: () => onFeatureClick("Explainable Misinformation Alerts")
    },
    {
      title: "Collaborative Fact-Checking",
      description: "Join the community in verifying content, voting on credibility, and sharing trusted sources",
      icon: "👥",
      color: "from-blue-500 to-cyan-600",
      stats: {
        value: "50K+",
        label: "Active Checkers"
      },
      onClick: () => onFeatureClick("Collaborative Fact-Checking")
    },
    {
      title: "Blockchain Authentication",
      description: "Verify content authenticity using distributed ledger technology",
      icon: "🔐",
      color: "from-emerald-500 to-teal-600",
      stats: {
        value: "1M+",
        label: "Verified Records"
      },
      onClick: () => setShowBlockchainModal(true)
    },
    {
      title: "Misinformation Heatmap",
      description: "Visual analytics of misinformation spread across platforms and regions",
      icon: "🌍",
      color: "from-rose-500 to-pink-600",
      stats: {
        value: "180+",
        label: "Countries Covered"
      },
      onClick: () => onFeatureClick("Misinformation Heatmap")
    },
    {
      title: "Gamified Education",
      description: "Learn to spot fake news through interactive challenges and rewards",
      icon: "🎮",
      color: "from-violet-500 to-purple-600",
      stats: {
        value: "2M+",
        label: "Active Players"
      },
      onClick: () => onFeatureClick("Gamified Education")
    }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setAnalysisResult(null);
    }
  };

  const simulateAnalysis = () => {
    setIsAnalyzing(true);
    // Simulated analysis result after 2 seconds
    setTimeout(() => {
      setAnalysisResult({
        type: Math.random() > 0.5 ? 'authentic' : 'manipulated',
        confidence: 0.89 + Math.random() * 0.1,
        details: [
          { label: 'Manipulation Detection', value: 0.92 },
          { label: 'GAN Detection', value: 0.88 },
          { label: 'Metadata Analysis', value: 0.95 },
        ],
        warnings: [
          'Potential metadata inconsistencies detected',
          'Unusual compression patterns found'
        ]
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-red-900 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-red-500/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/80 backdrop-blur-md py-4' : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-white">
                <span className="text-red-500">TRUTH</span>GUARD
              </h1>
              <div className="hidden md:flex space-x-6">
                <button 
                  onClick={() => scrollToSection('features')}
                  className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  Features
                </button>
                <button 
                  onClick={() => scrollToSection('stats')}
                  className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  Stats
                </button>
                <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
              </div>
            </div>
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-all transform hover:scale-105">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Breaking News Alert Banner */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white px-4 py-3 flex items-center justify-center mt-20">
        <div className="flex items-center space-x-4 animate-marquee">
          <span className="animate-pulse">🔴</span>
          <p className="text-sm font-medium">BREAKING: Misinformation levels at an all-time high. Stay protected.</p>
          <span className="h-4 w-px bg-red-400/50"></span>
          <p className="text-sm font-medium">New AI detection models deployed worldwide.</p>
          <span className="h-4 w-px bg-red-400/50"></span>
          <p className="text-sm font-medium">Community fact-checkers prevent major disinformation campaign.</p>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">
            <span className="inline-block animate-text-gradient bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              Defend Truth
            </span>
            <br />
            in the Digital Age
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Advanced AI-powered defense against digital misinformation,
            <br className="hidden md:block" />
            protecting communities worldwide in real-time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-800 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/25">
              Start Protecting Now
            </button>
            <button 
              onClick={() => setShowVideoModal(true)}
              className="w-full sm:w-auto border border-white/20 bg-white/10 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-all backdrop-blur-sm flex items-center justify-center space-x-2"
            >
              <span className="text-xl">▶</span>
              <span>Watch Demo</span>
            </button>
          </div>
        </div>

        {/* Video Modal */}
        {showVideoModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="relative bg-gray-900 rounded-xl max-w-4xl w-full">
              <button 
                onClick={() => setShowVideoModal(false)}
                className="absolute -top-12 right-0 text-white/80 hover:text-white text-xl p-2"
              >
                ✕
              </button>
              <div className="aspect-video rounded-t-xl overflow-hidden bg-black">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/DhysUu854PI?autoplay=0"
                  title="TruthGuard Demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-2">How TruthGuard Works</h3>
                <p className="text-gray-400">
                  Watch this quick demo to see how our AI-powered system detects and prevents misinformation in real-time.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <div className="bg-gray-800 rounded-full px-4 py-1 text-sm text-gray-300">
                    🎯 AI Detection
                  </div>
                  <div className="bg-gray-800 rounded-full px-4 py-1 text-sm text-gray-300">
                    🔄 Real-time Analysis
                  </div>
                  <div className="bg-gray-800 rounded-full px-4 py-1 text-sm text-gray-300">
                    🛡️ Active Protection
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute bottom-1/4 right-10 w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-float animation-delay-2000"></div>
      </div>

      {/* Stats Section */}
      <div id="stats" className="relative py-20 bg-black/30 backdrop-blur-sm scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className={`text-center transform transition-all duration-1000 ${
              animatedStats ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <p className="text-red-500 text-4xl font-bold mb-2">98%</p>
              <p className="text-gray-400">Detection Rate</p>
            </div>
            <div className={`text-center transform transition-all duration-1000 delay-300 ${
              animatedStats ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <p className="text-red-500 text-4xl font-bold mb-2">500K+</p>
              <p className="text-gray-400">Scans Daily</p>
            </div>
            <div className={`text-center transform transition-all duration-1000 delay-500 ${
              animatedStats ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <p className="text-red-500 text-4xl font-bold mb-2">50M+</p>
              <p className="text-gray-400">Users Protected</p>
            </div>
            <div className={`text-center transform transition-all duration-1000 delay-700 ${
              animatedStats ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <p className="text-red-500 text-4xl font-bold mb-2">24/7</p>
              <p className="text-gray-400">Active Defense</p>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div id="about" className="relative py-24 bg-gradient-to-r from-gray-900 to-black scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Defending Truth in the
                <span className="block text-red-500">Digital Age</span>
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                At TruthGuard, we're committed to combating the spread of misinformation through innovative technology and community collaboration. Our AI-powered platform combines advanced detection algorithms with human expertise to create a robust defense against digital deception.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-red-600/10 flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Our Mission</h3>
                    <p className="text-gray-400">To empower individuals and organizations with tools to identify, verify, and combat misinformation effectively.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-red-600/10 flex items-center justify-center">
                    <span className="text-2xl">💫</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Our Impact</h3>
                    <p className="text-gray-400">Protected over 50 million users and prevented countless misinformation campaigns across 180+ countries.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-red-600/10 flex items-center justify-center">
                    <span className="text-2xl">🤝</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Our Community</h3>
                    <p className="text-gray-400">A global network of fact-checkers, researchers, and technology experts working together for truth.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-red-500/10 to-purple-500/10 p-1">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-purple-500/20 animate-pulse"></div>
                <div className="relative bg-gray-900 rounded-xl p-8 h-full">
                  <div className="grid grid-cols-2 gap-6">
                    {/* First Column */}
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-red-500/10 to-purple-500/10 rounded-lg p-4 transform hover:scale-105 transition-transform duration-300 hover:shadow-lg hover:shadow-red-500/10">
                        <h4 className="text-red-500 text-2xl font-bold">98%</h4>
                        <p className="text-gray-400 text-sm">Detection Accuracy</p>
                      </div>
                      <div className="bg-gradient-to-br from-red-500/10 to-purple-500/10 rounded-lg p-4 transform hover:scale-105 transition-transform duration-300 hover:shadow-lg hover:shadow-red-500/10">
                        <h4 className="text-red-500 text-2xl font-bold">24/7</h4>
                        <p className="text-gray-400 text-sm">Active Defense</p>
                      </div>
                      <div className="bg-gradient-to-br from-red-500/10 to-purple-500/10 rounded-lg p-4 transform hover:scale-105 transition-transform duration-300 hover:shadow-lg hover:shadow-red-500/10">
                        <h4 className="text-red-500 text-2xl font-bold">500K+</h4>
                        <p className="text-gray-400 text-sm">Daily Scans</p>
                      </div>
                      <div className="bg-gradient-to-br from-red-500/10 to-purple-500/10 rounded-lg p-4 transform hover:scale-105 transition-transform duration-300 hover:shadow-lg hover:shadow-red-500/10">
                        <h4 className="text-red-500 text-2xl font-bold">1M+</h4>
                        <p className="text-gray-400 text-sm">Threats Blocked</p>
                      </div>
                    </div>
                    {/* Second Column */}
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-red-500/10 to-purple-500/10 rounded-lg p-4 transform hover:scale-105 transition-transform duration-300 hover:shadow-lg hover:shadow-red-500/10">
                        <h4 className="text-red-500 text-2xl font-bold">50M+</h4>
                        <p className="text-gray-400 text-sm">Users Protected</p>
                      </div>
                      <div className="bg-gradient-to-br from-red-500/10 to-purple-500/10 rounded-lg p-4 transform hover:scale-105 transition-transform duration-300 hover:shadow-lg hover:shadow-red-500/10">
                        <h4 className="text-red-500 text-2xl font-bold">180+</h4>
                        <p className="text-gray-400 text-sm">Countries</p>
                      </div>
                      <div className="bg-gradient-to-br from-red-500/10 to-purple-500/10 rounded-lg p-4 transform hover:scale-105 transition-transform duration-300 hover:shadow-lg hover:shadow-red-500/10">
                        <h4 className="text-red-500 text-2xl font-bold">10K+</h4>
                        <p className="text-gray-400 text-sm">Expert Contributors</p>
                      </div>
                      <div className="bg-gradient-to-br from-red-500/10 to-purple-500/10 rounded-lg p-4 transform hover:scale-105 transition-transform duration-300 hover:shadow-lg hover:shadow-red-500/10">
                        <h4 className="text-red-500 text-2xl font-bold">5B+</h4>
                        <p className="text-gray-400 text-sm">Data Points Analyzed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-red-500/30 to-purple-500/30 rounded-full filter blur-xl animate-blob"></div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full filter blur-xl animate-blob animation-delay-2000"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 scroll-mt-20">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
          Comprehensive Protection Features
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br ${feature.color} transform transition-all duration-300 ease-in-out hover:scale-105 cursor-pointer`}
              onClick={feature.onClick || (() => onFeatureClick(feature.title))}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-black/0 via-black/0 to-black/20 z-0 
                group-hover:via-black/10 transition-all duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-5xl transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </span>
                  {feature.stats && (
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">{feature.stats.value}</p>
                      <p className="text-sm text-white/80">{feature.stats.label}</p>
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-white/90">
                  {feature.title}
                </h3>
                <p className="text-white/80 text-sm leading-relaxed group-hover:text-white/70">
                  {feature.description}
                </p>
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-white/90">Explore →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-purple-900/20 mix-blend-multiply"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">
            Ready to Fight Misinformation?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join the global movement against digital deception. Start protecting yourself and your community today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-800 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/25">
              Start Your Free Trial
            </button>
            <button className="w-full sm:w-auto border border-white/20 bg-white/10 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-all backdrop-blur-sm">
              Schedule Demo
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20 bg-black/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 TruthGuard. All rights reserved. Powered by Advanced AI Technology.
            </p>
          </div>
        </div>
      </footer>

      {/* Media Detection Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative bg-gray-900 rounded-xl max-w-4xl w-full">
            <button 
              onClick={() => {
                setShowMediaModal(false);
                setUploadedFile(null);
                setPreviewUrl('');
                setAnalysisResult(null);
              }}
              className="absolute -top-12 right-0 text-white/80 hover:text-white text-xl p-2"
            >
              ✕
            </button>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-white mb-4">
                AI-Powered Media Detection
              </h3>
              <p className="text-gray-400 mb-6">
                Upload an image or video to analyze for potential manipulation or AI generation.
                Our advanced algorithms will detect deepfakes and other forms of digital manipulation.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Upload Section */}
                <div className="space-y-6">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center cursor-pointer
                    hover:border-red-500/50 transition-colors"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*,video/*"
                      className="hidden"
                    />
                    {!uploadedFile ? (
                      <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-red-600/10 flex items-center justify-center">
                          <span className="text-3xl">📤</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">Drop your file here or click to upload</p>
                          <p className="text-sm text-gray-400 mt-2">Supports images and videos up to 50MB</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {previewUrl && (
                          <img 
                            src={previewUrl} 
                            alt="Preview" 
                            className="max-h-48 mx-auto rounded-lg"
                          />
                        )}
                        <p className="text-white font-medium">{uploadedFile.name}</p>
                        <p className="text-sm text-gray-400">
                          {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    )}
                  </div>

                  {uploadedFile && !isAnalyzing && !analysisResult && (
                    <button
                      onClick={simulateAnalysis}
                      className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white px-6 py-3 rounded-lg
                      font-semibold transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
                    >
                      Analyze Media
                    </button>
                  )}

                  {isAnalyzing && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
                      <p className="text-white mt-4">Analyzing your media...</p>
                    </div>
                  )}
                </div>

                {/* Results Section */}
                {analysisResult && (
                  <div className="bg-gray-800/50 rounded-xl p-6 space-y-6">
                    <div className="text-center">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4
                        ${analysisResult.type === 'authentic' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        <span className="text-3xl">
                          {analysisResult.type === 'authentic' ? '✅' : '⚠️'}
                        </span>
                      </div>
                      <h4 className={`text-xl font-bold mb-2
                        ${analysisResult.type === 'authentic' ? 'text-green-500' : 'text-red-500'}`}>
                        {analysisResult.type === 'authentic' ? 'Authentic Media' : 'Potential Manipulation Detected'}
                      </h4>
                      <p className="text-gray-400">
                        {(analysisResult.confidence * 100).toFixed(1)}% confidence
                      </p>
                    </div>

                    <div className="space-y-4">
                      {analysisResult.details.map((detail, index) => (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">{detail.label}</span>
                            <span className="text-white">{(detail.value * 100).toFixed(1)}%</span>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-1000"
                              style={{ width: `${detail.value * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {analysisResult.warnings.length > 0 && (
                      <div className="bg-red-500/10 rounded-lg p-4">
                        <h5 className="text-white font-semibold mb-2">Warnings</h5>
                        <ul className="space-y-2">
                          {analysisResult.warnings.map((warning, index) => (
                            <li key={index} className="text-sm text-red-400 flex items-center">
                              <span className="mr-2">⚠️</span>
                              {warning}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-800">
                <h4 className="text-white font-semibold mb-4">How it works</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-2xl mb-2">🔍</div>
                    <h5 className="text-white font-medium mb-2">Deepfake Detection</h5>
                    <p className="text-sm text-gray-400">Advanced neural networks analyze facial features and movement patterns</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-2xl mb-2">🧬</div>
                    <h5 className="text-white font-medium mb-2">GAN Analysis</h5>
                    <p className="text-sm text-gray-400">Identifies artifacts and patterns typical of AI-generated content</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-2xl mb-2">📊</div>
                    <h5 className="text-white font-medium mb-2">Forensic Analysis</h5>
                    <p className="text-sm text-gray-400">Examines metadata and compression patterns for manipulation signs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blockchain Auth Modal */}
      {showBlockchainModal && (
        <BlockchainAuthModal
          isOpen={showBlockchainModal}
          onClose={() => setShowBlockchainModal(false)}
        />
      )}
    </div>
  );
} 