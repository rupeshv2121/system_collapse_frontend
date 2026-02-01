import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Activity, BarChart3, Brain, ChevronRight, Eye, Gamepad2, Sparkles, TrendingUp, Users, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-50/30 to-pink-50/30" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-300 mb-8">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-blue-800 text-sm font-medium">Hackathon Project - Raptors Team</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            System <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Collapse</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
            A psychological game where feedback loops drive chaos, rules evolve, and your mind determines survival.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Gamepad2 className="w-5 h-5 mr-2" />
              Get Started
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="border-blue-300 text-blue-700 hover:bg-blue-50 px-8 py-6 text-lg rounded-xl"
            >
              Explore Features
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Core Features</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Advanced gameplay mechanics powered by psychological feedback systems
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200 p-8 hover:border-blue-400 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Feedback Loops</h3>
              <p className="text-gray-700 mb-4">
                Interconnected systems where every action creates cascading effects. Wrong clicks increase entropy, which triggers phase changes, creating harder gameplay in a continuous cycle.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Entropy loop: Mistakes → Chaos → Harder gameplay</li>
                <li>• Sanity loop: Stress → Visual distortion → More errors</li>
                <li>• Timer loop: Slow decisions → Pressure → Panic</li>
                <li>• Score loop: Success → Confidence → Speed → Risk</li>
              </ul>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200 p-8 hover:border-purple-400 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Entropy Visuals</h3>
              <p className="text-gray-700 mb-4">
                Real-time visual effects that evolve with entropy levels. Experience progressive chaos through color shifts, tile distortions, and screen effects.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Phase 1: Clean, stable interface</li>
                <li>• Phase 3: Color inversions and warping</li>
                <li>• Phase 5: Full visual collapse with glitches</li>
                <li>• Dynamic blur, jitter, and hue shifts</li>
              </ul>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-200 p-8 hover:border-indigo-400 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Adaptive Rules</h3>
              <p className="text-gray-700 mb-4">
                Game rules evolve dynamically based on phase progression. What's "correct" changes as the system collapses, testing your adaptability.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Phase 1: Follow instructions for points</li>
                <li>• Phase 2: Hints appear, complexity grows</li>
                <li>• Phase 3: Rules invert, chaos emerges</li>
                <li>• Phase 4+: Full rule breakdown</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Psychological Profiling Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Psychological Profiling System
              </h2>
              <p className="text-gray-700 text-lg mb-6">
                Advanced behavioral analytics that track over 27+ metrics to build a comprehensive psychological profile of your playstyle.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Brain className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-gray-900 font-semibold mb-1">7 Play Styles</h4>
                    <p className="text-gray-600 text-sm">The Obedient, The Rebel, The Analyst, The Gambler, The Perfectionist, The Chaotic, The Adaptive</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-gray-900 font-semibold mb-1">Psychological Archetypes</h4>
                    <p className="text-gray-600 text-sm">Rule-follower, System-challenger, Pattern-seeker, Chaos-embracer, and more</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-6 h-6 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-gray-900 font-semibold mb-1">Real-time Adaptation</h4>
                    <p className="text-gray-600 text-sm">System learns from your behavior and adjusts difficulty dynamically</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white border-blue-200 p-6 hover:shadow-lg transition-all">
                <BarChart3 className="w-8 h-8 text-blue-600 mb-3" />
                <div className="text-3xl font-bold text-gray-900 mb-1">27+</div>
                <div className="text-gray-600 text-sm">Behavior Metrics</div>
              </Card>
              <Card className="bg-white border-purple-200 p-6 hover:shadow-lg transition-all">
                <Brain className="w-8 h-8 text-purple-600 mb-3" />
                <div className="text-3xl font-bold text-gray-900 mb-1">7</div>
                <div className="text-gray-600 text-sm">Play Styles</div>
              </Card>
              <Card className="bg-white border-indigo-200 p-6 hover:shadow-lg transition-all">
                <Activity className="w-8 h-8 text-indigo-600 mb-3" />
                <div className="text-3xl font-bold text-gray-900 mb-1">Real-time</div>
                <div className="text-gray-600 text-sm">Profiling</div>
              </Card>
              <Card className="bg-white border-pink-200 p-6 hover:shadow-lg transition-all">
                <TrendingUp className="w-8 h-8 text-pink-600 mb-3" />
                <div className="text-3xl font-bold text-gray-900 mb-1">10</div>
                <div className="text-gray-600 text-sm">Session History</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Stack Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Technical Architecture</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Built with modern technologies for optimal performance and scalability
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200 p-8 hover:shadow-lg transition-all">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Frontend</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-gray-700">React 18 + TypeScript</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span className="text-gray-700">Vite for blazing-fast builds</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full" />
                  <span className="text-gray-700">TailwindCSS for styling</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                  <span className="text-gray-700">Custom hooks for game logic</span>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200 p-8 hover:shadow-lg transition-all">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Backend & Database</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-gray-700">Node.js + Express</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-teal-500 rounded-full" />
                  <span className="text-gray-700">Supabase for database & auth</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                  <span className="text-gray-700">Repository pattern architecture</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-gray-700">Real-time analytics tracking</span>
                </div>
              </div>
            </Card>
          </div>

          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 p-8 hover:shadow-lg transition-all">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
              Key Implementation Highlights
            </h3>
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div>
                <h4 className="text-gray-900 font-semibold mb-2">Game State Management</h4>
                <p className="text-gray-600 text-sm">Custom React hooks managing entropy, sanity, phase transitions, and rule evolution</p>
              </div>
              <div>
                <h4 className="text-gray-900 font-semibold mb-2">Audio Integration</h4>
                <p className="text-gray-600 text-sm">Beat-synced audio system with dynamic soundscapes responding to game state</p>
              </div>
              <div>
                <h4 className="text-gray-900 font-semibold mb-2">Analytics Pipeline</h4>
                <p className="text-gray-600 text-sm">Comprehensive data collection with 27+ behavioral metrics and trend analysis</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to test your mind?
          </h2>
          <p className="text-gray-700 text-lg mb-8">
            Experience the psychological thriller where your decisions shape reality.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 text-xl rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Gamepad2 className="w-6 h-6 mr-3" />
            Enter System Collapse
            <ChevronRight className="w-6 h-6 ml-3" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center text-gray-600">
          <p>Built with ❤️ by Raptors Team for Hackathon 2026</p>
          <p className="text-sm mt-2">System Collapse - Where chaos meets consciousness</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
