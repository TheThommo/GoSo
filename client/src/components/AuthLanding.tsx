import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Target, Shield, Check, Star } from 'lucide-react';
import LegalDisclaimer from './LegalDisclaimer';

export default function AuthLanding() {
  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-serif mb-6">
            Golf Society Predictions
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join your golf society's prediction games. Make tournament predictions, 
            earn gaming tokens, and compete with friends - all for entertainment!
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Badge variant="outline" className="text-sm">
              <Trophy className="w-4 h-4 mr-2" />
              Tournament Predictions
            </Badge>
            <Badge variant="outline" className="text-sm">
              <Users className="w-4 h-4 mr-2" />
              Society Leaderboards
            </Badge>
            <Badge variant="outline" className="text-sm">
              <Target className="w-4 h-4 mr-2" />
              Gaming Tokens
            </Badge>
            <Badge variant="outline" className="text-sm">
              <Shield className="w-4 h-4 mr-2" />
              Entertainment Only
            </Badge>
          </div>

          <Button 
            size="lg" 
            onClick={handleLogin}
            className="text-lg px-8 py-6"
            data-testid="button-sign-in"
          >
            Sign In with Google
          </Button>
          
          <p className="text-sm text-muted-foreground mt-4">
            Secure authentication powered by Google
          </p>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-serif mb-4">Simple Pricing</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade when you're ready for premium features
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader className="text-center pb-8">
              <Badge variant="secondary" className="w-fit mx-auto mb-4">FREE UNTIL NOV 30, 2025</Badge>
              <h3 className="font-semibold text-2xl mb-2">Free Access</h3>
              <div className="text-4xl font-bold mb-2">$0</div>
              <p className="text-muted-foreground">Complete access until November 2025</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <span>Tournament predictions</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <span>Society leaderboards</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <span>Gaming tokens</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <span>Basic analytics</span>
              </div>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="relative border-primary">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">
                <Star className="w-4 h-4 mr-1" />
                PREMIUM
              </Badge>
            </div>
            <CardHeader className="text-center pb-8">
              <Badge variant="outline" className="w-fit mx-auto mb-4">STARTING DEC 1, 2025</Badge>
              <h3 className="font-semibold text-2xl mb-2">Premium Access</h3>
              <div className="text-4xl font-bold mb-2">
                $5<span className="text-lg font-normal text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground">or $50/year</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <span>Everything in Free</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <span>Advanced analytics</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <span>CSV data exports</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <span>Priority support</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <span>Exclusive tournaments</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            All features available free until November 30, 2025. Premium subscription required thereafter.
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <Trophy className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">Tournament Predictions</h3>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                Make predictions on golf tournaments and compete with your society members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">Society Leaderboards</h3>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                Track your performance and see how you rank against other players
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Target className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">Gaming Tokens</h3>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                Earn entertainment tokens for accurate predictions - no monetary value
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-3xl mx-auto">
          <LegalDisclaimer variant="compact" />
        </div>
      </div>
    </div>
  );
}