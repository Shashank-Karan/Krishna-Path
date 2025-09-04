import { useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Shield } from "lucide-react";

export default function AdminLogin() {
  const { login, isLoggingIn } = useAdminAuth();
  
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(loginData);
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F5F3F0' }}>
      <Card className="w-full max-w-md bg-white border border-gray-200 shadow-sm rounded-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-blue-600 text-white">
              <Crown className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Krishna Path Admin
          </CardTitle>
          <CardDescription className="text-gray-600">
            Access the administrative dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={loginData.username}
                    onChange={(e) =>
                      setLoginData({ ...loginData, username: e.target.value })
                    }
                    required
                    data-testid="input-username"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    required
                    data-testid="input-password"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-3 font-medium transition-colors duration-300"
                  disabled={isLoggingIn}
                  data-testid="button-login"
                >
                  {isLoggingIn ? "Signing in..." : "Sign In"}
                </Button>
              </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}