import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Star, Calendar, Lock } from 'lucide-react';
import { PremiumAccessStatus } from '@/lib/premiumAccess';

interface PaywallBannerProps {
  accessStatus: PremiumAccessStatus;
  variant?: 'banner' | 'modal' | 'card';
}

export default function PaywallBanner({ accessStatus, variant = 'banner' }: PaywallBannerProps) {
  if (accessStatus.hasPremiumAccess) {
    return null;
  }

  // Don't show paywall for view-only users, they can still view tournaments
  if (accessStatus.accessLevel === 'view_only') {
    return null;
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-primary/10 to-primary/20 border border-primary/20 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6 text-primary" />
            <div>
              <h3 className="font-semibold text-lg">Premium Access Required</h3>
              <p className="text-sm text-muted-foreground">
                Free access ended on {formatDate(accessStatus.freeUntilDate)}. Upgrade to continue using all features.
              </p>
            </div>
          </div>
          <Button className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Upgrade Now
          </Button>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-xl">Premium Feature</h3>
          <p className="text-muted-foreground">
            This feature requires a premium subscription
          </p>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <div className="text-3xl font-bold">$5<span className="text-lg font-normal text-muted-foreground">/month</span></div>
            <p className="text-sm text-muted-foreground">or $50/year</p>
          </div>
          <Button className="w-full" size="lg">
            <Star className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </Button>
          <p className="text-xs text-muted-foreground">
            Free access ended on {formatDate(accessStatus.freeUntilDate)}
          </p>
        </CardContent>
      </Card>
    );
  }

  return null;
}

interface PremiumFeatureLockProps {
  children: React.ReactNode;
  accessStatus: PremiumAccessStatus;
  featureName?: string;
}

export function PremiumFeatureLock({ children, accessStatus, featureName = "This feature" }: PremiumFeatureLockProps) {
  if (accessStatus.hasPremiumAccess) {
    return <>{children}</>;
  }

  // For view-only users, completely hide restricted content instead of showing blurred version
  if (accessStatus.accessLevel === 'view_only') {
    return (
      <div className="flex items-center justify-center p-8 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/30">
        <div className="text-center">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
          <p className="text-sm text-muted-foreground mb-4">{featureName} is available with premium access</p>
          <Button>
            <Star className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </Button>
        </div>
      </div>
    );
  }

  // For completely expired access, show the blurred version with overlay
  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
        <div className="text-center p-4">
          <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium text-muted-foreground">{featureName} requires premium</p>
          <Button size="sm" className="mt-2">
            <Star className="w-3 h-3 mr-1" />
            Upgrade
          </Button>
        </div>
      </div>
    </div>
  );
}