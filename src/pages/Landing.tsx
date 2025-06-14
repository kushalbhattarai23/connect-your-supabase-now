import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getEnabledApps } from '@/config/apps';
import { Tv, DollarSign, ArrowRight, BarChart3, Users, LogIn } from 'lucide-react';

const iconMap = {
  Tv,
  DollarSign,
};

export const Landing: React.FC = () => {
  const { user } = useAuth();
  const enabledApps = getEnabledApps({});

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ModularApp
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Your all-in-one platform for tracking TV shows and managing finances. 
              Modular, powerful, and designed for modern life.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" className="text-lg px-8 py-3">
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign In
                </Button>
              </Link>
              <Link to="/tv-shows/public-shows">
                <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                  <Tv className="mr-2 h-5 w-5" />
                  Browse TV Shows
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-16 max-w-4xl mx-auto">
            {enabledApps.map((app) => {
              const Icon = iconMap[app.icon as keyof typeof iconMap];
              return (
                <Card key={app.id} className="relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full bg-${app.color}-500`} />
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      {Icon && <Icon className={`h-8 w-8 text-${app.color}-500`} />}
                      <div>
                        <CardTitle className="text-2xl">{app.name}</CardTitle>
                        <CardDescription className="text-base">
                          {app.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {app.id === 'tv-shows' ? (
                        <>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <div className="w-2 h-2 bg-current rounded-full mr-3 opacity-60" />
                            Browse Public Shows
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <div className="w-2 h-2 bg-current rounded-full mr-3 opacity-60" />
                            Explore Public Universes
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <div className="w-2 h-2 bg-current rounded-full mr-3 opacity-60" />
                            Track Your Favorites
                          </div>
                        </>
                      ) : (
                        app.routes.slice(0, 3).map((route) => (
                          <div key={route.path} className="flex items-center text-sm text-muted-foreground">
                            <div className="w-2 h-2 bg-current rounded-full mr-3 opacity-60" />
                            {route.name}
                          </div>
                        ))
                      )}
                    </div>
                    {app.id === 'tv-shows' && (
                      <Link to="/tv-shows/public-shows">
                        <Button 
                          className={`w-full mt-4 bg-${app.color}-500 hover:bg-${app.color}-600`}
                        >
                          Explore Shows
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-16">
            <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                <h3 className="font-semibold mb-2">Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Track your progress with detailed analytics and insights
                </p>
              </div>
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="font-semibold mb-2">Collaboration</h3>
                <p className="text-sm text-muted-foreground">
                  Share universes and collaborate with friends
                </p>
              </div>
              <div className="text-center">
                <ArrowRight className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                <h3 className="font-semibold mb-2">Modular</h3>
                <p className="text-sm text-muted-foreground">
                  Add or remove features as needed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User is logged in
  const userName = user.name || 'User';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome back, {userName}!</h1>
          <p className="text-xl text-muted-foreground">
            Choose an application to get started
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {enabledApps.map((app) => {
            const Icon = iconMap[app.icon as keyof typeof iconMap];
            return (
              <Link key={app.id} to={app.routes[0].path}>
                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      {Icon && <Icon className={`h-12 w-12 text-${app.color}-500`} />}
                      <div>
                        <CardTitle className="text-2xl">{app.name}</CardTitle>
                        <CardDescription className="text-base">
                          {app.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {app.routes.map((route) => (
                        <div key={route.path} className="flex items-center text-sm">
                          <div className={`w-2 h-2 bg-${app.color}-500 rounded-full mr-3`} />
                          {route.name}
                        </div>
                      ))}
                    </div>
                    <Button 
                      className={`w-full mt-4 bg-${app.color}-500 hover:bg-${app.color}-600`}
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
