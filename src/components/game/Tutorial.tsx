import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Brain, ChevronLeft, ChevronRight, Eye, Shuffle, Skull, X, Zap } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  phase?: number;
  demo?: React.ReactNode;
}

interface TutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

// Interactive Demo Component with Real Tile Clicks
const InteractiveTileDemo = ({ phase }: { phase: number }) => {
  const [clickedTile, setClickedTile] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'chaos'>('success');

  const tiles = [
    { id: 'red', color: 'bg-red-500', name: 'RED' },
    { id: 'blue', color: 'bg-blue-500', name: 'BLUE' },
    { id: 'green', color: 'bg-green-500', name: 'GREEN' },
    { id: 'yellow', color: 'bg-yellow-400', name: 'YELLOW' },
  ];

  const handleTileClick = (tileId: string, _tileName: string) => {
    setClickedTile(tileId);
    
    if (phase === 1) {
      // Phase 1: Simple matching
      if (tileId === 'red') {
        setFeedbackType('success');
        setFeedback('✓ Correct! +10 points');
      } else {
        setFeedbackType('error');
        setFeedback('✗ Wrong. -5 points');
      }
    } else if (phase === 2) {
      // Phase 2: Instruction says RED but BLUE is correct
      if (tileId === 'blue') {
        setFeedbackType('success');
        setFeedback('✓ Hidden reward! +15 points');
      } else if (tileId === 'red') {
        setFeedbackType('error');
        setFeedback('✗ Following instruction = -10 points');
      } else {
        setFeedbackType('error');
        setFeedback('✗ Wrong. -5 points');
      }
    } else if (phase === 3) {
      // Phase 3: Inversion
      if (tileId === 'blue' || tileId === 'green' || tileId === 'yellow') {
        setFeedbackType('success');
        setFeedback('✓ Disobedience rewarded! +20 points');
      } else {
        setFeedbackType('error');
        setFeedback('✗ Following rules = -15 points');
      }
    } else if (phase === 4) {
      // Phase 4: Behavior-based
      setFeedbackType('success');
      setFeedback('✓ Speed noted. +12 points');
    } else if (phase === 5) {
      setFeedbackType('chaos');
      setFeedback('?? CHAOS $#@! ??');
    }

    setTimeout(() => {
      setClickedTile(null);
      setFeedback('');
    }, 1500);
  };

  const getPhaseInstruction = () => {
    switch (phase) {
      case 1:
        return 'Click RED';
      case 2:
        return 'Instruction: Click RED (But BLUE rewards...)';
      case 3:
        return 'Instruction: Click RED (Disobey to win)';
      case 4:
        return 'Speed & variety matter';
      case 5:
        return 'No rules remain';
      default:
        return 'Click any tile';
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-card/50 rounded-lg border border-border">
      <div className="text-sm font-semibold text-foreground">
        {getPhaseInstruction()}
      </div>
      
      {/* Interactive Tiles - Clickable */}
      <div className="flex gap-3">
        {tiles.map((tile) => (
          <button
            key={tile.id}
            onClick={() => handleTileClick(tile.id, tile.name)}
            className={cn(
              "w-16 h-16 rounded-lg transition-all transform cursor-pointer",
              "hover:scale-110 active:scale-95 hover:shadow-lg",
              "border-2 border-transparent",
              tile.color,
              clickedTile === tile.id && "ring-4 ring-white scale-110 shadow-xl border-white"
            )}
            title={`Click to try ${tile.name}`}
          />
        ))}
      </div>

      {/* Real-time Feedback */}
      {feedback && (
        <div className={cn(
          "text-sm font-bold animate-bounce",
          feedbackType === 'success' && 'text-green-500',
          feedbackType === 'error' && 'text-red-500',
          feedbackType === 'chaos' && 'text-yellow-500 animate-pulse'
        )}>
          {feedback}
        </div>
      )}

      <div className="text-xs text-muted-foreground text-center">
        Click tiles to experience this phase
      </div>
    </div>
  );
};

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'Welcome to System Drift',
    description: 'An experimental game where rules intentionally decay. What starts as a simple color-matching game will evolve into chaos. Trust nothing. Question everything.',
    icon: <Zap className="w-8 h-8 text-primary" />,
  },
  {
    title: 'Phase 1: Stable',
    description: 'Follow the instruction. Click the color shown. Simple, honest rules. Enjoy this clarity while it lasts.',
    icon: <Eye className="w-8 h-8 text-primary" />,
    phase: 1,
    demo: <InteractiveTileDemo phase={1} />,
  },
  {
    title: 'Phase 2: Meaning Drift',
    description: 'The instruction says one thing... but the truth shifts. A hidden color now rewards you. The displayed instruction becomes a lie.',
    icon: <Shuffle className="w-8 h-8 text-secondary-foreground" />,
    phase: 2,
    demo: <InteractiveTileDemo phase={2} />,
  },
  {
    title: 'Phase 3: Inversion',
    description: 'Everything inverts. Correct becomes wrong. Wrong becomes right. Your instincts will betray you.',
    icon: <Shuffle className="w-8 h-8 text-destructive rotate-180" />,
    phase: 3,
    demo: <InteractiveTileDemo phase={3} />,
  },
  {
    title: 'Phase 4: Behavior-Based',
    description: 'Colors no longer matter. The system watches HOW you play. Speed, variety, patterns—your behavior determines your fate.',
    icon: <Brain className="w-8 h-8 text-accent-foreground" />,
    phase: 4,
    demo: <InteractiveTileDemo phase={4} />,
  },
  {
    title: 'Phase 5: Collapse',
    description: 'Reality breaks. Tiles shake, colors mutate, meaning dissolves. There are no rules—only survival.',
    icon: <Skull className="w-8 h-8 text-destructive animate-pulse" />,
    phase: 5,
    demo: <InteractiveTileDemo phase={5} />,
  },
  {
    title: 'Entropy & Sanity',
    description: 'ENTROPY rises with every action, pushing you toward chaos. SANITY drains when rules betray you. If sanity hits zero, collapse is forced. Survive to 100% entropy with positive score to win.',
    icon: <Zap className="w-8 h-8 text-accent-foreground" />,
    demo: (
      <div className="flex gap-4 p-4 bg-card/50 rounded-lg">
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Entropy</div>
          <div className="text-lg font-bold text-accent-foreground">↑ CHAOS</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Sanity</div>
          <div className="text-lg font-bold text-primary">↓ STABILITY</div>
        </div>
      </div>
    ),
  },
  {
    title: 'Ready to Collapse?',
    description: 'The system is watching. Adapt. Distrust. Survive. Good luck—you will need it.',
    icon: <Zap className="w-8 h-8 text-primary animate-pulse" />,
  },
];

const TutorialNew = ({ onComplete, onSkip }: TutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;
  const navigate = useNavigate();

  const handleNext = useCallback(() => {
    if (isLastStep) {
      navigate('/dashboard');
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLastStep, onComplete]);

  const handlePrev = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in">
      <div className="max-w-2xl w-full mx-4 p-6 bg-card rounded-xl border border-border neon-glow shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {step.icon}
            {step.phase && (
              <span className={cn(
                "px-2 py-0.5 text-xs font-bold rounded",
                step.phase === 1 && "bg-blue-500/15 text-blue-700",
                step.phase === 2 && "bg-purple-500/15 text-purple-700",
                step.phase === 3 && "bg-red-500/15 text-red-700",
                step.phase === 4 && "bg-emerald-500/15 text-emerald-700",
                step.phase === 5 && "bg-rose-500/20 text-rose-700 animate-pulse"
              )}>
                Phase {step.phase}
              </span>
            )}
          </div>
          <Link to="/dashboard">
            <Button
              variant="ghost"
              size="icon"
              onClick={onSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-6">
          <h2 className="text-2xl font-bold font-game tracking-wider text-foreground">
            {step.title}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {step.description}
          </p>
          {step.demo && (
            <div className="mt-4">
              {step.demo}
            </div>
          )}
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {TUTORIAL_STEPS.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentStep
                  ? "w-6 bg-primary"
                  : index < currentStep
                  ? "bg-primary/50"
                  : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          
          <Button
            onClick={handleNext}
            className="gap-1 font-game tracking-wider neon-glow"
          >
            {isLastStep ? 'BEGIN COLLAPSE' : 'Next'}
            {!isLastStep && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TutorialNew;
