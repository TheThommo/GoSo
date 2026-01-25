import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Edit3, 
  Save, 
  X, 
  Upload,
  Shield,
  Calendar,
  Trophy,
  LogOut
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfileEditorProps {
  user: {
    id: string;
    name: string;
    email?: string;
    role: 'master_admin' | 'game_admin' | 'player' | 'spectator';
    profileImageUrl?: string;
    tokenBalance: number;
    joinedDate?: string;
    gamesPlayed?: number;
    accuracy?: number;
  };
  onSave: (updatedUser: any) => void;
  onCancel: () => void;
}

export default function ProfileEditor({ user, onSave, onCancel }: ProfileEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email || '',
    profileImageUrl: user.profileImageUrl || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Display name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Display name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Display name must be less than 50 characters';
    }

    // Email validation (if provided)
    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Profile image URL validation (if provided)
    if (formData.profileImageUrl && !isValidImageUrl(formData.profileImageUrl)) {
      newErrors.profileImageUrl = 'Please enter a valid image URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidImageUrl = (url: string) => {
    try {
      new URL(url);
      // More flexible image URL validation - allows query parameters
      return url.match(/\.(jpeg|jpg|gif|png|svg|webp)(\?.*)?$/i) !== null;
    } catch {
      return false;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation
    const newErrors = { ...errors };
    
    if (field === 'name') {
      if (!value.trim()) {
        newErrors.name = 'Display name is required';
      } else if (value.trim().length < 2) {
        newErrors.name = 'Display name must be at least 2 characters';
      } else if (value.trim().length > 50) {
        newErrors.name = 'Display name must be less than 50 characters';
      } else {
        delete newErrors.name;
      }
    }
    
    if (field === 'email' && value) {
      if (!isValidEmail(value)) {
        newErrors.email = 'Please enter a valid email address';
      } else {
        delete newErrors.email;
      }
    } else if (field === 'email' && !value) {
      delete newErrors.email;
    }
    
    if (field === 'profileImageUrl' && value) {
      if (!isValidImageUrl(value)) {
        newErrors.profileImageUrl = 'Please enter a valid image URL';
      } else {
        delete newErrors.profileImageUrl;
      }
    } else if (field === 'profileImageUrl' && !value) {
      delete newErrors.profileImageUrl;
    }
    
    setErrors(newErrors);
  };

  const handleSave = () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving.",
        variant: "destructive",
      });
      return;
    }

    // Simulate unique nickname validation
    if (formData.name.toLowerCase() === 'admin' || formData.name.toLowerCase() === 'system') {
      setErrors({ name: 'This nickname is not available' });
      toast({
        title: "Nickname Unavailable",
        description: "Please choose a different display name.",
        variant: "destructive",
      });
      return;
    }

    onSave({
      ...user,
      name: formData.name.trim(),
      email: formData.email.trim(),
      profileImageUrl: formData.profileImageUrl.trim()
    });

    toast({
      title: "Profile Updated",
      description: "Your profile has been saved successfully.",
      variant: "default",
    });

    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email || '',
      profileImageUrl: user.profileImageUrl || ''
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleLogout = () => {
    // Redirect to logout endpoint
    window.location.href = '/api/logout';
  };

  const getRoleDisplayName = (role: string) => {
    return role.replace('_', ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'master_admin': return 'default';
      case 'game_admin': return 'secondary';
      case 'player': return 'outline';
      case 'spectator': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage 
                  src={isEditing ? formData.profileImageUrl : user.profileImageUrl} 
                />
                <AvatarFallback className="text-lg">
                  {(isEditing ? formData.name : user.name).split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold font-serif">
                  {isEditing ? 'Edit Profile' : user.name}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    <Shield className="w-3 h-3 mr-1" />
                    {getRoleDisplayName(user.role)}
                  </Badge>
                  {user.joinedDate && (
                    <Badge variant="outline">
                      <Calendar className="w-3 h-3 mr-1" />
                      Member since {new Date(user.joinedDate).getFullYear()}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {!isEditing ? (
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
                data-testid="button-edit-profile"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  data-testid="button-cancel-edit"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={Object.keys(errors).length > 0 || !formData.name.trim()}
                  data-testid="button-save-profile"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        {isEditing && (
          <CardContent className="space-y-6">
            <Separator />
            
            {/* Profile Image */}
            <div className="space-y-2">
              <Label htmlFor="profileImage">Profile Image URL (Optional)</Label>
              <div className="flex gap-3">
                <Input
                  id="profileImage"
                  placeholder="https://example.com/your-image.jpg"
                  value={formData.profileImageUrl}
                  onChange={(e) => handleInputChange('profileImageUrl', e.target.value)}
                  data-testid="input-profile-image-url"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => {
                    toast({
                      title: "Feature Coming Soon",
                      description: "Direct image upload will be available in a future update. For now, please use an image URL.",
                      variant: "default",
                    });
                  }}
                  data-testid="button-upload-image"
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
              {errors.profileImageUrl && (
                <p className="text-sm text-red-600">{errors.profileImageUrl}</p>
              )}
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name *</Label>
              <Input
                id="displayName"
                placeholder="Your display name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                data-testid="input-display-name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
              <p className="text-xs text-muted-foreground">
                This is how other players will see your name
              </p>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address (Optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                data-testid="input-email-address"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Used for notifications and account recovery
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Profile Stats - Always Visible */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Gaming Statistics
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold font-mono" data-testid="text-token-balance">
                {user.tokenBalance.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Gaming Tokens</div>
              <div className="text-xs text-muted-foreground mt-1">
                Entertainment value only
              </div>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold" data-testid="text-games-played">
                {user.gamesPlayed || 0}
              </div>
              <div className="text-sm text-muted-foreground">Games Played</div>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold" data-testid="text-accuracy">
                {user.accuracy || 0}%
              </div>
              <div className="text-sm text-muted-foreground">Prediction Accuracy</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="border-muted">
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Privacy Notice */}
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm space-y-2">
                <div className="font-semibold text-blue-600">Privacy & Security</div>
                <p className="text-muted-foreground leading-relaxed">
                  Your profile information is used only for platform functionality and social features. 
                  We never share your personal information with third parties. All gaming activity is for 
                  entertainment purposes only with no monetary value.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="outline" className="text-xs">Secure Profile</Badge>
                  <Badge variant="outline" className="text-xs">Privacy Protected</Badge>
                  <Badge variant="outline" className="text-xs">Entertainment Only</Badge>
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Logout Section */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Sign Out</div>
                <div className="text-sm text-muted-foreground">
                  Securely sign out of your account
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                data-testid="button-logout"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}