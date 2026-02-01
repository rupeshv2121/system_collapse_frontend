import { Navbar } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/hooks/useUserData';
import { supabase } from '@/lib/supabase';
import { Activity, Calendar, Crown, Mail, Trophy, User as UserIcon, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { UserAnalyticsDashboard } from '@/components/analytics/UserAnalyticsDashboard';

const Profile = () => {
  const { user, signOut, updateUsername: updateUsernameContext } = useAuth();
  const { userData } = useUserData();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState('');

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
        console.error('Error loading profile:', error);
      } else {
        setProfile(data);
        setUsername(data?.username || user.email?.split('@')[0] || '');
      }
    } catch (error) {
      console.error('Error:', error);
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
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      
      // Update profile via backend API
      const response = await fetch(`${BACKEND_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: username.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update username' }));
        toast.error(errorData.error || 'Failed to update username');
        return;
      }

      toast.success('Username updated successfully!');
      updateUsernameContext(username.trim());
      setEditing(false);
      loadProfile();
    } catch (error) {
      toast.error('An error occurred');
      console.error('Error:', error);
    }
  };

  const winRate = userData.stats.totalGames > 0 
    ? ((userData.stats.wins / userData.stats.totalGames) * 100).toFixed(2)
    : '0.00';

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
          <div className="space-y-6">
            {/* User Analytics Dashboard - Moved to top */}
            <UserAnalyticsDashboard />

            {/* Profile Info Card */}
            <Card className="bg-white/90 backdrop-blur-sm border-blue-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                  Account Information
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
                    <div className="text-2xl font-bold text-amber-700">{winRate}%</div>
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

            {/* Play Style */}
            <Card className="bg-white/90 backdrop-blur-sm border-indigo-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  Psychological Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <div className="text-sm text-gray-700 mb-1">Play Style</div>
                    <div className="text-xl font-bold text-indigo-700">{userData.playerProfile.playStyle}</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-sm text-gray-700 mb-1">Archetype</div>
                    <div className="text-xl font-bold text-purple-700">{userData.playerProfile.psychologicalArchetype}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions - Moved to bottom */}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
