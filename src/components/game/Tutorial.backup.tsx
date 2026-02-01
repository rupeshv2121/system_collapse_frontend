/**
 * Interactive Tutorial Component
 * Explains game mechanics before first play
 */

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Brain, ChevronLeft, ChevronRight, Eye, Shuffle, Skull, X, Zap } from 'lucide-react';
import { useCallback, useState } from 'react';

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

// Interactive Demo Components
// @ts-ignore - Component kept for reference
const _InteractiveTileDemo = ({ phase }: { phase: number }) => {
  const [clickedTile, setClickedTile] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>('');

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
        setFeedback('✓ Correct! +10 points');
      } else {
        setFeedback('✗ Wrong. -5 points');
      }
    } else if (phase === 2) {
      // Phase 2: Instruction says RED but BLUE is correct
      if (tileId === 'blue') {
        setFeedback('✓ Hidden reward! +15 points');
      } else if (tileId === 'red') {
        setFeedback('✗ Following instruction = -10 points');
      } else {
        setFeedback('✗ Wrong. -5 points');
      }
    } else if (phase === 3) {
      // Phase 3: Inversion
      if (tileId === 'blue' || tileId === 'green' || tileId === 'yellow') {
        setFeedback('✓ Disobedience rewarded! +20 points');
      } else {
        setFeedback('✗ Following rules = -15 points');
      }
    } else if (phase === 4) {
      // Phase 4: Behavior-based
      setFeedback(`✓ Speed noted. +12 points`);
    } else if (phase === 5) {
      setFeedback('?? CHAOS $#@!');
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
        return 'Disobey instructions to win';
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
      
      {/* Interactive Tiles */}
      <div className="flex gap-2">
        {tiles.map((tile) => (
          <button
            key={tile.id}
            onClick={() => handleTileClick(tile.id, tile.name)}
            className={cn(
              "w-14 h-14 rounded-lg transition-all transform hover:scale-110 active:scale-95",
              tile.color,
              clickedTile === tile.id && "ring-2 ring-white scale-110 shadow-lg"
            )}
            title={`Click to try ${tile.name}`}
          />
        ))}
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={cn(
          "text-sm font-semibold animate-bounce",
          feedback.includes('✓') && 'text-green-500',
          feedback.includes('✗') && 'text-red-500',
          feedback.includes('??') && 'text-yellow-500'
        )}>
          {feedback}
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        Try clicking tiles to see feedback
      </div>
    </div>
  );
};

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'Welcome to Rule Collapse',
    description: 'An experimental game where rules intentionally decay. What starts as a simple color-matching game will evolve into chaos. Trust nothing. Question everything.',
    icon: <Zap className="w-8 h-8 text-primary" />,
  },
  {
    title: 'Phase 1: Stable',
    description: 'Follow the instruction. Click the color shown. Simple, honest rules. Enjoy this clarity while it lasts.',
    icon: <Eye className="w-8 h-8 text-primary" />,
    phase: 1,
    demo: (
      <div className="flex flex-col items-center gap-3 p-4 bg-card/50 rounded-lg">
        <div className="text-sm text-muted-foreground">Instruction: Pick RED</div>
        <div className="flex gap-2">
          <div className="w-12 h-12 rounded bg-game-red" />
          <div className="w-12 h-12 rounded bg-game-blue opacity-50" />
          <div className="w-12 h-12 rounded bg-game-green opacity-50" />
          <div className="w-12 h-12 rounded bg-game-yellow opacity-50" />
        </div>
        <div className="text-xs text-primary">Click RED = +10 points ✓</div>
      </div>
    ),
  },
  {
    title: 'Phase 2: Meaning Drift',
    description: 'The instruction says one thing... but the truth shifts. A hidden color now rewards you. The displayed instruction becomes a lie.',
    icon: <Shuffle className="w-8 h-8 text-secondary" />,
    phase: 2,
    demo: (
      <div className="flex flex-col items-center gap-3 p-4 bg-card/50 rounded-lg">
        <div className="text-sm text-muted-foreground">Instruction: Pick RED</div>
        <div className="text-xs text-destructive">(But BLUE secretly rewards...)</div>
        <div className="flex gap-2">
          <div className="w-12 h-12 rounded bg-game-red opacity-50" />
          <div className="w-12 h-12 rounded bg-game-blue ring-2 ring-secondary" />
          <div className="w-12 h-12 rounded bg-game-green opacity-50" />
          <div className="w-12 h-12 rounded bg-game-yellow opacity-50" />
        </div>
      </div>
    ),
  },
  {
    title: 'Phase 3: Inversion',
    description: 'Everything inverts. Correct becomes wrong. Wrong becomes right. Your instincts will betray you.',
    icon: <Shuffle className="w-8 h-8 text-destructive rotate-180" />,
    phase: 3,
    demo: (
      <div className="flex flex-col items-center gap-3 p-4 bg-card/50 rounded-lg border border-destructive/30">
        <div className="text-sm text-muted-foreground line-through">Pick RED</div>
        <div className="text-xs text-destructive">Following instructions = PUNISHMENT</div>
        <div className="text-xs text-primary">Disobey to survive</div>
      </div>
    ),
  },
  {
    title: 'Phase 4: Behavior-Based',
    description: 'Colors no longer matter. The system watches HOW you play. Speed, variety, patterns—your behavior determines your fate.',
    icon: <Brain className="w-8 h-8 text-accent" />,
    phase: 4,
    demo: (
      <div className="flex flex-col items-center gap-3 p-4 bg-card/50 rounded-lg">
        <div className="space-y-1 text-xs text-center">
          <div className="text-primary">⚡ Fast clicks = rewarded</div>
          <div className="text-destructive">🔄 Repetition = punished</div>
          <div className="text-secondary">🎨 Variety = rewarded</div>
        </div>
      </div>
    ),
  },
  {
    title: 'Phase 5: Collapse',
    description: 'Reality breaks. Tiles shake, colors mutate, meaning dissolves. There are no rules—only survival.',
    icon: <Skull className="w-8 h-8 text-destructive animate-pulse" />,
    phase: 5,
    demo: (
      <div className="flex flex-col items-center gap-3 p-4 bg-card/50 rounded-lg animate-jitter">
        <div className="text-sm text-destructive glitch-text" data-text="P̷i̶c̵k̴ ̸?̷?̴?̵">
          P̷i̶c̵k̴ ̸?̷?̴?̵
        </div>
        <div className="flex gap-2">
          <div className="w-12 h-12 rounded bg-game-red animate-pulse" style={{ transform: 'rotate(-5deg)' }} />
          <div className="w-12 h-12 rounded bg-game-blue animate-pulse" style={{ transform: 'rotate(3deg)' }} />
          <div className="w-12 h-12 rounded bg-game-green animate-pulse" style={{ transform: 'rotate(-2deg)' }} />
          <div className="w-12 h-12 rounded bg-game-yellow animate-pulse" style={{ transform: 'rotate(4deg)' }} />
        </div>
      </div>
    ),
  },
  {
    title: 'Entropy & Sanity',
    description: 'ENTROPY rises with every action, pushing you toward chaos. SANITY drains when rules betray you. If sanity hits zero, collapse is forced. Survive to 100% entropy with positive score to win.',
    icon: <Zap className="w-8 h-8 text-accent" />,
    demo: (
      <div className="flex gap-4 p-4 bg-card/50 rounded-lg">
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Entropy</div>
          <div className="text-lg font-bold text-accent">↑ CHAOS</div>
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

const Tutorial = ({ onComplete, onSkip }: TutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  const handleNext = useCallback(() => {
    if (isLastStep) {
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
      <div className="max-w-lg w-full mx-4 p-6 bg-card rounded-xl border border-border neon-glow">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {step.icon}
            {step.phase && (
              <span className={cn(
                "px-2 py-0.5 text-xs font-bold rounded",
                step.phase === 1 && "bg-primary/20 text-primary",
                step.phase === 2 && "bg-secondary/20 text-secondary",
                step.phase === 3 && "bg-destructive/20 text-destructive",
                step.phase === 4 && "bg-accent/20 text-accent",
                step.phase === 5 && "bg-destructive/30 text-destructive animate-pulse"
              )}>
                Phase {step.phase}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
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

export default Tutorial;
