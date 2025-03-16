import { useState, useEffect, useRef } from 'react';

interface GameEducationProps {
  onClose: () => void;
}

interface Question {
  id: number;
  text: string;
  image: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  realFacts: {
    title: string;
    facts: string[];
    source: string;
  };
}

// Sound effects
const SOUNDS = {
  correct: new Audio('/sounds/correct.mp3'),
  incorrect: new Audio('/sounds/incorrect.mp3'),
  complete: new Audio('/sounds/complete.mp3'),
  hover: new Audio('/sounds/hover.mp3'),
  click: new Audio('/sounds/click.mp3')
};

const sampleQuestions: Question[] = [
  {
    id: 1,
    text: "You receive a shocking video showing a politician making controversial statements. The video quality is slightly blurry. What's your first step?",
    image: "https://placehold.co/600x400/252f3f/ffffff?text=Video+Verification",
    options: [
      "Share it quickly to expose the truth",
      "Check when the video was originally posted and its source",
      "Edit the video to make it clearer",
      "Message the politician directly"
    ],
    correctAnswer: 1,
    explanation: "Always verify the source and timing of videos. Many viral videos are taken out of context or manipulated. Check fact-checking websites and original sources before sharing.",
    category: "Digital Media Verification",
    difficulty: "medium",
    realFacts: {
      title: "Deepfake Statistics 2024",
      facts: [
        "96% increase in deepfake videos online from 2023 to 2024",
        "87% of harmful deepfakes target political figures",
        "Average person spends only 6 seconds verifying video authenticity",
        "AI detection tools can now identify 72% of deepfake videos"
      ],
      source: "State of Deepfakes Report 2024, Digital Forensics Institute"
    }
  },
  {
    id: 2,
    text: "A health-related post claims 'Scientists SHOCKED by this miracle cure!' What's the biggest red flag here?",
    image: "https://placehold.co/600x400/252f3f/ffffff?text=Health+Misinformation",
    options: [
      "The word 'miracle'",
      "Missing citation numbers",
      "Sensational language and caps",
      "All of the above"
    ],
    correctAnswer: 3,
    explanation: "Legitimate medical findings are presented with measured language, proper citations, and without sensationalism. Be wary of posts using emotional manipulation and excessive formatting.",
    category: "Health Misinformation",
    difficulty: "easy",
    realFacts: {
      title: "Health Misinformation Impact",
      facts: [
        "59% of Americans have encountered health misinformation on social media",
        "False health claims spread 6 times faster than factual information",
        "40% of adults have tried unproven treatments due to online claims",
        "Health misinformation costs global healthcare $25B annually"
      ],
      source: "WHO Digital Health Report 2024"
    }
  },
  {
    id: 3,
    text: "Which AI technology poses the greatest threat to election integrity in 2024?",
    image: "https://placehold.co/600x400/252f3f/ffffff?text=Election+AI",
    options: [
      "Voice cloning of candidates",
      "Fake crowd photos at rallies",
      "Generated fake tweets",
      "AI-written news articles"
    ],
    correctAnswer: 0,
    explanation: "Voice cloning technology has become sophisticated enough to create highly convincing fake speeches, making it a primary concern for election misinformation.",
    category: "AI Threats",
    difficulty: "hard",
    realFacts: {
      title: "Election Security Threats 2024",
      facts: [
        "Voice cloning attacks increased by 475% since 2022",
        "83% of voters cannot distinguish AI-cloned voices from real ones",
        "Over 10,000 AI-generated political videos identified in 2023",
        "Election officials reported 312% increase in AI-based threats"
      ],
      source: "Electoral Integrity Project, Stanford University"
    }
  },
  {
    id: 4,
    text: "You notice a pattern of similar messages about a conspiracy theory across social media. What might this indicate?",
    image: "https://placehold.co/600x400/252f3f/ffffff?text=Bot+Networks",
    options: [
      "The theory must be true",
      "A coordinated disinformation campaign",
      "A coincidence in posting",
      "Independent research findings"
    ],
    correctAnswer: 1,
    explanation: "Coordinated campaigns often use networks of bots or paid actors to spread disinformation. Similar messages appearing simultaneously can indicate artificial amplification.",
    category: "Disinformation Campaigns",
    difficulty: "medium",
    realFacts: {
      title: "Social Media Manipulation",
      facts: [
        "70% of viral conspiracy theories are spread by just 1% of accounts",
        "Average bot network contains 5,000-10,000 accounts",
        "Coordinated campaigns can reach 50M users within 2 hours",
        "AI can now detect bot networks with 94% accuracy"
      ],
      source: "Social Media Intelligence Report 2024, Cybersecurity Institute"
    }
  },
  {
    id: 5,
    text: "A climate change post uses a graph showing temperature changes. What should you verify first?",
    image: "https://placehold.co/600x400/252f3f/ffffff?text=Data+Manipulation",
    options: [
      "The colors used in the graph",
      "The title font size",
      "The Y-axis scale and data source",
      "The graph's artistic style"
    ],
    correctAnswer: 2,
    explanation: "Data can be manipulated by changing scales, omitting data points, or selecting specific timeframes. Always check the Y-axis scale and verify data sources for scientific claims.",
    category: "Data Literacy",
    difficulty: "hard",
    realFacts: {
      title: "Data Manipulation in Climate Discussion",
      facts: [
        "76% of misleading climate graphs use manipulated scales",
        "Scientific consensus on climate change is supported by 99.9% of peer-reviewed studies",
        "42% of viral climate graphs omit crucial data points",
        "Proper data visualization can improve understanding by 68%"
      ],
      source: "Climate Science Data Integrity Report 2024"
    }
  }
];

export function GameEducation({ onClose }: GameEducationProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [points, setPoints] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [soundEnabled] = useState(true);

  const currentQuestion = sampleQuestions[currentQuestionIndex];
  const confettiRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (showConfetti && confettiRef.current) {
      // Initialize confetti animation here
      const confetti = {
        start: () => {
          // Confetti animation logic
        },
        stop: () => {
          // Stop confetti
        }
      };
      confetti.start();
      return () => confetti.stop();
    }
  }, [showConfetti]);

  const playSound = (type: keyof typeof SOUNDS) => {
    if (soundEnabled) {
      SOUNDS[type].currentTime = 0;
      SOUNDS[type].play().catch(() => {});
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    
    if (answerIndex === currentQuestion.correctAnswer) {
      playSound('correct');
      const pointsEarned = calculatePoints(currentQuestion.difficulty, streak);
      setScore(score + 1);
      setStreak(streak + 1);
      setPoints(points + pointsEarned);
      if (streak > 0 && streak % 3 === 0) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    } else {
      playSound('incorrect');
      setStreak(0);
    }
  };

  const calculatePoints = (difficulty: string, currentStreak: number) => {
    const basePoints = {
      easy: 100,
      medium: 200,
      hard: 300
    }[difficulty] || 100;
    
    const streakBonus = Math.floor(currentStreak / 3) * 50;
    return basePoints + streakBonus;
  };

  const handleNextQuestion = () => {
    playSound('click');
    if (currentQuestionIndex < sampleQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setGameComplete(true);
      playSound('complete');
      if (score > highScore) {
        setHighScore(score);
        setShowConfetti(true);
      }
    }
  };

  const restartGame = () => {
    playSound('click');
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setGameComplete(false);
    setStreak(0);
    setPoints(0);
    setShowConfetti(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-red-900 text-white flex flex-col">
      {showConfetti && <canvas ref={confettiRef} className="fixed inset-0 z-50 pointer-events-none" />}
      
      <div className="fixed top-4 right-4 flex items-center space-x-4 z-40">
        <button
          onClick={() => {}}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Exit Game
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-6xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Misinformation Detective</h1>
            <div className="flex justify-center items-center space-x-8">
              <div className="bg-black/30 px-6 py-3 rounded-lg">
                <span className="font-semibold">Score:</span> {score}/{sampleQuestions.length}
              </div>
              <div className="bg-black/30 px-6 py-3 rounded-lg">
                <span className="font-semibold">Points:</span> {points}
              </div>
              <div className="bg-black/30 px-6 py-3 rounded-lg">
                <div className="flex items-center">
                  <span className="font-semibold mr-2">Streak:</span>
                  <div className="flex">
                    {Array.from({ length: Math.min(streak, 5) }).map((_, i) => (
                      <span key={i} className="text-yellow-500">🔥</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {!gameComplete ? (
            <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl p-8">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-medium">
                      Question {currentQuestionIndex + 1} of {sampleQuestions.length}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      currentQuestion.difficulty === 'easy' ? 'bg-green-500/20 text-green-300' :
                      currentQuestion.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
                    </span>
                  </div>
                  <span className="text-lg font-medium">Category: {currentQuestion.category}</span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-6">{currentQuestion.text}</h2>
                    <img
                      src={currentQuestion.image}
                      alt={currentQuestion.category}
                      className="w-full h-64 object-cover rounded-lg shadow-lg mb-6"
                    />
                    <div className="bg-black/30 p-6 rounded-lg">
                      <h3 className="text-xl font-bold text-yellow-400 mb-4">
                        {currentQuestion.realFacts.title}
                      </h3>
                      <ul className="space-y-3">
                        {currentQuestion.realFacts.facts.map((fact, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-yellow-500 mr-2">•</span>
                            <span>{fact}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 text-sm text-gray-400">
                        Source: {currentQuestion.realFacts.source}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        onMouseEnter={() => playSound('hover')}
                        disabled={selectedAnswer !== null}
                        className={`w-full p-6 text-left rounded-lg transition-all transform hover:scale-102 ${
                          selectedAnswer === null
                            ? 'hover:bg-white/10 bg-black/20'
                            : selectedAnswer === index
                              ? index === currentQuestion.correctAnswer
                                ? 'bg-green-500/20 border-2 border-green-500'
                                : 'bg-red-500/20 border-2 border-red-500'
                              : index === currentQuestion.correctAnswer
                                ? 'bg-green-500/20 border-2 border-green-500'
                                : 'bg-black/20'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 mr-4 text-lg">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="text-lg">{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {showExplanation && (
                <div className="mt-6 p-6 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <h3 className="text-xl font-semibold text-blue-300 mb-3">Explanation:</h3>
                  <p className="text-blue-100 text-lg mb-4">{currentQuestion.explanation}</p>
                  <button
                    onClick={handleNextQuestion}
                    onMouseEnter={() => playSound('hover')}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105"
                  >
                    Next Question
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl p-12 text-center">
              <h2 className="text-5xl font-bold mb-12">Game Complete! 🎉</h2>
              <div className="grid grid-cols-3 gap-8 mb-12">
                <div className="bg-black/30 p-8 rounded-lg transform hover:scale-105 transition-all">
                  <p className="text-4xl font-bold text-green-400 mb-3">{score}/{sampleQuestions.length}</p>
                  <p className="text-lg text-gray-300">Final Score</p>
                </div>
                <div className="bg-black/30 p-8 rounded-lg transform hover:scale-105 transition-all">
                  <p className="text-4xl font-bold text-yellow-400 mb-3">{points}</p>
                  <p className="text-lg text-gray-300">Total Points</p>
                </div>
                <div className="bg-black/30 p-8 rounded-lg transform hover:scale-105 transition-all">
                  <p className="text-4xl font-bold text-blue-400 mb-3">{Math.max(streak, highScore)}</p>
                  <p className="text-lg text-gray-300">Best Streak</p>
                </div>
              </div>
              {score > highScore && (
                <div className="text-3xl text-green-400 font-bold mb-12 animate-bounce">
                  🏆 New High Score! 🏆
                </div>
              )}
              <button
                onClick={restartGame}
                onMouseEnter={() => playSound('hover')}
                className="px-12 py-4 bg-gradient-to-r from-red-600 to-red-800 text-white text-xl rounded-lg hover:from-red-700 hover:to-red-900 transition-all transform hover:scale-105 shadow-lg"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 