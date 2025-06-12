import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { LogIn, Mail, Tv, DollarSign, BarChart3, Users, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { user, error } = await login(email, password);
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else if (user) {
        toast({
          title: "Welcome back!",
          description: "You have been successfully logged in.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Login failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Google login failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      {/* Left Sidebar */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-blue-600 to-green-600 p-12 flex-col justify-between text-white">
        <div>
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
              <span className="text-xl font-bold">M</span>
            </div>
            <span className="text-2xl font-bold">ModularApp</span>
          </div>
          
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">Welcome to Your Digital Life</h1>
              <p className="text-xl text-white/90 leading-relaxed">
                Track your favorite TV shows and manage your finances all in one powerful, modular platform.
              </p>
            </div>

            <div className="grid gap-6">
              <div className="flex items-start space-x-4 p-4 bg-white/10 rounded-xl backdrop-blur">
                <div className="w-12 h-12 bg-purple-500/30 rounded-lg flex items-center justify-center">
                  <Tv className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">TV Show Tracker</h3>
                  <p className="text-white/80">Track episodes, create universes, and never miss your favorite shows</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-white/10 rounded-xl backdrop-blur">
                <div className="w-12 h-12 bg-green-500/30 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Finance Manager</h3>
                  <p className="text-white/80">Manage wallets, track expenses, and gain insights into your spending</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-white/80" />
            <p className="text-sm text-white/70">Analytics</p>
          </div>
          <div>
            <Users className="h-8 w-8 mx-auto mb-2 text-white/80" />
            <p className="text-sm text-white/70">Collaboration</p>
          </div>
          <div>
            <ArrowRight className="h-8 w-8 mx-auto mb-2 text-white/80" />
            <p className="text-sm text-white/70">Modular</p>
          </div>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-12">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur">
            <CardHeader className="space-y-1 text-center">
              <div className="lg:hidden flex items-center justify-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">ModularApp</span>
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Welcome back
              </CardTitle>
              <CardDescription className="text-base">
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full border-2 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-200"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <Mail className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-2 focus:border-purple-500 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-2 focus:border-purple-500 transition-colors"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2 transition-all duration-200" 
                  disabled={isLoading}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>

              <div className="text-center text-sm text-muted-foreground">
                <p>New to ModularApp? Contact admin for access</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">Quick access:</p>
            <div className="flex justify-center space-x-4">
              <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                <Tv className="h-4 w-4 mr-1" />
                TV Shows
              </Button>
              <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                <DollarSign className="h-4 w-4 mr-1" />
                Finance
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
