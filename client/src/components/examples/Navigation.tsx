import Navigation from '../Navigation';

export default function NavigationExample() {
  return (
    <Navigation 
      userRole="player"
      userName="John Doe"
      tokenBalance={1250}
      onNavigate={(page) => console.log('Navigate to:', page)}
    />
  );
}