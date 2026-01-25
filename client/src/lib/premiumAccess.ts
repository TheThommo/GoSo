export interface PremiumAccessStatus {
  hasPremiumAccess: boolean;
  accessLevel: 'full' | 'view_only' | 'none';
  reason: 'free_period' | 'admin_role' | 'subscription' | 'expired' | 'free_tier';
  freeUntilDate: Date;
  daysRemaining?: number;
}

export function checkPremiumAccess(userRole: string): PremiumAccessStatus {
  const freeUntilDate = new Date('2025-11-30T23:59:59');
  const currentDate = new Date();
  
  // Admin roles always have premium access
  if (userRole === 'master_admin' || userRole === 'game_admin') {
    return {
      hasPremiumAccess: true,
      accessLevel: 'full',
      reason: 'admin_role',
      freeUntilDate
    };
  }
  
  // Check if we're still in the free period (before Dec 1, 2025)
  if (currentDate <= freeUntilDate) {
    const daysRemaining = Math.ceil((freeUntilDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    return {
      hasPremiumAccess: true,
      accessLevel: 'full',
      reason: 'free_period',
      freeUntilDate,
      daysRemaining
    };
  }
  
  // TODO: Add subscription checking logic here
  // For now, after Dec 1, 2025, non-admin users get view-only access (free tier)
  return {
    hasPremiumAccess: false,
    accessLevel: 'view_only',
    reason: 'free_tier',
    freeUntilDate
  };
}

export function getPremiumFeatures(): string[] {
  return [
    'Advanced analytics',
    'CSV data exports', 
    'Priority support',
    'Exclusive tournaments',
    'Detailed performance insights'
  ];
}

export function getBasicFeatures(): string[] {
  return [
    'Tournament predictions',
    'Society leaderboards', 
    'Gaming tokens',
    'Basic analytics'
  ];
}

export function getFreeFeatures(): string[] {
  return [
    'View tournaments',
    'Read tournament details',
    'Browse society information'
  ];
}