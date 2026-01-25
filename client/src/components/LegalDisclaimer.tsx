import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, AlertTriangle, Info } from 'lucide-react';

interface LegalDisclaimerProps {
  variant?: 'full' | 'compact' | 'banner';
  className?: string;
}

export default function LegalDisclaimer({ variant = 'compact', className = '' }: LegalDisclaimerProps) {
  if (variant === 'banner') {
    return (
      <Alert className={`border-amber-200 bg-amber-50 dark:bg-amber-900/20 ${className}`}>
        <Shield className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-sm">
          <strong>Entertainment Only:</strong> This platform is for entertainment purposes only. No monetary value is exchanged. 
          All gaming tokens have no cash value and cannot be redeemed for money.
        </AlertDescription>
      </Alert>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={`border-muted ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm space-y-2">
              <div className="font-semibold text-blue-600">Legal Compliance Notice</div>
              <p className="text-muted-foreground leading-relaxed">
                This platform is <strong>NOT a gambling or wagering site</strong>. All activities are for entertainment purposes only. 
                Gaming tokens have no monetary value and cannot be exchanged for real money. No purchase necessary.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline" className="text-xs">Entertainment Only</Badge>
                <Badge variant="outline" className="text-xs">No Monetary Value</Badge>
                <Badge variant="outline" className="text-xs">Fully Compliant</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full disclaimer
  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold">Legal Disclaimer & Terms of Service</h3>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Primary Disclaimer */}
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            <strong>IMPORTANT:</strong> This is NOT a gambling, gaming, or wagering website. 
            This platform is designed exclusively for entertainment and social interaction purposes.
          </AlertDescription>
        </Alert>

        {/* No Monetary Value Section */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" />
            No Monetary Value or Exchange
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
            <li>All "gaming tokens" are virtual points with absolutely no monetary value</li>
            <li>Gaming tokens cannot be redeemed, exchanged, or converted to real money</li>
            <li>No purchases are required to participate in any platform activities</li>
            <li>No real money, cryptocurrency, or valuable consideration is involved</li>
            <li>All token transactions are purely for entertainment scoring purposes</li>
          </ul>
        </div>

        <Separator />

        {/* Entertainment Purpose */}
        <div className="space-y-3">
          <h4 className="font-semibold">Entertainment Purpose Only</h4>
          <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
            <li>This platform provides entertainment through golf prediction games</li>
            <li>All activities are designed for social interaction and fun</li>
            <li>Predictions and allocations are made for entertainment value only</li>
            <li>No skill-based rewards or monetary incentives are provided</li>
          </ul>
        </div>

        <Separator />

        {/* Legal Compliance */}
        <div className="space-y-3">
          <h4 className="font-semibold">Legal Compliance</h4>
          <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
            <li>This platform complies with all applicable local and international laws</li>
            <li>No gambling, wagering, or money gaming activities take place</li>
            <li>Platform operates within legal frameworks for entertainment services</li>
            <li>Users must be 13+ years old to participate (no gambling age restrictions apply)</li>
            <li>We reserve the right to verify user compliance with local laws</li>
          </ul>
        </div>

        <Separator />

        {/* User Responsibilities */}
        <div className="space-y-3">
          <h4 className="font-semibold">User Responsibilities</h4>
          <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
            <li>Users confirm they understand this is entertainment-only platform</li>
            <li>Users agree not to attempt to assign monetary value to gaming tokens</li>
            <li>Users must comply with their local laws regarding online entertainment</li>
            <li>Platform may be restricted in certain jurisdictions - users are responsible for compliance</li>
          </ul>
        </div>

        <Separator />

        {/* Contact Information */}
        <div className="space-y-3">
          <h4 className="font-semibold">Questions or Concerns</h4>
          <p className="text-sm text-muted-foreground">
            If you have questions about our legal compliance or terms of service, please contact our support team. 
            We are committed to maintaining full legal compliance and transparent operations.
          </p>
        </div>

        {/* Compliance Badges */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Badge variant="outline" className="text-xs">
            <Shield className="w-3 h-3 mr-1" />
            Entertainment Only
          </Badge>
          <Badge variant="outline" className="text-xs">No Monetary Exchange</Badge>
          <Badge variant="outline" className="text-xs">Legally Compliant</Badge>
          <Badge variant="outline" className="text-xs">Social Gaming Platform</Badge>
          <Badge variant="outline" className="text-xs">Age Appropriate 13+</Badge>
        </div>

        <div className="text-xs text-muted-foreground pt-2">
          Last updated: {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </CardContent>
    </Card>
  );
}