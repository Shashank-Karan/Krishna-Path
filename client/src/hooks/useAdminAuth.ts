import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export interface Admin {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}


export function useAdminAuth() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: admin, isLoading } = useQuery({
    queryKey: ["/api/admin/me"],
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiRequest("POST", "/api/admin/login", credentials);
      return await response.json();
    },
    onSuccess: (data: any) => {
      queryClient.setQueryData(["/api/admin/me"], data.admin);
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      setLocation("/admin/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/logout");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/admin/me"], null);
      queryClient.clear();
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });


  return {
    admin,
    isLoading,
    isAuthenticated: !!admin,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}