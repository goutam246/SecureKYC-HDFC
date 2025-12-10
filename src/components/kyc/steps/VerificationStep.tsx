import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useKYC } from '@/contexts/KYCContext';
import { ShieldCheck, CheckCircle, XCircle, Clock, ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerificationStepProps {
  onComplete: (success: boolean) => void;
  onBack: () => void;
}

interface VerificationCheck {
  id: string;
  label: string;
  status: 'pending' | 'checking' | 'passed' | 'failed';
}

export const VerificationStep = ({ onComplete, onBack }: VerificationStepProps) => {
  const { submitForVerification, application } = useKYC();
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [checks, setChecks] = useState<VerificationCheck[]>([
    { id: 'docs', label: 'Document verification (Aadhaar & PAN)', status: 'pending' },
    { id: 'passport', label: 'Passport validity check', status: 'pending' },
    { id: 'duplicate', label: 'Duplicate application check', status: 'pending' },
    { id: 'face', label: 'Face match verification', status: 'pending' },
  ]);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    status: string;
    reason?: string;
  } | null>(null);

  const hasPassport = application?.documents.some(d => d.type === 'passport');

  const startVerification = async () => {
    setIsVerifying(true);
    
    // Simulate progressive verification checks
    const checkOrder = ['docs', 'passport', 'duplicate', 'face'];
    
    for (let i = 0; i < checkOrder.length; i++) {
      const checkId = checkOrder[i];
      
      // Skip passport check if no passport uploaded
      if (checkId === 'passport' && !hasPassport) {
        setChecks(prev => prev.map(c => 
          c.id === checkId ? { ...c, status: 'passed' } : c
        ));
        continue;
      }
      
      // Set current check to "checking"
      setChecks(prev => prev.map(c => 
        c.id === checkId ? { ...c, status: 'checking' } : c
      ));
      
      // Wait for animation effect
      await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));
      
      // All checks pass visually - actual result comes from submitForVerification
      setChecks(prev => prev.map(c => 
        c.id === checkId ? { ...c, status: 'passed' } : c
      ));
    }

    // Get actual result from KYC context
    const result = await submitForVerification();
    
    // Update checks based on actual result
    if (!result.success && result.reason) {
      // Mark the appropriate check as failed based on reason
      if (result.reason.includes('Aadhaar') || result.reason.includes('PAN') || result.reason.includes('mandatory')) {
        setChecks(prev => prev.map(c => c.id === 'docs' ? { ...c, status: 'failed' } : c));
      } else if (result.reason.includes('Passport')) {
        setChecks(prev => prev.map(c => c.id === 'passport' ? { ...c, status: 'failed' } : c));
      } else if (result.reason.includes('Duplicate')) {
        setChecks(prev => prev.map(c => c.id === 'duplicate' ? { ...c, status: 'failed' } : c));
      } else if (result.reason.includes('Face') || result.reason.includes('Selfie')) {
        setChecks(prev => prev.map(c => c.id === 'face' ? { ...c, status: 'failed' } : c));
      }
    }
    
    setVerificationResult({
      success: result.success,
      status: result.status,
      reason: result.reason,
    });
    
    setIsVerifying(false);
  };

  const getStatusIcon = (status: VerificationCheck['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-muted-foreground" />;
      case 'checking':
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-destructive" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-0 shadow-elevated">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <ShieldCheck className="h-6 w-6 text-primary" />
            KYC Verification
          </CardTitle>
          <CardDescription>
            Your documents and photos will be verified automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isVerifying && !verificationResult ? (
            <>
              {/* Pre-verification Summary */}
              <div className="p-6 bg-muted rounded-xl space-y-4">
                <h3 className="font-display font-semibold text-lg">Verification Checklist</h3>
                <p className="text-sm text-muted-foreground">
                  The following checks will be performed automatically:
                </p>
                <ul className="space-y-3">
                  {checks.map(check => (
                    <li key={check.id} className="flex items-center gap-3">
                      {getStatusIcon(check.status)}
                      <span className="text-sm">{check.label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> Verification process takes approximately 15-20 seconds. Please do not close this page.
                </p>
              </div>

              <div className="flex justify-between pt-4 border-t border-border">
                <Button variant="outline" onClick={onBack} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button onClick={startVerification} size="lg" className="gap-2">
                  Start Verification
                  <ShieldCheck className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : isVerifying ? (
            <>
              {/* Verification in Progress */}
              <div className="py-8 space-y-6">
                <div className="text-center space-y-4">
                  <div className="relative mx-auto w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ShieldCheck className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg">Verifying your KYC</h3>
                    <p className="text-sm text-muted-foreground">Please wait while we verify your documents</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {checks.map(check => (
                    <div
                      key={check.id}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg transition-all',
                        check.status === 'checking' && 'bg-primary/5',
                        check.status === 'passed' && 'bg-success/5',
                        check.status === 'failed' && 'bg-destructive/5'
                      )}
                    >
                      {getStatusIcon(check.status)}
                      <span className={cn(
                        'text-sm',
                        check.status === 'passed' && 'text-success',
                        check.status === 'failed' && 'text-destructive'
                      )}>
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : verificationResult && (
            <>
              {/* Verification Result */}
              <div className="py-8 text-center space-y-6">
                <div
                  className={cn(
                    'mx-auto w-20 h-20 rounded-full flex items-center justify-center',
                    verificationResult.success ? 'bg-success/10' : 'bg-destructive/10'
                  )}
                >
                  {verificationResult.success ? (
                    <CheckCircle className="h-10 w-10 text-success" />
                  ) : (
                    <XCircle className="h-10 w-10 text-destructive" />
                  )}
                </div>
                
                <div>
                  <h3 className={cn(
                    'font-display font-semibold text-2xl',
                    verificationResult.success ? 'text-success' : 'text-destructive'
                  )}>
                    {verificationResult.success ? 'Verification Successful' : 'Verification Failed'}
                  </h3>
                  {verificationResult.reason && (
                    <p className="mt-2 text-muted-foreground">{verificationResult.reason}</p>
                  )}
                </div>

                <Button
                  onClick={() => onComplete(verificationResult.success)}
                  size="lg"
                  variant={verificationResult.success ? 'default' : 'outline'}
                >
                  View Final Status
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
