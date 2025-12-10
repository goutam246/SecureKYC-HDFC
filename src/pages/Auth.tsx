import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Mail, Lock, Phone, User, Hash, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register, loginWithApplicationId, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [activeTab, setActiveTab] = useState(initialMode);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginAppId, setLoginAppId] = useState('');
  const [loginMethod, setLoginMethod] = useState<'email' | 'appId'>('email');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showLoginAppIdPassword, setShowLoginAppIdPassword] = useState(false);

  // Register form
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerMobile, setRegisterMobile] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);

  // Registration success state
  const [registrationSuccess, setRegistrationSuccess] = useState<{ applicationId: string } | null>(null);

  useEffect(() => {
    if (isAuthenticated && !registrationSuccess) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, registrationSuccess]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    let result;
    if (loginMethod === 'email') {
      if (!loginEmail || !loginPassword) {
        toast({
          title: 'Missing fields',
          description: 'Please enter email and password',
          variant: 'destructive',
        });
        return;
      }
      result = await login(loginEmail, loginPassword);
    } else {
      if (!loginAppId || !loginPassword) {
        toast({
          title: 'Missing field',
          description: 'Please enter your Application ID and password',
          variant: 'destructive',
        });
        return;
      }
      result = await loginWithApplicationId(loginAppId, loginPassword);
    }

    if (!result.success) {
      toast({
        title: 'Login failed',
        description: result.error || 'Please check your credentials',
        variant: 'destructive',
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!registerEmail || !registerMobile || !registerPassword) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerEmail)) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    if (!/^[6-9]\d{9}$/.test(registerMobile)) {
      toast({
        title: 'Invalid mobile',
        description: 'Please enter a valid 10-digit mobile number',
        variant: 'destructive',
      });
      return;
    }

    if (registerPassword.length < 6) {
      toast({
        title: 'Weak password',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      toast({
        title: 'Password mismatch',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    const result = await register(registerEmail, registerMobile, registerPassword, registerName);

    if (result.success && result.applicationId) {
      setRegistrationSuccess({ applicationId: result.applicationId });
    } else {
      toast({
        title: 'Registration failed',
        description: result.error || 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleContinueToKYC = () => {
    navigate('/kyc');
  };

  if (registrationSuccess) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="w-full max-w-md border-0 shadow-elevated">
              <CardContent className="pt-8 pb-6 text-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6">
                  <CheckCircle className="h-10 w-10 text-success" />
                </div>
                
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  Registration Successful!
                </h2>
                <p className="text-muted-foreground mb-6">
                  Your unique Application ID has been generated
                </p>

                <div className="p-4 bg-muted rounded-xl mb-6">
                  <p className="text-sm text-muted-foreground mb-1">Application ID</p>
                  <p className="font-mono text-lg font-bold text-primary">
                    {registrationSuccess.applicationId}
                  </p>
                </div>

                <p className="text-sm text-muted-foreground mb-6">
                  Save this ID! You can use it to check your KYC status anytime.
                </p>

                <Button onClick={handleContinueToKYC} size="lg" className="w-full gap-2">
                  Continue to KYC
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-muted/50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Welcome to SecureKYC
            </h1>
            <p className="text-muted-foreground mt-1">
              {activeTab === 'login' ? 'Sign in to continue your KYC' : 'Create an account to get started'}
            </p>
          </div>

          <Card className="border-0 shadow-elevated">
            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  <TabsContent value="login" className="space-y-4">
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Login Method Toggle */}
                      <div className="flex gap-2 mb-4">
                        <Button
                          type="button"
                          variant={loginMethod === 'email' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setLoginMethod('email')}
                          className="flex-1"
                        >
                          Email
                        </Button>
                        <Button
                          type="button"
                          variant={loginMethod === 'appId' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setLoginMethod('appId')}
                          className="flex-1"
                        >
                          Application ID
                        </Button>
                      </div>

                      <form onSubmit={handleLogin} className="space-y-4">
                        {loginMethod === 'email' ? (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="login-email" className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                Email
                              </Label>
                              <Input
                                id="login-email"
                                type="email"
                                placeholder="your@email.com"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="login-password" className="flex items-center gap-2">
                                <Lock className="h-4 w-4 text-muted-foreground" />
                                Password
                              </Label>
                              <div className="relative">
                                <Input
                                  id="login-password"
                                  type={showLoginPassword ? 'text' : 'password'}
                                  placeholder="••••••••"
                                  value={loginPassword}
                                  onChange={(e) => setLoginPassword(e.target.value)}
                                  className="pr-10"
                                />
                                <button
                                  type="button"
                                  className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
                                  onClick={() => setShowLoginPassword((prev) => !prev)}
                                >
                                  {showLoginPassword ? 'Hide' : 'Show'}
                                </button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="login-appid" className="flex items-center gap-2">
                                <Hash className="h-4 w-4 text-muted-foreground" />
                                Application ID
                              </Label>
                              <Input
                                id="login-appid"
                                placeholder="KYC-XXXXXX-XXXX"
                                value={loginAppId}
                                onChange={(e) => setLoginAppId(e.target.value.toUpperCase())}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="login-password-app" className="flex items-center gap-2">
                                <Lock className="h-4 w-4 text-muted-foreground" />
                                Password
                              </Label>
                              <div className="relative">
                                <Input
                                  id="login-password-app"
                                  type={showLoginAppIdPassword ? 'text' : 'password'}
                                  placeholder="••••••••"
                                  value={loginPassword}
                                  onChange={(e) => setLoginPassword(e.target.value)}
                                  className="pr-10"
                                />
                                <button
                                  type="button"
                                  className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
                                  onClick={() => setShowLoginAppIdPassword((prev) => !prev)}
                                >
                                  {showLoginAppIdPassword ? 'Hide' : 'Show'}
                                </button>
                              </div>
                            </div>
                          </>
                        )}

                        <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Signing in...
                            </>
                          ) : (
                            <>
                              Sign In
                              <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </form>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="register" className="space-y-4">
                    <motion.div
                      key="register"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="register-name" className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            Full Name (Optional)
                          </Label>
                          <Input
                            id="register-name"
                            placeholder="John Doe"
                            value={registerName}
                            onChange={(e) => setRegisterName(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="register-email" className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            Email *
                          </Label>
                          <Input
                            id="register-email"
                            type="email"
                            placeholder="your@email.com"
                            value={registerEmail}
                            onChange={(e) => setRegisterEmail(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="register-mobile" className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            Mobile Number *
                          </Label>
                          <Input
                            id="register-mobile"
                            placeholder="9876543210"
                            value={registerMobile}
                            onChange={(e) => setRegisterMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="register-password" className="flex items-center gap-2">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                            Password *
                          </Label>
                          <div className="relative">
                            <Input
                              id="register-password"
                              type={showRegisterPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              value={registerPassword}
                              onChange={(e) => setRegisterPassword(e.target.value)}
                              className="pr-10"
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
                              onClick={() => setShowRegisterPassword((prev) => !prev)}
                            >
                              {showRegisterPassword ? 'Hide' : 'Show'}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="register-confirm" className="flex items-center gap-2">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                            Confirm Password *
                          </Label>
                          <div className="relative">
                            <Input
                              id="register-confirm"
                              type={showRegisterConfirmPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              value={registerConfirmPassword}
                              onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                              className="pr-10"
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
                              onClick={() => setShowRegisterConfirmPassword((prev) => !prev)}
                            >
                              {showRegisterConfirmPassword ? 'Hide' : 'Show'}
                            </button>
                          </div>
                        </div>

                        <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Creating account...
                            </>
                          ) : (
                            <>
                              Create Account
                              <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </form>
                    </motion.div>
                  </TabsContent>
                </AnimatePresence>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Auth;
