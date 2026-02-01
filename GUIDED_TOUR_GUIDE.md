# Guided Tour Implementation Guide

## 🎯 What It Does

The Guided Tour creates an interactive walkthrough that:
- **Highlights** specific sections of your page one at a time
- **Dims** the rest of the page to focus attention
- **Shows tooltips** with explanations
- **Tracks progress** using localStorage (won't show again once completed)
- **Allows navigation** (Next, Previous, Skip)

## 🏗️ How It Works

### 1. **Core Component** (`guided-tour.tsx`)
Located in: `src/components/ui/guided-tour.tsx`

**Key Features:**
- Creates a dark overlay that dims the entire page
- Uses a "spotlight" effect (border + shadow) to highlight target elements
- Shows a tooltip card with explanation and navigation buttons
- Uses `createPortal` to render on top of everything (z-index 10000+)
- Automatically scrolls highlighted elements into view

### 2. **Integration** (in `AnalyticsDashboard.tsx`)

**Steps to integrate:**

#### a) Import the component:
```tsx
import { GuidedTour, TourStep } from '@/components/ui/guided-tour';
import { HelpCircle } from 'lucide-react';
```

#### b) Define tour steps:
```tsx
const tourSteps: TourStep[] = [
  {
    target: '[data-tour="header"]',      // CSS selector for element
    title: 'Welcome! 👋',                 // Tooltip title
    content: 'This is the explanation',   // Tooltip content
    position: 'bottom',                   // Where tooltip appears
  },
  // ... more steps
];
```

#### c) Add data attributes to elements:
```tsx
<div data-tour="header">
  {/* Your content */}
</div>
```

#### d) Add the GuidedTour component:
```tsx
<GuidedTour
  steps={tourSteps}
  storageKey="analytics-tour-completed"  // localStorage key
  onComplete={() => console.log('Done!')}
  onSkip={() => console.log('Skipped')}
/>
```

#### e) Add a restart button (optional):
```tsx
const handleRestartTour = () => {
  localStorage.removeItem('analytics-tour-completed');
  setShowTour(true);
  setTimeout(() => {
    setShowTour(false);
    setTimeout(() => setShowTour(true), 100);
  }, 50);
};

<Button onClick={handleRestartTour}>
  <HelpCircle /> Tour
</Button>
```

## 🎨 Customization Options

### 1. **Modify Tour Steps**
Edit the `tourSteps` array in `AnalyticsDashboard.tsx`:

```tsx
const tourSteps: TourStep[] = [
  {
    target: '[data-tour="my-section"]',   // Change selector
    title: 'Custom Title',                 // Change title
    content: 'Custom explanation...',      // Change content
    position: 'right',                     // top | bottom | left | right
  },
];
```

### 2. **Change Styling**

In `guided-tour.tsx`, modify:

**Overlay darkness:**
```tsx
<div className="fixed inset-0 bg-black/70" />  // Change /70 to /50 for lighter
```

**Spotlight color:**
```tsx
className="border-4 border-blue-500"  // Change to border-green-500, etc.
```

**Tooltip width:**
```tsx
maxWidth: '400px'  // Change in getTooltipStyle()
```

**Animation speed:**
```tsx
className="transition-all duration-500"  // Change duration-500 to duration-300, etc.
```

### 3. **Adjust Positioning**

In `getTooltipStyle()` function, modify:
```tsx
const offset = 20;  // Distance from target (increase for more space)
```

### 4. **Change Progress Indicators**

In the JSX at the bottom:
```tsx
{/* Progress dots */}
<div className="flex justify-center gap-1 mt-3">
  {steps.map((_, index) => (
    <div className={`h-1.5 rounded-full ...`} />  // Change h-1.5 to h-2, etc.
  ))}
</div>
```

## 📱 How to Use

### First Time Users:
1. Visit Analytics page
2. Tour starts automatically after 500ms
3. Follow the steps using Next/Previous buttons
4. Click "Skip Tour" or "Finish" to complete

### Returning Users:
- Tour won't show again (stored in localStorage)
- Click the "Tour" button (help icon) to restart it

## 🔧 Advanced Modifications

### Add More Features:

#### 1. **Keyboard Navigation**
Add to `GuidedTour` component:
```tsx
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'Escape') handleSkip();
  };
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [currentStep]);
```

#### 2. **Different Tours for Different Pages**
Create separate tour configs:
```tsx
// In Leaderboard.tsx
const leaderboardTourSteps = [ ... ];
<GuidedTour steps={leaderboardTourSteps} storageKey="leaderboard-tour" />

// In Profile.tsx  
const profileTourSteps = [ ... ];
<GuidedTour steps={profileTourSteps} storageKey="profile-tour" />
```

#### 3. **Conditional Tours**
Show tour only for new users:
```tsx
const { user } = useAuth();
const isNewUser = user?.created_at > Date.now() - 24*60*60*1000; // < 24h old

{isNewUser && <GuidedTour ... />}
```

## 🐛 Troubleshooting

### Tour not showing?
- Check localStorage: Open DevTools → Application → Local Storage → Remove the storage key
- Verify `data-tour` attributes exist on target elements
- Check console for errors

### Highlight in wrong position?
- Element might be rendered after tour starts → Increase initial delay
- Element might be hidden/display:none → Make sure it's visible

### Tooltip cut off?
- Reduce `maxWidth` in `getTooltipStyle()`
- Change `position` in tour step (try opposite side)

## 📝 Summary

**To add a tour to ANY page:**
1. Add `data-tour="unique-id"` to elements you want to highlight
2. Create a `tourSteps` array with step definitions
3. Add `<GuidedTour steps={tourSteps} storageKey="page-tour" />`
4. (Optional) Add restart button

That's it! The tour will automatically show on first visit and can be restarted anytime.
