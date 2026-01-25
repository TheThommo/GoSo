import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Coins, TrendingUp } from 'lucide-react';
import heroImage from '@assets/generated_images/Golf_course_hero_image_5526c204.png';

interface HeroSectionProps {
  userRole?: 'master_admin' | 'game_admin' | 'player' | 'spectator' | null;
  userName?: string;
  onGetStarted?: () => void;
  onViewTournaments?: () => void;
}

export default function HeroSection({ 
  userRole, 
  userName, 
  onGetStarted, 
  onViewTournaments 
}: HeroSectionProps) {
  const isLoggedIn = !!userRole;

  const stats = [
    { icon: Trophy, label: 'Active Tournaments', value: '12' },
    { icon: Users, label: 'Total Players', value: '450+' },
    { icon: Coins, label: 'Gaming Tokens', value: '125K' },
    { icon: TrendingUp, label: 'Success Rate', value: '89%' }
  ];

  return (
    <section 
      className="relative min-h-[70vh] bg-cover bg-center bg-no-repeat flex items-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${heroImage})`
      }}
      data-testid="section-hero"
    >
      <div className="container mx-auto px-4 text-white">
        <div className="max-w-4xl">
          {isLoggedIn && userName && (
            <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-white/20">
              Welcome back, {userName}!
            </Badge>
          )}
          
          <h1 className="text-4xl md:text-6xl font-bold font-serif mb-6">
            Golf Society
            <br />
            <span className="text-accent-foreground">Prediction Platform</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-4 text-white/90 max-w-2xl">
            Join the ultimate golf prediction experience. Make your picks, allocate gaming tokens to players, 
            and compete with friends in real tournaments.
          </p>
          
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/20">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-white/90">Gaming tokens only • No monetary value • For entertainment</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            {!isLoggedIn ? (
              <Button
                size="lg"
                className="text-lg px-8 py-4 bg-primary hover:bg-primary/90"
                onClick={() => {
                  console.log('Get started clicked');
                  onGetStarted?.();
                }}
                data-testid="button-get-started"
              >
                Get Started Free
              </Button>
            ) : (
              <Button
                size="lg"
                className="text-lg px-8 py-4 bg-primary hover:bg-primary/90"
                onClick={() => {
                  console.log('View tournaments clicked');
                  onViewTournaments?.();
                }}
                data-testid="button-view-tournaments"
              >
                View Tournaments
              </Button>
            )}
            
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-4 bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={() => console.log('Learn more clicked')}
              data-testid="button-learn-more"
            >
              Learn More
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
                data-testid={`stat-${stat.label.toLowerCase().replace(' ', '-')}`}
              >
                <stat.icon className="w-6 h-6 mx-auto mb-2 text-accent-foreground" />
                <div className="text-2xl font-bold font-mono mb-1">{stat.value}</div>
                <div className="text-sm text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}