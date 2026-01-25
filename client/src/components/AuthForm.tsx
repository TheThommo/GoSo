import { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Mail, Lock, User, Trophy } from 'lucide-react';

interface AuthFormProps {
  onLogin?: (email: string, password: string) => void;
  onRegister?: (email: string, password: string, name: string) => void;
  onSpectatorAccess?: (code: string) => void;
  isLoading?: boolean;
}

export default function AuthForm({ 
  onLogin, 
  onRegister, 
  onSpectatorAccess, 
  isLoading = false 
}: AuthFormProps) {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  
  // Spectator state
  const [spectatorCode, setSpectatorCode] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { email: loginEmail, password: '***' });
    onLogin?.(loginEmail, loginPassword);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Register attempt:', { name: registerName, email: registerEmail, password: '***' });
    onRegister?.(registerEmail, registerPassword, registerName);
  };

  const handleSpectatorAccess = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Spectator access attempt:', { code: spectatorCode });
    onSpectatorAccess?.(spectatorCode);
  };

  return (
    <div className="w-full max-w-md mx-auto" data-testid="card-auth-form">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
          <Trophy className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold font-serif">Golf Society</h1>
        <p className="text-muted-foreground mt-1">Join the prediction experience</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
          <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
          <TabsTrigger value="spectator" data-testid="tab-spectator">Spectator</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Welcome Back</h2>
              <p className="text-sm text-muted-foreground">
                Sign in to your account to continue
              </p>
            </CardHeader>
            
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-9"
                      required
                      data-testid="input-login-email"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-9 pr-9"
                      required
                      data-testid="input-login-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowPassword(!showPassword)}
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                  data-testid="button-login-submit"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="register">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Create Account</h2>
              <p className="text-sm text-muted-foreground">
                Join thousands of golf enthusiasts
              </p>
              <Badge variant="outline" className="w-fit">
                1000 Free Tokens to Start
              </Badge>
            </CardHeader>
            
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      className="pl-9"
                      required
                      data-testid="input-register-name"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Enter your email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="pl-9"
                      required
                      data-testid="input-register-email"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="pl-9 pr-9"
                      required
                      minLength={6}
                      data-testid="input-register-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowPassword(!showPassword)}
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                  data-testid="button-register-submit"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="spectator">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Spectator Access</h2>
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit tournament code to view as spectator
              </p>
            </CardHeader>
            
            <form onSubmit={handleSpectatorAccess}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="spectator-code">Tournament Code</Label>
                  <Input
                    id="spectator-code"
                    type="text"
                    placeholder="ABC123"
                    value={spectatorCode}
                    onChange={(e) => setSpectatorCode(e.target.value.toUpperCase())}
                    className="text-center text-xl font-mono tracking-widest"
                    maxLength={6}
                    required
                    data-testid="input-spectator-code"
                  />
                </div>
                
                <div className="text-center text-sm text-muted-foreground">
                  <p>Ask the tournament organizer for the spectator code</p>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || spectatorCode.length !== 6}
                  data-testid="button-spectator-submit"
                >
                  {isLoading ? 'Joining...' : 'Join as Spectator'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}