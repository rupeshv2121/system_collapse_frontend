import { UserAnalyticsDashboard } from '@/components/analytics/UserAnalyticsDashboard';
import { Navbar } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { useAuth } from '@/contexts/AuthContext';
import { useError } from '@/contexts/ErrorContext';
import { useUserData } from '@/hooks/useUserData';
import { supabase } from '@/lib/supabase';
import { Activity, Award, Calendar, Crown, Mail, Send, Trophy, User as UserIcon, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const Profile = () => {
  const { user, signOut, updateUsername: updateUsernameContext } = useAuth();
  const { userData } = useUserData();
  const { showNetworkError, showServerError } = useError();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleShareScore = async () => {
    if (!shareEmail || !shareEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSending(true);
    try {
      // Check network connection
      if (!navigator.onLine) {
        showNetworkError();
        return;
      }

      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

      const subject = `${username}'s Gaming Stats from System Drift`;
      const content = `
Hello!

${username} has shared their gaming statistics with you from System Drift:
📊 Performance Stats:
━━━━━━━━━━━━━━━━━━━━
• Total Games Played: ${userData.stats.totalGames}
• Wins: ${userData.stats.wins}
• Win Rate: ${winRate.toFixed(2)}%
• Highest Score: ${userData.stats.highestScore}

🧠 Player Profile:
━━━━━━━━━━━━━━━━━━━━
• Play Style: ${userData.playerProfile.playStyle}
• Psychological Archetype: ${userData.playerProfile.psychologicalArchetype}

Keep playing and improving your skills!

---
This email was sent from System Drift Game
      `.trim();

      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 10000);

      try {
        const response = await fetch(`${BACKEND_URL}/api/email/share-profile`, {
          method: 'POST',
          signal: abortController.signal,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: shareEmail,
            subject: subject,
            content: content,
          }),
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status >= 500) {
            showServerError();
            return;
          }
          const errorData = await response.json().catch(() => ({ error: 'Failed to send email' }));
          toast.error(errorData.error || 'Failed to send email');
          return;
        }

        const result = await response.json();
        toast.success(`Score shared successfully to ${shareEmail}!`);
        setIsShareOpen(false);
        setShareEmail('');
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        showServerError();
        return;
      }
      if (error instanceof TypeError) {
        showServerError();
        return;
      }
      toast.error('Failed to share score. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
      } else {
        setProfile(data);
        setUsername(data?.username || user.email?.split('@')[0] || '');
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const updateUsername = async () => {
    if (!user || !username.trim()) {
      toast.error('Username cannot be empty');
      return;
    }

    try {
      // Check network connection
      if (!navigator.onLine) {
        showNetworkError();
        return;
      }

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

      // Create abort controller for timeout
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 10000);

      try {
        // Update profile via backend API
        const response = await fetch(`${BACKEND_URL}/api/profile`, {
          method: 'PUT',
          signal: abortController.signal,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: username.trim(),
          }),
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status >= 500) {
            showServerError();
            return;
          }
          const errorData = await response.json().catch(() => ({ error: 'Failed to update username' }));
          toast.error(errorData.error || 'Failed to update username');
          return;
        }

        toast.success('Username updated successfully!');
        updateUsernameContext(username.trim());
        setEditing(false);
        loadProfile();
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        showServerError();
        return;
      }
      if (error instanceof TypeError) {
        showServerError();
        return;
      }
      toast.error('An error occurred');
    }
  };

  const winRate = userData.stats.totalGames > 0
    ? (userData.stats.wins / userData.stats.totalGames) * 100
    : 0;

  const accountAge = user?.created_at
    ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 grid-pattern">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <UserIcon className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-500 bg-clip-text text-transparent">
              Player Profile
            </h1>
          </div>
          <p className="text-gray-700 text-lg">
            Manage your account and view your achievements
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                Personal Information
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Badges & Achievements
              </TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-6">
              {/* Profile Info Card */}
              <Card className="bg-white/90 backdrop-blur-sm border-blue-300">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-blue-600" />
                      Account Information
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsShareOpen(true)}
                      className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                    >
                      Share score to email
                    </button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                      {username.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <UserIcon className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-600">Username</div>
                        {editing ? (
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-2 py-1 border border-blue-300 rounded text-sm"
                            placeholder="Enter username"
                          />
                        ) : (
                          <div className="text-sm font-semibold text-gray-900">{username}</div>
                        )}
                      </div>
                      {editing ? (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={updateUsername}>Save</Button>
                          <Button size="sm" variant="outline" onClick={() => {
                            setEditing(false);
                            setUsername(profile?.username || user?.email?.split('@')[0] || '');
                          }}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                          Edit
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-gray-600" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-600">Email</div>
                        <div className="text-sm font-semibold text-gray-900">{user?.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-600">Member Since</div>
                        <div className="text-sm font-semibold text-gray-900">
                          {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                          <span className="text-xs text-gray-600 ml-2">({accountAge} days ago)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Overview */}
              <Card className="bg-white/90 backdrop-blur-sm border-purple-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-purple-600" />
                    Performance Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg text-center">
                      <Activity className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                      <div className="text-2xl font-bold text-blue-700">{userData.stats.totalGames}</div>
                      <div className="text-xs text-gray-700">Total Games</div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <Trophy className="w-6 h-6 mx-auto mb-2 text-green-600" />
                      <div className="text-2xl font-bold text-green-700">{userData.stats.wins}</div>
                      <div className="text-xs text-gray-700">Wins</div>
                    </div>

                    <div className="p-4 bg-amber-50 rounded-lg text-center">
                      <Zap className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                      <div className="text-2xl font-bold text-amber-700">{winRate.toFixed(2)}%</div>
                      <div className="text-xs text-gray-700">Win Rate</div>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg text-center">
                      <Crown className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                      <div className="text-2xl font-bold text-purple-700">{userData.stats.highestScore}</div>
                      <div className="text-xs text-gray-700">Best Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Actions */}
              <Card className="bg-white/90 backdrop-blur-sm border-red-300">
                <CardHeader>
                  <CardTitle className="text-red-700">Account Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      await signOut();
                      toast.success('Signed out successfully');
                    }}
                    className="w-full"
                  >
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Badges & Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
              {/* User Analytics Dashboard */}
              <UserAnalyticsDashboard />
            </TabsContent>
          </Tabs>
        )}

        {/* Share Score Dialog */}
        <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Share Your Score
              </DialogTitle>
              <DialogDescription>
                Enter an email address to share your gaming statistics and achievements.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="friend@example.com"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isSending) {
                      handleShareScore();
                    }
                  }}
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">Preview:</p>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>• Username: <span className="font-semibold">{username}</span></p>
                  <p>• Total Games: <span className="font-semibold">{userData.stats.totalGames}</span></p>
                  <p>• Win Rate: <span className="font-semibold">{winRate.toFixed(2)}%</span></p>
                  <p>• Best Score: <span className="font-semibold">{userData.stats.highestScore}</span></p>
                  <p>• Play Style: <span className="font-semibold">{userData.playerProfile.playStyle}</span></p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsShareOpen(false);
                  setShareEmail('');
                }}
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleShareScore}
                disabled={isSending || !shareEmail}
                className="gap-2"
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Email
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Profile;