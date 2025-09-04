import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  Heart, 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowLeft,
  Search,
  Filter,
  Sparkles,
  Palette
} from "lucide-react";

interface EmotionRecord {
  id: string;
  name: string;
  displayName: string;
  description: string;
  color: string;
  icon: string;
  emoji: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminEmotions() {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingEmotion, setEditingEmotion] = useState<EmotionRecord | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    color: "#F59E0B",
    icon: "❤️",
    emoji: "😊",
    sortOrder: 0,
  });

  // Fetch emotions
  const { data: emotions, isLoading: emotionsLoading } = useQuery<EmotionRecord[]>({
    queryKey: ["/api/admin/emotions"],
    enabled: isAuthenticated,
  });

  // Create emotion mutation
  const createEmotionMutation = useMutation({
    mutationFn: async (emotionData: any) => {
      const response = await apiRequest("POST", "/api/admin/emotions", emotionData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/emotions"] });
      toast({
        title: "Success",
        description: "Emotion created successfully",
      });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update emotion mutation
  const updateEmotionMutation = useMutation({
    mutationFn: async ({ id, ...emotionData }: { id: string } & any) => {
      const response = await apiRequest("PUT", `/api/admin/emotions/${id}`, emotionData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/emotions"] });
      toast({
        title: "Success",
        description: "Emotion updated successfully",
      });
      setEditingEmotion(null);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete emotion mutation
  const deleteEmotionMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/emotions/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/emotions"] });
      toast({
        title: "Success",
        description: "Emotion deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
    setLocation("/admin/login");
    return null;
  }

  const resetForm = () => {
    setFormData({
      name: "",
      displayName: "",
      description: "",
      color: "#F59E0B",
      icon: "❤️",
      emoji: "😊",
      sortOrder: 0,
    });
  };

  const handleCreate = () => {
    setEditingEmotion(null);
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (emotion: EmotionRecord) => {
    setEditingEmotion(emotion);
    setFormData({
      name: emotion.name,
      displayName: emotion.displayName,
      description: emotion.description,
      color: emotion.color,
      icon: emotion.icon,
      emoji: emotion.emoji,
      sortOrder: emotion.sortOrder,
    });
    setIsCreateDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEmotion) {
      updateEmotionMutation.mutate({
        id: editingEmotion.id,
        ...formData,
      });
    } else {
      createEmotionMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this emotion? This action cannot be undone.")) {
      deleteEmotionMutation.mutate(id);
    }
  };

  const filteredEmotions = emotions?.filter(emotion =>
    emotion.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emotion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emotion.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F3F0' }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/admin/dashboard")}
                className="flex items-center space-x-2"
                data-testid="button-back-to-dashboard"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div className="h-8 w-px bg-gray-300" />
              <div className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-red-500" />
                <h1 className="text-xl font-bold text-gray-800">
                  Emotions Management
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search emotions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
                data-testid="input-search-emotions"
              />
            </div>
          </div>

          <Button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            data-testid="button-create-emotion"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Emotion
          </Button>
        </div>

        {/* Emotions Table */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-blue-600" />
              <span>Emotions ({filteredEmotions.length})</span>
            </CardTitle>
            <CardDescription>
              Manage the emotions that users can select when seeking spiritual guidance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emotionsLoading ? (
              <div className="text-center py-8">
                <Sparkles className="h-6 w-6 mx-auto mb-2 animate-spin text-blue-600" />
                <p className="text-gray-600">Loading emotions...</p>
              </div>
            ) : filteredEmotions.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">
                  {searchTerm ? "No emotions found matching your search." : "No emotions available yet."}
                </p>
                {!searchTerm && (
                  <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Emotion
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Emotion</TableHead>
                      <TableHead>Display Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Visual</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmotions.map((emotion) => (
                      <TableRow key={emotion.id} data-testid={`row-emotion-${emotion.id}`}>
                        <TableCell className="font-medium">
                          {emotion.name}
                        </TableCell>
                        <TableCell>
                          {emotion.displayName}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="truncate">{emotion.description}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{emotion.emoji}</span>
                            <div 
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: emotion.color }}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{emotion.sortOrder}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={emotion.isActive ? "default" : "secondary"}
                            className={emotion.isActive ? "bg-green-100 text-green-800" : ""}
                          >
                            {emotion.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(emotion)}
                              data-testid={`button-edit-emotion-${emotion.id}`}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(emotion.id)}
                              className="text-red-600 hover:text-red-700"
                              data-testid={`button-delete-emotion-${emotion.id}`}
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
          </CardContent>
        </Card>
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingEmotion ? "Edit Emotion" : "Create New Emotion"}
            </DialogTitle>
            <DialogDescription>
              {editingEmotion 
                ? "Update the emotion details below."
                : "Add a new emotion that users can select."
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name (Key)</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., happy"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  data-testid="input-emotion-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="e.g., Happy"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  required
                  data-testid="input-emotion-display-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe this emotional state..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                data-testid="input-emotion-description"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emoji">Emoji</Label>
                <Input
                  id="emoji"
                  type="text"
                  placeholder="😊"
                  value={formData.emoji}
                  onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                  required
                  data-testid="input-emotion-emoji"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  required
                  data-testid="input-emotion-color"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  min="0"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  required
                  data-testid="input-emotion-sort-order"
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
                data-testid="button-cancel-emotion"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={createEmotionMutation.isPending || updateEmotionMutation.isPending}
                data-testid="button-save-emotion"
              >
                {editingEmotion ? "Update" : "Create"} Emotion
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}