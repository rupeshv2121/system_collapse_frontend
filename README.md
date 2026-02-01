# System Collapse Frontend 🎮

A psychological puzzle game that challenges players' adaptability and pattern recognition through evolving rule systems. Built with React, TypeScript, and modern web technologies.

## 📖 Table of Contents

- [Overview](#overview)
- [Game Concept](#game-concept)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Architecture Deep Dive](#architecture-deep-dive)
- [Component Documentation](#component-documentation)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Styling System](#styling-system)
- [Development Workflow](#development-workflow)
- [Contributing](#contributing)

---

## 🎯 Overview

**System Collapse** is a React-based single-player game where rules progressively break down, testing the player's ability to adapt to changing systems. Players click colored tiles following instructions that become increasingly unreliable as "entropy" increases, representing the collapse of the game's rule system.

### Key Mechanics:
- **5 Progressive Phases**: Rules evolve from simple to chaotic
- **Entropy System**: Measures rule degradation (0-100%)
- **Sanity Meter**: Mental strain tracker that depletes over time
- **Psychological Profiling**: Tracks player behavior patterns
- **Real-time Analytics**: Visualizes performance metrics

---

## 🎮 Game Concept

### The Core Loop

1. **Click colored tiles** (red, blue, green, yellow) on a 4x4 grid
2. **Follow instructions** shown at the top ("Click Red")
3. **Adapt as rules change**:
   - **Phase 1**: Instructions are truthful
   - **Phase 2**: Secret correct color differs from instruction
   - **Phase 3**: Patterns matter more than instructions
   - **Phase 4**: Time pressure and contradictions
   - **Phase 5**: Full chaos - rules are unpredictable

### Winning Conditions
- Survive until sanity reaches 0 OR time runs out
- Higher score = better adaptation to rule collapse

### Psychological Tracking
The game measures 6 behavioral traits:
- **Risk Tolerance**: Willingness to deviate from instructions
- **Adaptability**: Speed of learning new patterns
- **Patience**: Ability to maintain performance under pressure
- **Chaos Affinity**: Comfort with unpredictable systems
- **Order Affinity**: Preference for consistent rules
- **Learning Rate**: Improvement trajectory over games

---

## ✨ Features

### 🎨 User Interface
- **Responsive Design**: Works on desktop and mobile
- **Light Theme**: Clean blue/gray color scheme
- **Smooth Animations**: Tile rotations, shaking, and phase transitions
- **Audio Integration**: Background music and sound effects with beat synchronization
- **Toast Notifications**: Real-time feedback using Sonner

### 🔐 Authentication
- Email/password sign-up and sign-in
- Supabase authentication integration
- Protected routes for authenticated users
- Persistent sessions

### 📊 Analytics & Leaderboards
- **User Analytics Dashboard**:
  - Game statistics (total games, win rate, average score)
  - Psychological trait evolution graphs
  - Achievement tracking
  - Email sharing feature
- **Global Leaderboard**: Top players by score
- **Game Statistics Charts**: Entropy, sanity loss, score trends

### 🎯 Game Features
- **Interactive Tutorial**: First-time user onboarding
- **Guided Tours**: In-game help system
- **Hints System**: Optional assistance during gameplay
- **Pause/Resume**: Game state preservation
- **Audio Controls**: Volume management

### 🛠️ Developer Features
- **Error Handling**: Network vs server error distinction
- **Loading States**: Skeleton loaders for async data
- **Type Safety**: Full TypeScript coverage
- **Code Splitting**: Optimized bundle size

---

## 🛠️ Tech Stack

### Core Framework
- **React 19.2** - UI library
- **TypeScript 5.8** - Type safety
- **Vite 5.4** - Build tool and dev server

### State Management
- **React Context API** - Authentication state
- **Custom Hooks** - Game logic, audio, user data
- **TanStack Query 5.90** - Server state management

### UI Libraries
- **Radix UI** - Accessible component primitives (30+ components)
- **Tailwind CSS 3.4** - Utility-first styling
- **Lucide React** - Icon library
- **Recharts 2.15** - Data visualization
- **Sonner** - Toast notifications

### Backend Integration
- **Supabase 2.93** - Authentication and database
- **React Router DOM 7.13** - Client-side routing
- **Express API** - Custom backend for email, leaderboard, analytics

### Form & Validation
- **React Hook Form 7.61** - Form state management
- **Zod 3.25** - Schema validation
- **@hookform/resolvers** - Zod integration

### Audio
- **Custom useGameAudio Hook** - Sound effect management
- **useBeatSync Hook** - Music synchronization

### Development Tools
- **ESLint** - Linting
- **PostCSS** - CSS processing
- **Vitest** - Unit testing
- **Testing Library** - Component testing

---

## 📁 Project Structure

```
system_collapse_frontend/
│
├── public/
│   └── audio/              # Sound effects and background music
│
├── src/
│   ├── components/         # React components
│   │   ├── auth/           # Authentication components
│   │   │   ├── AuthForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   │
│   │   ├── game/           # Game-specific components
│   │   │   ├── GameGrid.tsx          # 4x4 tile grid
│   │   │   ├── GameScreen.tsx        # Main game orchestrator
│   │   │   ├── GameTile.tsx          # Individual tile component
│   │   │   ├── HUD.tsx               # Heads-up display
│   │   │   ├── InstructionDisplay.tsx
│   │   │   ├── SystemHint.tsx        # Optional hint system
│   │   │   └── Tutorial.tsx          # Onboarding tutorial
│   │   │
│   │   ├── analytics/      # Data visualization
│   │   │   ├── AnalyticsDashboard.tsx    # Game stats charts
│   │   │   └── UserAnalyticsDashboard.tsx # User profile
│   │   │
│   │   ├── ui/             # Reusable UI components (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── error-display.tsx
│   │   │   └── ... (30+ components)
│   │   │
│   │   └── NavLink.tsx     # Navigation component
│   │
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx # Authentication state
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── useGameState.tsx    # Core game logic (430 lines)
│   │   ├── useGameStats.tsx    # Statistics tracking
│   │   ├── useGameAudio.tsx    # Audio management
│   │   ├── useBeatSync.tsx     # Music synchronization
│   │   ├── useUserData.tsx     # Backend data fetching
│   │   ├── use-toast.tsx       # Toast notifications
│   │   └── use-mobile.tsx      # Mobile detection
│   │
│   ├── lib/                # Utility libraries
│   │   ├── supabase.ts         # Supabase client
│   │   ├── userDataApi.ts      # Backend API calls
│   │   └── utils.ts            # Helper functions
│   │
│   ├── pages/              # Route pages
│   │   ├── LandingPage.tsx     # Home page
│   │   ├── Auth.tsx            # Login/signup
│   │   ├── Index.tsx           # Game page
│   │   ├── Analytics.tsx       # Analytics page
│   │   ├── Leaderboard.tsx     # Leaderboard page
│   │   ├── Profile.tsx         # User profile
│   │   └── NotFound.tsx        # 404 page
│   │
│   ├── types/              # TypeScript definitions
│   │   ├── game.ts             # Game state types
│   │   └── userData.ts         # User data types
│   │
│   ├── data/
│   │   └── systemMessages.tsx  # Phase-specific messages
│   │
│   ├── App.tsx             # Root component
│   ├── main.tsx            # App entry point
│   ├── App.css             # Global styles
│   └── index.css           # Tailwind imports
│
├── index.html              # HTML template
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json           # TypeScript config
├── eslint.config.js        # ESLint config
├── postcss.config.js       # PostCSS config
└── package.json            # Dependencies
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Supabase Account** (for authentication and database)
- **Backend API** running (system_collapse_backend)

### Installation

1. **Clone the repository**
   ```bash
   cd system_collapse_frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_BACKEND_URL=http://localhost:3000
   ```

   Get your Supabase credentials from [https://supabase.com/dashboard](https://supabase.com/dashboard)

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will open at `http://localhost:5173`

5. **Build for production**
   ```bash
   npm run build
   npm run preview  # Preview production build
   ```

### First Time Setup

1. **Sign Up**: Create an account at `/auth`
2. **Play Tutorial**: Complete the interactive tutorial on first game
3. **View Analytics**: Check your psychological profile at `/analytics`
4. **Leaderboard**: Compete with other players at `/leaderboard`

---

## 🏗️ Architecture Deep Dive

### Application Flow

```
User visits site
    ↓
LandingPage.tsx (Public)
    ↓
Auth.tsx (Sign up/Sign in)
    ↓
AuthContext provides user session
    ↓
ProtectedRoute wraps authenticated pages
    ↓
Game/Analytics/Leaderboard/Profile (Authenticated)
```

### Game State Flow

```
User clicks "Start Game"
    ↓
useGameState.startGame()
    ↓
Game loop begins:
  - Timer counts down
  - User clicks tiles
  - handleTileClick() processes:
    * Calculate score change
    * Update entropy
    * Check phase transitions
    * Record click metrics
    * Deplete sanity
    ↓
Game ends (sanity = 0 OR time = 0)
    ↓
recordGameEnd() saves to backend
    ↓
useUserData updates psychological profile
```

### Data Persistence

- **Authentication**: Supabase Auth (JWT tokens)
- **User Data**: Custom Express backend
  - `/api/user-data/profile` - User stats
  - `/api/user-data/leaderboard` - Top scores
  - `/api/user-data/session` - Game session recording
- **Local Storage**: Tutorial completion, audio preferences

---

## 🧩 Component Documentation

### Core Game Components

#### `GameScreen.tsx`
**Purpose**: Orchestrates all game elements
- Manages game state via `useGameState()`
- Handles tutorial flow
- Audio playback control
- Phase transition animations
- Game over logic

**Key Props**: None (self-contained)

**State**:
- `showTutorial`: Tutorial visibility
- `isGameOverBlast`: End game animation
- `playTimeSeconds`: Session duration
- `isGameTourOpen`: In-game help visibility

#### `GameGrid.tsx`
**Purpose**: Renders 4x4 tile grid
- Maps `TileState[]` to `GameTile` components
- Responsive grid layout
- Collapse animation effects

**Props**:
```typescript
{
  tiles: TileState[];
  onTileClick: (id: number) => void;
  isPlaying: boolean;
  entropy: number;
  isCollapsing: boolean;
}
```

#### `GameTile.tsx`
**Purpose**: Individual clickable tile
- Color-coded styling (red/blue/green/yellow)
- Shake animation on incorrect clicks
- Rotation and drift effects based on entropy
- Smooth transitions

**Props**:
```typescript
{
  tile: TileState;
  onClick: () => void;
  disabled: boolean;
  entropy: number;
}
```

#### `HUD.tsx`
**Purpose**: Displays game metrics
- Score counter with animations
- Phase indicator
- Entropy bar (0-100%)
- Sanity bar with color transitions
- Timer with urgency styling

**Props**:
```typescript
{
  score: number;
  phase: GamePhase;
  entropy: number;
  sanity: number;
  timeRemaining: number;
  collapseCount: number;
}
```

#### `InstructionDisplay.tsx`
**Purpose**: Shows current instruction
- Color-matched instruction text
- Phase-aware styling
- Animation on instruction change

**Props**:
```typescript
{
  instruction: TileColor;
  phase: GamePhase;
}
```

### Authentication Components

#### `AuthForm.tsx`
**Purpose**: Sign up/sign in form
- Toggle between modes
- Email validation
- Password strength indicator
- Username field (sign up only)
- Error handling
- Loading states

**Uses**: `useAuth()` from AuthContext

#### `ProtectedRoute.tsx`
**Purpose**: Route guard for authenticated pages
- Redirects to `/auth` if not logged in
- Shows loading state during auth check

**Props**:
```typescript
{
  children: React.ReactNode;
}
```

### Analytics Components

#### `UserAnalyticsDashboard.tsx`
**Purpose**: User profile and statistics
- Game statistics cards (games played, win rate, avg score)
- Psychological trait evolution graph (6 traits over 20 games)
- Achievement badges
- Email share modal
- Exportable statistics

**Features**:
- 6-line graph showing trait development:
  - Risk Tolerance
  - Adaptability  
  - Patience
  - Chaos Affinity
  - Order Affinity
  - Learning Rate
- Share statistics via email
- Overall stats panel

#### `AnalyticsDashboard.tsx`
**Purpose**: Game-by-game charts
- Entropy progression (line chart)
- Sanity loss (line chart)
- Recent scores (bar chart)
- Axis labels (X: Game Number, Y: Metric value)

**Props**:
```typescript
{
  gameData: GameData[];
}
```

### UI Components

#### Shadcn/ui Components
Pre-built accessible components using Radix UI:
- `Button` - Multiple variants (default, destructive, outline, ghost)
- `Card` - Container with header, content, footer
- `Dialog` - Modal dialogs
- `Toast` - Notifications
- `Progress` - Progress bars
- `Skeleton` - Loading placeholders
- `Tooltip` - Hover information
- ... and 20+ more

#### `ErrorDisplay.tsx`
**Purpose**: User-friendly error messages
- Distinguishes network vs server errors
- Full-page modal and inline variants
- Retry button
- Themed with light gray/blue

**Props**:
```typescript
{
  error: ApiError;
  onRetry?: () => void;
  variant?: 'full' | 'inline';
}
```

---

## 🔄 State Management

### Authentication State

**Location**: `src/contexts/AuthContext.tsx`

**Provides**:
```typescript
{
  user: User | null;           // Supabase user object
  session: Session | null;     // Auth session
  loading: boolean;            // Initial auth check
  username: string;            // Display name
  updateUsername: (name) => void;
  signUp: (email, password, username) => Promise<Result>;
  signIn: (email, password) => Promise<Result>;
  signOut: () => Promise<void>;
}
```

**Usage**:
```tsx
const { user, signIn, signOut } = useAuth();
```

### Game State

**Location**: `src/hooks/useGameState.tsx` (430 lines)

**Returns**:
```typescript
{
  gameState: GameState;        // Current game state
  handleTileClick: (id) => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  phaseConfig: PhaseConfig;    // Current phase rules
}
```

**GameState Interface**:
```typescript
{
  score: number;
  phase: GamePhase;            // 1-5
  entropy: number;             // 0-100
  sanity: number;              // 0-100
  timeRemaining: number;
  clickHistory: ClickRecord[];
  currentInstruction: TileColor;
  secretCorrectColor: TileColor; // True answer (may differ)
  tiles: TileState[];          // 16 tiles
  isPlaying: boolean;
  roundStartTime: number;
  lastClickTime: number;
  consecutiveSameColor: number;
  uniqueColorsClicked: Set<TileColor>;
  gameStartTime: number;
  timerStarted: boolean;
  collapseCount: number;       // Entropy resets
  isCollapsing: boolean;       // Animation flag
}
```

**Phase Logic**:
- Phase determined by entropy thresholds
- Each phase has unique scoring rules
- Secret correct color can differ from instruction
- Phase 5: Maximum chaos, hints unreliable

### Server State

**Location**: `src/hooks/useUserData.tsx`

**TanStack Query Integration**:
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['userData', userId],
  queryFn: () => fetchUserProfile(userId),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

**Mutations**:
```typescript
const recordSession = useMutation({
  mutationFn: (sessionData) => postSession(sessionData),
  onSuccess: () => queryClient.invalidateQueries(['userData']),
});
```

---

## 🌐 API Integration

### Backend API

**Base URL**: `http://localhost:3000` (configured in `.env`)

**Endpoints**:

#### User Data
```typescript
GET /api/user-data/profile/:userId
// Returns: UserProfile with stats, achievements, psychological traits

POST /api/user-data/session
// Body: GameSessionData
// Records game session and updates user metrics

GET /api/user-data/leaderboard
// Returns: LeaderboardEntry[] (top 100 players)

GET /api/user-data/top-winners
// Returns: TopWinner[] (most games won)
```

#### Email
```typescript
POST /api/email/share-profile
// Body: { to: string, subject: string, content: string }
// Sends user stats via email
```

### API Client

**Location**: `src/lib/userDataApi.ts`

**Features**:
- Network detection (`navigator.onLine`)
- Request timeouts (10 seconds)
- Typed error handling (`ApiError` class)
- Error types: `"network" | "server" | "auth" | "generic"`

**Example**:
```typescript
export async function getGlobalLeaderboard(): Promise<LeaderboardEntry[]> {
  return apiCall<LeaderboardEntry[]>('/api/user-data/leaderboard');
}

// Error handling
try {
  const leaderboard = await getGlobalLeaderboard();
} catch (error) {
  if (error instanceof ApiError) {
    if (error.type === 'network') {
      // Show "No internet" message
    } else if (error.type === 'server') {
      // Show "Server unavailable" message
    }
  }
}
```

### Supabase Integration

**Location**: `src/lib/supabase.ts`

**Usage**:
```typescript
// Authentication
const { data, error } = await supabase.auth.signUp({
  email,
  password,
});

// Database queries (if needed)
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('user_id', userId);
```

---

## 🎨 Styling System

### Tailwind CSS Configuration

**Location**: `tailwind.config.ts`

**Theme Colors**:
- Primary: Blue shades (`blue-50` to `blue-900`)
- Gray scale: Light theme (`gray-50` to `gray-900`)
- Game colors: `red-500`, `blue-500`, `green-500`, `yellow-500`

**Custom Utilities**:
```css
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

### Component Styling Patterns

#### Card Pattern (Blue Theme)
```tsx
<Card className="bg-blue-50 border-blue-300">
  <CardHeader>
    <CardTitle className="text-blue-700">Title</CardTitle>
  </CardHeader>
  <CardContent className="text-blue-600">
    Content
  </CardContent>
</Card>
```

#### Skeleton Loader
```tsx
<Skeleton className="h-20 w-full" />
// Renders: bg-gray-400/40 with animate-pulse
```

#### Error Display
```tsx
<ErrorDisplay
  error={error}
  onRetry={refetch}
  variant="inline"
/>
// Light theme: bg-gray-50, text-gray-900
```

### Animation Classes

- `animate-pulse` - Skeleton loaders
- `animate-spin` - Loading spinners
- `animate-bounce` - Attention indicators
- Custom shake keyframes for incorrect tile clicks

### Responsive Design

- Mobile-first approach
- Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)
- Grid adapts: 4x4 on desktop, responsive sizing on mobile

---

## 💻 Development Workflow

### Running the App

```bash
# Development mode (hot reload)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
```

### Code Organization Best Practices

1. **Component Structure**:
   ```tsx
   // Imports
   import { ... } from '...';
   
   // Type definitions
   interface Props { ... }
   
   // Component
   export const Component = ({ props }: Props) => {
     // Hooks
     // State
     // Effects
     // Handlers
     // Render
   };
   ```

2. **Custom Hooks**:
   - Prefix with `use` (e.g., `useGameState`)
   - Encapsulate complex logic
   - Return stable references (useCallback, useMemo)

3. **Type Safety**:
   - Define interfaces in `/types`
   - Use strict TypeScript settings
   - Avoid `any` types

4. **API Calls**:
   - Centralize in `userDataApi.ts`
   - Use TanStack Query for caching
   - Handle errors with `ApiError` class

### Testing

```bash
npm run test        # Run Vitest tests
npm run test:ui     # Open Vitest UI
```

**Test Structure**:
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Text')).toBeInTheDocument();
  });
});
```

### Environment Variables

**Required**:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

**Optional**:
- `VITE_BACKEND_URL` - Backend API URL (default: http://localhost:3000)

### Common Issues

#### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npx tsc --noEmit`

#### API Connection Issues
- Verify backend is running on port 3000
- Check `.env` file configuration
- Inspect network tab in browser DevTools

#### Authentication Errors
- Verify Supabase credentials
- Check Supabase dashboard for user management
- Clear browser localStorage: `localStorage.clear()`

---

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes and test thoroughly
4. Commit with descriptive messages: `git commit -m "Add feature X"`
5. Push to your fork: `git push origin feature/my-feature`
6. Open a Pull Request

### Code Standards

- Follow existing code style
- Add TypeScript types for all new code
- Write meaningful commit messages
- Update documentation for new features
- Test on multiple screen sizes

### Pull Request Checklist

- [ ] Code builds without errors (`npm run build`)
- [ ] No ESLint warnings (`npm run lint`)
- [ ] TypeScript types are correct
- [ ] Components are responsive
- [ ] No console errors in browser
- [ ] Documentation updated if needed

---

## 📝 Additional Resources

### Key Dependencies Documentation

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Recharts](https://recharts.org/)
- [Supabase](https://supabase.com/docs)

### Game Design Documents

- Phase mechanics and scoring rules: See `src/types/game.ts` → `PHASE_CONFIGS`
- Psychological trait calculations: See `src/hooks/useGameStats.tsx`
- System messages: See `src/data/systemMessages.tsx`

---

## 📜 License

This project is part of the System Collapse game suite.

---

## 🆘 Support

For issues, questions, or contributions:
1. Check existing issues in the repository
2. Review this README thoroughly
3. Contact the development team

---

**Built with ❤️ using React, TypeScript, and modern web technologies**
