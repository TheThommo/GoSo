import HeroSection from '../HeroSection';

export default function HeroSectionExample() {
  return (
    <HeroSection
      userRole="player"
      userName="John Doe"
      onGetStarted={() => console.log('Get started clicked')}
      onViewTournaments={() => console.log('View tournaments clicked')}
    />
  );
}