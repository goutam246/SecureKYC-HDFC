import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useKYC } from '@/contexts/KYCContext';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  Copy,
  User,
  Shield,
  FileCheck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { application, initializeApplication } = useKYC();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    // Initialize or restore KYC application
    if (user && !application) {
      initializeApplication(user.id, user.email, user.mobile);
    }
  }, [user, application, initializeApplication]);

  const copyApplicationId = () => {
    const appId = application?.applicationId || user?.applicationId;
    if (appId) {
      navigator.clipboard.writeText(appId);
      toast({
        title: 'Copied',
        description: 'Application ID copied to clipboard',
      });
    }
  };

  const getStatusConfig = () => {
    const status = application?.status || 'pending';
    switch (status) {
      case 'approved':
        return {
          icon: CheckCircle,
          label: 'Approved',
          color: 'text-success',
          bg: 'bg-success/10',
          border: 'border-success/20',
        };
      case 'rejected':
        return {
          icon: AlertCircle,
          label: 'Rejected',
          color: 'text-destructive',
          bg: 'bg-destructive/10',
          border: 'border-destructive/20',
        };
      case 'in_progress':
        return {
          icon: Clock,
          label: 'In Progress',
          color: 'text-warning',
          bg: 'bg-warning/10',
          border: 'border-warning/20',
        };
      default:
        return {
          icon: Clock,
          label: 'Pending',
          color: 'text-muted-foreground',
          bg: 'bg-muted',
          border: 'border-border',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Welcome back{user?.name ? `, ${user.name}` : ''}!
          </h1>
          <p className="text-muted-foreground">
            Manage your KYC verification and track your application status.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Application Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="border-0 shadow-elevated h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  KYC Application
                </CardTitle>
                <CardDescription>
                  Your current verification status and progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Application ID */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                  <div>
                    <p className="text-sm text-muted-foreground">Application ID</p>
                    <p className="font-mono font-semibold text-foreground">
                      {application?.applicationId || user?.applicationId || 'Not assigned'}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={copyApplicationId}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                {/* Status */}
                <div className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border',
                  statusConfig.bg,
                  statusConfig.border
                )}>
                  <div className={cn('p-3 rounded-full', statusConfig.bg)}>
                    <StatusIcon className={cn('h-6 w-6', statusConfig.color)} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Status</p>
                    <p className={cn('font-semibold text-lg', statusConfig.color)}>
                      {statusConfig.label}
                    </p>
                  </div>
                </div>

                {/* Progress or Action */}
                {application?.status === 'in_progress' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Completion Progress</span>
                      <span className="text-sm text-muted-foreground">
                        Step {application.currentStep} of 5
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-primary transition-all duration-500"
                        style={{ width: `${(application.currentStep / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-2">
                  {application?.status === 'approved' ? (
                    <Button variant="success" className="w-full gap-2">
                      <CheckCircle className="h-4 w-4" />
                      KYC Completed
                    </Button>
                  ) : application?.status === 'rejected' ? (
                    <Link to="/kyc" className="block">
                      <Button className="w-full gap-2">
                        Start New Application
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/kyc" className="block">
                      <Button className="w-full gap-2">
                        {application?.currentStep && application.currentStep > 1
                          ? 'Continue KYC'
                          : 'Start KYC Process'}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Profile Card */}
            <Card className="border-0 shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-4 w-4 text-primary" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium truncate">{user?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Mobile</p>
                  <p className="text-sm font-medium">{user?.mobile}</p>
                </div>
              </CardContent>
            </Card>

            {/* Documents Card */}
            <Card className="border-0 shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileCheck className="h-4 w-4 text-primary" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {application?.documents && application.documents.length > 0 ? (
                    application.documents.map((doc) => (
                      <div
                        key={doc.type}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="capitalize">{doc.type.replace('_', ' ')}</span>
                        {doc.status === 'uploaded' ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="border-0 shadow-card bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground mb-1">Need Help?</p>
                    <p className="text-sm text-muted-foreground">
                      Contact our support team for any assistance with your KYC process.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
