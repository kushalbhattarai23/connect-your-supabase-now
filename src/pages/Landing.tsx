import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getEnabledApps } from '@/config/apps';
import { Tv, DollarSign, ArrowRight, BarChart3, Users, LogIn, Film, Wallet, ShieldCheck, MessageSquarePlus, Sparkles, Target, Briefcase } from 'lucide-react';

const iconMap = {
  Tv,
  DollarSign,
};

const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <div className="flex flex-col items-center p-6 text-center bg-card rounded-lg border h-full">
        <div className="p-3 mb-4 bg-primary/10 rounded-full">
            <Icon className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
    </div>
);


export const Landing: React.FC = () => {
  const { user } = useAuth();
  const enabledApps = getEnabledApps({});

  if (!user) {
    return (
      <div className="bg-background text-foreground">
        {/* Hero Section */}
        <section className="text-center py-20 lg:py-32 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Track Hub
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                    The ultimate dashboard to organize your favorite TV shows and manage your personal finances. All in one place.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/signup">
                        <Button size="lg" className="text-lg w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                            Get Started Free
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                    <Link to="/public/shows">
                        <Button size="lg" variant="outline" className="text-lg w-full sm:w-auto">
                            <Tv className="mr-2 h-5 w-5" />
                            Browse Shows
                        </Button>
                    </Link>
                    <Link to="/login">
                        <Button size="lg" variant="ghost" className="text-lg w-full sm:w-auto">
                            <LogIn className="mr-2 h-5 w-5" />
                            Login
                        </Button>
                    </Link>
                </div>
            </div>
        </section>

        {/* Features Overview Section */}
        <section className="py-16 lg:py-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">One Hub, Total Control</h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                        Seamlessly switch between tracking complex TV show universes and mastering your financial world.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* TV Show Tracker Card */}
                    <Card className="overflow-hidden group">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                    <Tv className="h-8 w-8 text-blue-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">TV Universe Tracker</CardTitle>
                                    <CardDescription>Never lose your place in a complex story again.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 text-muted-foreground">
                            <div className="flex items-start gap-3"><Film className="h-5 w-5 mt-0.5 text-blue-500 flex-shrink-0" /><span>Organize shows, seasons, and episodes with ease.</span></div>
                            <div className="flex items-start gap-3"><Users className="h-5 w-5 mt-0.5 text-blue-500 flex-shrink-0" /><span>Create and explore custom fictional universes.</span></div>
                            <div className="flex items-start gap-3"><BarChart3 className="h-5 w-5 mt-0.5 text-blue-500 flex-shrink-0" /><span>Track your watch progress across all your favorite shows.</span></div>
                        </CardContent>
                    </Card>
                    
                    {/* Finance Hub Card */}
                    <Card className="overflow-hidden group">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                                  <DollarSign className="h-8 w-8 text-green-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">Finance Hub</CardTitle>
                                    <CardDescription>Gain clarity and control over your financial life.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 text-muted-foreground">
                            <div className="flex items-start gap-3"><Wallet className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" /><span>Manage multiple wallets, from cash to crypto.</span></div>
                            <div className="flex items-start gap-3"><Target className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" /><span>Set budgets, track spending, and plan for the future.</span></div>
                            <div className="flex items-start gap-3"><Briefcase className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" /><span>Handle loans, debts, and collaborative organization finances.</span></div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
        
        {/* Detailed Platform Features */}
        <section className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-900/50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">Powerful Platform Features</h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                        Built with modern technology for a secure, fast, and pleasant user experience.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                   <FeatureCard 
                        icon={ShieldCheck}
                        title="Secure by Design"
                        description="Your data is yours. We use Supabase RLS to ensure your information is private and isolated."
                   />
                   <FeatureCard 
                        icon={MessageSquarePlus}
                        title="Feature Requests"
                        description="Have an idea for a new feature or want a new show added? Submit requests right from the app."
                   />
                   <FeatureCard 
                        icon={Users}
                        title="Collaboration Ready"
                        description="Share financial overviews with your organization or explore public TV universes created by the community."
                   />
                </div>
            </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-20">
            <div className="container mx-auto px-4">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">Ready to Get Organized?</h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
                    Join for free and start taking control of your entertainment and finances today. No credit card required.
                </p>
                <div className="mt-8">
                    <Link to="/signup">
                        <Button size="lg" className="text-lg">
                            Sign Up Now
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
      </div>
    );
  }

  // User is logged in
  const userName = user.name || 'User';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-2 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">Welcome back, {userName}!</h1>
          <p className="text-base sm:text-xl text-muted-foreground">
            Choose an application to get started
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-2xl md:max-w-4xl mx-auto">
          {enabledApps.map((app) => {
            const Icon = iconMap[app.icon as keyof typeof iconMap];
            const appColor = app.id === 'tv-shows' ? 'blue' : 'green';
            
            return (
              <Link key={app.id} to={app.routes[0].path} className="flex">
                <Card className="flex-1 hover:shadow-lg transition-all duration-200 cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      {Icon && <Icon className={`h-9 w-9 sm:h-12 sm:w-12 text-${appColor}-500`} />}
                      <div>
                        <CardTitle className="text-xl sm:text-2xl">{app.name}</CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                          {app.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 sm:space-y-3">
                      {app.routes.map((route) => (
                        <div key={route.path} className="flex items-center text-xs sm:text-sm">
                          <div className={`w-2 h-2 bg-${appColor}-500 rounded-full mr-3`} />
                          {route.name}
                        </div>
                      ))}
                    </div>
                    <Button
                      className={`w-full mt-4 bg-${appColor}-500 hover:bg-${appColor}-600`}
                    >
                      Open {app.name}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Landing;
