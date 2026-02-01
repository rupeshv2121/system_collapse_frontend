/**
 * Guided Tour Component
 * 
 * Creates an interactive onboarding experience that highlights different sections
 * of the page with explanations.
 * 
 * HOW IT WORKS:
 * 1. Takes an array of steps (each with a target selector and content)
 * 2. Creates a spotlight effect by dimming everything except the current target
 * 3. Shows a tooltip with explanation and navigation buttons
 * 4. Stores completion status in localStorage
 * 
 * HOW TO MODIFY:
 * - Add/remove steps in the `steps` array
 * - Change spotlight styles in the overlay/highlight classes
 * - Customize tooltip positioning and appearance
 * - Adjust animation speeds in transition classes
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export interface TourStep {
  target: string; // CSS selector for the element to highlight
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right'; // Tooltip position relative to target
}

interface GuidedTourProps {
  steps: TourStep[];
  storageKey: string; // localStorage key to track if tour was completed
  isOpen?: boolean; // Manual control - when true, tour is forced open
  onComplete?: () => void;
  onSkip?: () => void;
  onClose?: () => void;
}

export const GuidedTour = ({ steps, storageKey, isOpen = false, onComplete, onSkip, onClose }: GuidedTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Check if tour should be shown on mount (only first time)
  useEffect(() => {
    const hasCompletedTour = localStorage.getItem(storageKey);
    if (!hasCompletedTour && !isOpen) {
      // Small delay to ensure DOM is ready
      setTimeout(() => setIsActive(true), 500);
    }
  }, [storageKey, isOpen]);

  // Handle manual open via isOpen prop
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setIsActive(true);
    } else if (!isOpen && isActive) {
      setIsActive(false);
    }
  }, [isOpen]);

  // Update target element position when step changes
  useEffect(() => {
    if (!isActive) return;

    const updatePosition = () => {
      const element = document.querySelector(steps[currentStep].target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        
        // Scroll element into view smoothly
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [currentStep, isActive, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(storageKey, 'true');
    setIsActive(false);
    setCurrentStep(0);
    onComplete?.();
    onClose?.();
  };

  const handleSkip = () => {
    localStorage.setItem(storageKey, 'true');
    setIsActive(false);
    setCurrentStep(0);
    onSkip?.();
    onClose?.();
  };

  if (!isActive || !targetRect) return null;

  const step = steps[currentStep];
  const position = step.position || 'bottom';

  // Calculate tooltip position based on target and preferred position
  const getTooltipStyle = (): React.CSSProperties => {
    const offset = 20; // Distance from target element
    const style: React.CSSProperties = {
      position: 'fixed',
      zIndex: 10002,
      maxWidth: '400px',
    };

    switch (position) {
      case 'top':
        style.left = targetRect.left + targetRect.width / 2;
        style.bottom = window.innerHeight - targetRect.top + offset;
        style.transform = 'translateX(-50%)';
        break;
      case 'bottom':
        style.left = targetRect.left + targetRect.width / 2;
        style.top = targetRect.bottom + offset;
        style.transform = 'translateX(-50%)';
        break;
      case 'left':
        style.right = window.innerWidth - targetRect.left + offset;
        style.top = targetRect.top + targetRect.height / 2;
        style.transform = 'translateY(-50%)';
        break;
      case 'right':
        style.left = targetRect.right + offset;
        style.top = targetRect.top + targetRect.height / 2;
        style.transform = 'translateY(-50%)';
        break;
    }

    return style;
  };

  return createPortal(
    <div className="guided-tour-overlay">
      {/* Dark overlay with cutout for highlighted element */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none transition-opacity duration-300"
        style={{ 
          zIndex: 10000,
          width: '100vw',
          height: '100vh',
        }}
        preserveAspectRatio="none"
      >
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={targetRect.left - 8}
              y={targetRect.top - 8}
              width={targetRect.width + 16}
              height={targetRect.height + 16}
              rx="8"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Border highlight for the target element */}
      <div
        className="fixed bg-transparent border-4 border-blue-500 rounded-lg transition-all duration-500 ease-in-out pointer-events-none animate-pulse"
        style={{
          zIndex: 10001,
          left: targetRect.left - 8,
          top: targetRect.top - 8,
          width: targetRect.width + 16,
          height: targetRect.height + 16,
          boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.3), 0 0 20px rgba(59, 130, 246, 0.5)',
        }}
      />

      {/* Tooltip with step content */}
      <Card 
        className="animate-in fade-in slide-in-from-top-4 duration-300"
        style={getTooltipStyle()}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-primary">
                  Step {currentStep + 1} of {steps.length}
                </span>
              </div>
              <h3 className="font-bold text-lg">{step.title}</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleSkip}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <p className="text-sm text-muted-foreground mb-4">
            {step.content}
          </p>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSkip}
            >
              Skip Tour
            </Button>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                >
                  Previous
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleNext}
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1 mt-3">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-6 bg-primary'
                    : 'w-1.5 bg-muted'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>,
    document.body
  );
};

// Hook to restart the tour manually
export const useGuidedTour = (storageKey: string) => {
  const restartTour = () => {
    localStorage.removeItem(storageKey);
    window.location.reload();
  };

  const hasCompletedTour = () => {
    return localStorage.getItem(storageKey) === 'true';
  };

  return { restartTour, hasCompletedTour };
};
