import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useKYC } from '@/contexts/KYCContext';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, XCircle, Clock, Copy, Download, Home, FileText, Calendar, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const FinalStatusStep = () => {
  const { application, resetApplication } = useKYC();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const status = application?.status || 'pending';
  const rejectionReason = application?.rejectionReason;

  const copyApplicationId = () => {
    if (application?.applicationId) {
      navigator.clipboard.writeText(application.applicationId);
      toast({
        title: 'Copied',
        description: 'Application ID copied to clipboard',
      });
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
        return {
          icon: CheckCircle,
          title: 'KYC Approved',
          description: 'Your KYC verification has been successfully completed.',
          bgColor: 'bg-success/10',
          iconColor: 'text-success',
          borderColor: 'border-success/20',
        };
      case 'rejected':
        return {
          icon: XCircle,
          title: 'KYC Rejected',
          description: rejectionReason || 'Your KYC verification could not be completed.',
          bgColor: 'bg-destructive/10',
          iconColor: 'text-destructive',
          borderColor: 'border-destructive/20',
        };
      case 'review':
        return {
          icon: Clock,
          title: 'Under Review',
          description: 'Your application is being reviewed by our team.',
          bgColor: 'bg-warning/10',
          iconColor: 'text-warning',
          borderColor: 'border-warning/20',
        };
      default:
        return {
          icon: Clock,
          title: 'Processing',
          description: 'Your KYC application is being processed.',
          bgColor: 'bg-muted',
          iconColor: 'text-muted-foreground',
          borderColor: 'border-border',
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  const handleStartNew = () => {
    resetApplication();
    navigate('/kyc');
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleDownloadCertificate = () => {
    if (!application) return;

    const lines = [
      'KYC Verification Certificate',
      '---------------------------',
      `Application ID: ${application.applicationId}`,
      `User ID: ${application.userId}`,
      `Status: ${application.status}`,
      `Submitted On: ${application.updatedAt ? new Date(application.updatedAt).toLocaleString('en-IN') : 'N/A'}`,
      `Created On: ${application.createdAt ? new Date(application.createdAt).toLocaleString('en-IN') : 'N/A'}`,
      '',
      'Personal Details:',
      `Name: ${application.personalDetails?.fullName || 'N/A'}`,
      `DOB: ${application.personalDetails?.dateOfBirth || 'N/A'}`,
      `Email: ${user?.email || 'N/A'}`,
      `Mobile: ${user?.mobile || 'N/A'}`,
      '',
      'Documents:',
      ...(application.documents || []).map(d => `- ${d.type}: ${d.status}`),
      '',
      'Photos:',
      `Photo: ${application.photo?.status || 'N/A'}`,
      `Selfie: ${application.selfie?.status || 'N/A'}`,
      `Face Match Score: ${application.selfie?.faceMatchScore ?? 'N/A'}`,
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${application.applicationId || 'kyc_certificate'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="border-0 shadow-elevated overflow-hidden">
        {/* Status Banner */}
        <div className={cn('p-8 text-center', config.bgColor)}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className={cn(
              'mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6',
              status === 'approved' ? 'bg-success' : status === 'rejected' ? 'bg-destructive' : 'bg-warning'
            )}
          >
            <StatusIcon className="h-12 w-12 text-primary-foreground" />
          </motion.div>
          
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            {config.title}
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {config.description}
          </p>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Application Details */}
          <div className="space-y-4">
            <h2 className="font-display font-semibold text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Application Details
            </h2>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 bg-muted rounded-xl">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Hash className="h-4 w-4" />
                  Application ID
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-foreground">
                    {application?.applicationId || user?.applicationId}
                  </span>
                  <button
                    onClick={copyApplicationId}
                    className="p-1 hover:bg-background rounded transition-colors"
                  >
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-xl">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Calendar className="h-4 w-4" />
                  Submitted On
                </div>
                <span className="font-semibold text-foreground">
                  {application?.updatedAt ? formatDate(application.updatedAt) : '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Status-specific content */}
          {status === 'approved' && (
            <div className="p-4 bg-success/5 border border-success/20 rounded-xl">
              <h3 className="font-semibold text-foreground mb-2">Next Steps</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Your account is now verified</li>
                <li>• You can access all services</li>
                <li>• Download your KYC certificate for your records</li>
              </ul>
            </div>
          )}

          {status === 'rejected' && (
            <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-xl">
              <h3 className="font-semibold text-foreground mb-2">What to do?</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Review the rejection reason above</li>
                <li>• Ensure your documents are clear and valid</li>
                <li>• You may submit a new application</li>
                <li>• Contact support if you believe this is an error</li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={handleGoHome}
              className="flex-1 gap-2"
            >
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Button>
            
            {status === 'approved' && (
              <Button className="flex-1 gap-2" onClick={handleDownloadCertificate}>
                <Download className="h-4 w-4" />
                Download Certificate
              </Button>
            )}
            
            {status === 'rejected' && (
              <Button onClick={handleStartNew} className="flex-1 gap-2">
                Start New Application
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
