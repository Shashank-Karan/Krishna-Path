import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  BookOpen, 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowLeft,
  Search,
  Filter,
  Sparkles
} from "lucide-react";

interface Verse {
  id: string;
  emotion: string;
  sanskrit: string;
  hindi: string;
  english: string;
  explanation: string;
  chapter: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EmotionRecord {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  color?: string;
  icon?: string;
  emoji?: string;
  isActive?: boolean;
}

const emotionColors: Record<string, string> = {
  happy: "bg-yellow-100 text-yellow-800",
  peace: "bg-blue-100 text-blue-800",
  anxious: "bg-orange-100 text-orange-800",
  angry: "bg-red-100 text-red-800",
  sad: "bg-purple-100 text-purple-800",
  protection: "bg-green-100 text-green-800",
  lazy: "bg-gray-100 text-gray-800",
  lonely: "bg-pink-100 text-pink-800",
};

export default function AdminVerses() {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEmotion, setFilterEmotion] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingVerse, setEditingVerse] = useState<Verse | null>(null);
  
  const [formData, setFormData] = useState({
    emotion: "",
    sanskrit: "",
    hindi: "",
    english: "",
    explanation: "",
    chapter: "",
  });

  // Fetch verses
  const { data: verses = [], isLoading: versesLoading } = useQuery<Verse[]>({
    queryKey: ["/api/admin/verses"],
    enabled: isAuthenticated,
  });

  // Fetch emotions for dropdown
  const { data: emotions = [], isLoading: emotionsLoading } = useQuery<EmotionRecord[]>({
    queryKey: ["/api/admin/emotions"],
    enabled: isAuthenticated,
  });

  // Handle WebSocket messages for real-time updates
  const handleWebSocketMessage = useCallback((message: any) => {
    if (message.type === 'emotion_created' || message.type === 'emotion_updated' || message.type === 'emotion_deleted') {
      // Refresh emotions data when changes occur
      queryClient.invalidateQueries({ queryKey: ["/api/admin/emotions"] });
    }
    
    // Handle verse operations for real-time updates
    if (message.type === 'verse_created' || message.type === 'verse_updated' || message.type === 'verse_deleted') {
      // Refresh verses data when changes occur
      queryClient.invalidateQueries({ queryKey: ["/api/admin/verses"] });
      // Also refresh main website verse queries
      queryClient.invalidateQueries({ queryKey: ["/api/verses"] });
      // Invalidate emotion-specific queries
      const emotions = ["happy", "peace", "anxious", "angry", "sad", "protection", "lazy", "lonely"];
      emotions.forEach(emotion => {
        queryClient.invalidateQueries({ queryKey: ["/api/verses", emotion] });
      });
    }
  }, [queryClient]);

  // Connect to WebSocket for real-time updates
  const { isConnected } = useWebSocket(handleWebSocketMessage);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/admin/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // Create verse mutation
  const createVerseMutation = useMutation({
    mutationFn: async (verseData: any) => {
      const response = await apiRequest("POST", "/api/admin/verses", verseData);
      return await response.json();
    },
    onSuccess: (data) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/verses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/verses"] });
      
      // Invalidate emotion-specific queries for main website
      const emotions = ["happy", "peace", "anxious", "angry", "sad", "protection", "lazy", "lonely"];
      emotions.forEach(emotion => {
        queryClient.invalidateQueries({ queryKey: ["/api/verses", emotion] });
      });
      
      // Reset form and close dialog
      setEditingVerse(null);
      resetForm();
      setIsCreateDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Verse created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create verse",
        variant: "destructive",
      });
    },
  });

  // Update verse mutation
  const updateVerseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PUT", `/api/admin/verses/${id}`, data);
      return await response.json();
    },
    onSuccess: (data) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/verses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/verses"] });
      
      // Invalidate emotion-specific queries for main website
      const emotions = ["happy", "peace", "anxious", "angry", "sad", "protection", "lazy", "lonely"];
      emotions.forEach(emotion => {
        queryClient.invalidateQueries({ queryKey: ["/api/verses", emotion] });
      });
      
      // Reset form and close dialog
      setEditingVerse(null);
      resetForm();
      setIsCreateDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Verse updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update verse",
        variant: "destructive",
      });
    },
  });

  // Delete verse mutation
  const deleteVerseMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/verses/${id}`);
      return await response.json();
    },
    onSuccess: (data) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/verses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/verses"] });
      
      // Invalidate emotion-specific queries for main website
      const emotions = ["happy", "peace", "anxious", "angry", "sad", "protection", "lazy", "lonely"];
      emotions.forEach(emotion => {
        queryClient.invalidateQueries({ queryKey: ["/api/verses", emotion] });
      });
      
      toast({
        title: "Success",
        description: "Verse deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete verse",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F3F0' }}>
        <div className="text-center">
          <Sparkles className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const resetForm = () => {
    setFormData({
      emotion: "",
      sanskrit: "",
      hindi: "",
      english: "",
      explanation: "",
      chapter: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.emotion || !formData.sanskrit || !formData.hindi || !formData.english || !formData.explanation || !formData.chapter) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    
    if (editingVerse) {
      updateVerseMutation.mutate({ id: editingVerse.id, data: formData });
    } else {
      createVerseMutation.mutate(formData);
    }
  };

  const handleEdit = (verse: Verse) => {
    setEditingVerse(verse);
    setFormData({
      emotion: verse.emotion,
      sanskrit: verse.sanskrit,
      hindi: verse.hindi,
      english: verse.english,
      explanation: verse.explanation,
      chapter: verse.chapter,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this verse?")) {
      deleteVerseMutation.mutate(id);
    }
  };

  // Filter verses
  const filteredVerses = verses.filter(verse => {
    const matchesSearch = verse.sanskrit.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         verse.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         verse.chapter.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEmotion = filterEmotion === "all" || verse.emotion === filterEmotion;
    return matchesSearch && matchesEmotion;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F3F0' }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center h-auto sm:h-16 py-3 sm:py-0 gap-3 sm:gap-0">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLocation("/admin/dashboard")}
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-600 text-white">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">
                    Verse Management
                  </h1>
                  <p className="text-sm text-gray-600">
                    Manage Bhagavad Gita verses
                  </p>
                </div>
              </div>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2 font-medium transition-colors duration-300"
                  data-testid="button-add-verse"
                  onClick={() => {
                    setEditingVerse(null);
                    resetForm();
                    setIsCreateDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Verse
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
                <DialogHeader>
                  <DialogTitle>{editingVerse ? "Edit Verse" : "Add New Verse"}</DialogTitle>
                  <DialogDescription>
                    {editingVerse ? "Update the verse details" : "Create a new Bhagavad Gita verse"}
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="emotion">Emotion</Label>
                    <Select 
                      value={formData.emotion} 
                      onValueChange={(value) => setFormData({...formData, emotion: value})}
                    >
                      <SelectTrigger data-testid="select-emotion">
                        <SelectValue placeholder="Select emotion" />
                      </SelectTrigger>
                      <SelectContent>
                        {emotions.filter(e => e.isActive !== false).map(emotion => (
                          <SelectItem key={emotion.id} value={emotion.name}>
                            {emotion.displayName || emotion.name.charAt(0).toUpperCase() + emotion.name.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sanskrit">Sanskrit</Label>
                    <Textarea
                      id="sanskrit"
                      placeholder="Sanskrit text"
                      value={formData.sanskrit}
                      onChange={(e) => setFormData({...formData, sanskrit: e.target.value})}
                      required
                      data-testid="input-sanskrit"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hindi">Hindi Translation</Label>
                    <Textarea
                      id="hindi"
                      placeholder="Hindi translation"
                      value={formData.hindi}
                      onChange={(e) => setFormData({...formData, hindi: e.target.value})}
                      required
                      data-testid="input-hindi"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="english">English Translation</Label>
                    <Textarea
                      id="english"
                      placeholder="English translation"
                      value={formData.english}
                      onChange={(e) => setFormData({...formData, english: e.target.value})}
                      required
                      data-testid="input-english"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="explanation">Explanation</Label>
                    <Textarea
                      id="explanation"
                      placeholder="Detailed explanation and application"
                      value={formData.explanation}
                      onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                      required
                      data-testid="input-explanation"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="chapter">Chapter Reference</Label>
                    <Input
                      id="chapter"
                      placeholder="e.g., Bhagavad Gita 2.48"
                      value={formData.chapter}
                      onChange={(e) => setFormData({...formData, chapter: e.target.value})}
                      required
                      data-testid="input-chapter"
                    />
                  </div>
                  
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        setEditingVerse(null);
                        resetForm();
                      }}
                      data-testid="button-cancel-verse"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createVerseMutation.isPending || updateVerseMutation.isPending}
                      data-testid="button-save-verse"
                    >
                      {editingVerse ? "Update Verse" : "Create Verse"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Filters */}
        <Card className="mb-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="search"
                    placeholder="Search verses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
              </div>
              
              <div className="w-full sm:w-48">
                <Label htmlFor="filter-emotion">Filter by Emotion</Label>
                <Select value={filterEmotion} onValueChange={setFilterEmotion}>
                  <SelectTrigger data-testid="select-filter-emotion">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Emotions</SelectItem>
                    {emotions.filter(e => e.isActive !== false).map(emotion => (
                      <SelectItem key={emotion.id} value={emotion.name}>
                        {emotion.displayName || emotion.name.charAt(0).toUpperCase() + emotion.name.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verses Table */}
        <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Verses ({filteredVerses.length})</CardTitle>
            <CardDescription>
              All Bhagavad Gita verses organized by emotions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {versesLoading ? (
              <div className="text-center py-8">
                <Sparkles className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-600" />
                <p>Loading verses...</p>
              </div>
            ) : (
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Emotion</TableHead>
                      <TableHead>Chapter</TableHead>
                      <TableHead>Sanskrit</TableHead>
                      <TableHead>English</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {filteredVerses.map((verse) => (
                    <TableRow key={verse.id} data-testid={`verse-row-${verse.id}`}>
                      <TableCell>
                        <Badge className={emotionColors[verse.emotion]}>
                          {verse.emotion}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{verse.chapter}</TableCell>
                      <TableCell className="max-w-xs truncate">{verse.sanskrit}</TableCell>
                      <TableCell className="max-w-xs truncate">{verse.english}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              handleEdit(verse);
                              setIsCreateDialogOpen(true);
                            }}
                            data-testid={`button-edit-${verse.id}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(verse.id)}
                            className="text-red-600 hover:text-red-700"
                            data-testid={`button-delete-${verse.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            )}
            
            {!versesLoading && filteredVerses.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No verses found matching your criteria
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}