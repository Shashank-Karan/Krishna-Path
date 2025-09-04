import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  BookOpen, 
  Activity, 
  TrendingUp, 
  LogOut,
  BarChart3,
  Heart,
  Sparkles,
  Wifi,
  WifiOff
} from "lucide-react";
import { useLocation } from "wouter";
import { useCallback, useEffect } from "react";

interface DashboardStats {
  totalVerses: number;
  totalInteractions: number;
  popularEmotions: { emotion: string; count: number }[];
  recentInteractions: any[];
}

export default function AdminDashboard() {
  const { admin, isAuthenticated, isLoading, logout } = useAdminAuth();
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard"],
    enabled: isAuthenticated,
  });

  // Handle WebSocket messages for real-time updates
  const handleWebSocketMessage = useCallback((message: any) => {
    if (message.type === 'stats_update') {
      // Update the dashboard stats cache with real-time data
      queryClient.setQueryData(["/api/admin/dashboard"], message.data);
    } else if (message.type === 'new_interaction') {
      // Optionally handle individual interactions
      console.log('New interaction:', message.data);
      // Invalidate to refresh with latest data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
    }
  }, [queryClient]);

  const { isConnected, connectionError } = useWebSocket(handleWebSocketMessage);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/admin/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-950 dark:via-orange-950 dark:to-red-950 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-8 w-8 mx-auto mb-4 animate-spin text-amber-600" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const emotionIcons: Record<string, string> = {
    happy: "😊",
    peace: "🕊️", 
    anxious: "😰",
    angry: "😠",
    sad: "😢",
    protection: "🛡️",
    lazy: "😴",
    lonely: "😞"
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F3F0' }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1 sm:p-2 rounded-lg bg-blue-600 text-white">
                <Sparkles className="h-4 sm:h-5 md:h-6 w-4 sm:w-5 md:w-6" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-800">
                  Krishna Path Admin
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  Welcome, {(admin as any)?.username || 'Admin'}
                </p>
              </div>
            </div>
            
            <nav className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
              {/* Real-time connection status */}
              <div className="hidden sm:flex items-center space-x-2">
                {isConnected ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                    <Wifi className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
                    <WifiOff className="h-3 w-3 mr-1" />
                    Offline
                  </Badge>
                )}
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLocation("/admin/verses")}
                className="hidden md:flex"
                data-testid="button-manage-verses"
              >
                <BookOpen className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden lg:inline">Manage Verses</span>
              </Button>
              <Button variant="ghost" size="sm" className="hidden lg:flex" data-testid="button-analytics">
                <BarChart3 className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
                Analytics
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => logout()}
                className="text-xs sm:text-sm"
                data-testid="button-logout"
              >
                <LogOut className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <Card className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Verses</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800" data-testid="stat-total-verses">
                {statsLoading ? "..." : stats?.totalVerses || 0}
              </div>
              <p className="text-xs text-gray-600">
                Active verses in database
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Interactions</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-interactions">
                {statsLoading ? "..." : stats?.totalInteractions || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                User verse interactions
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Active Users</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-active-users">
                {statsLoading ? "..." : Math.floor((stats?.totalInteractions || 0) / 10)}
              </div>
              <p className="text-xs text-muted-foreground">
                Estimated active users
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Engagement</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-engagement">
                {statsLoading ? "..." : stats?.totalInteractions ? "High" : "Growing"}
              </div>
              <p className="text-xs text-muted-foreground">
                User engagement level
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Popular Emotions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Popular Emotions */}
          <Card className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2 text-red-500" />
                Popular Emotions
              </CardTitle>
              <CardDescription>
                Most frequently selected emotions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statsLoading ? (
                  <div className="text-center py-8">Loading emotions...</div>
                ) : stats?.popularEmotions && stats.popularEmotions.length > 0 ? (
                  stats.popularEmotions.slice(0, 5).map((emotion, index) => (
                    <div key={emotion.emotion} className="flex items-center justify-between" data-testid={`emotion-${emotion.emotion}`}>
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">
                          {emotionIcons[emotion.emotion] || "💫"}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{emotion.emotion}</p>
                          <p className="text-sm text-muted-foreground">
                            {emotion.count} interactions
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        #{index + 1}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No emotion data yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-500" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest user interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statsLoading ? (
                  <div className="text-center py-8">Loading activity...</div>
                ) : stats?.recentInteractions && stats.recentInteractions.length > 0 ? (
                  stats.recentInteractions.slice(0, 5).map((interaction, index) => (
                    <div key={index} className="flex items-center justify-between" data-testid={`interaction-${index}`}>
                      <div className="flex items-center space-x-3">
                        <div className="text-xl">
                          {emotionIcons[interaction.emotion] || "💫"}
                        </div>
                        <div>
                          <p className="font-medium">
                            {interaction.action} • {interaction.emotion}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(interaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent activity
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <Button 
                  variant="outline" 
                  className="h-16 flex flex-col items-center space-y-2"
                  onClick={() => setLocation("/admin/verses")}
                  data-testid="action-add-verse"
                >
                  <BookOpen className="h-6 w-6" />
                  <span>Add New Verse</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-16 flex flex-col items-center space-y-2"
                  data-testid="action-view-analytics"
                >
                  <BarChart3 className="h-6 w-6" />
                  <span>View Analytics</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-16 flex flex-col items-center space-y-2"
                  onClick={() => setLocation("/admin/emotions")}
                  data-testid="action-manage-emotions"
                >
                  <Heart className="h-6 w-6" />
                  <span>Manage Emotions</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}