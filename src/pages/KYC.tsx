import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { ProgressStepper } from '@/components/kyc/ProgressStepper';
import { PersonalDetailsStep } from '@/components/kyc/steps/PersonalDetailsStep';
import { DocumentScanStep } from '@/components/kyc/steps/DocumentScanStep';
import { DocumentUploadStep } from '@/components/kyc/steps/DocumentUploadStep';
import { PhotoSelfieStep } from '@/components/kyc/steps/PhotoSelfieStep';
import { VerificationStep } from '@/components/kyc/steps/VerificationStep';
import { FinalStatusStep } from '@/components/kyc/steps/FinalStatusStep';
import { useAuth } from '@/contexts/AuthContext';
import { useKYC } from '@/contexts/KYCContext';
import { DocumentType } from '@/types/kyc';

const steps = [
  { id: 1, title: 'Personal Details', description: 'Basic information' },
  { id: 2, title: 'Scan Documents', description: 'Capture your IDs' },
  { id: 3, title: 'Upload Documents', description: 'Confirm & upload' },
  { id: 4, title: 'Photo & Selfie', description: 'Identity verification' },
  { id: 5, title: 'Verification', description: 'Final checks' },
];

const KYC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { application, initializeApplication, setCurrentStep } = useKYC();

  const [currentStepIndex, setCurrentStepIndex] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<DocumentType[]>(['aadhaar', 'pan']);
  const [showFinalStatus, setShowFinalStatus] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    // Initialize or restore KYC application
    if (user && !application) {
      initializeApplication(user.id, user.email, user.mobile);
    } else if (application) {
      setCurrentStepIndex(application.currentStep);
      // Restore completed steps
      const completed: number[] = [];
      if (application.personalDetails?.fullName) completed.push(1);
      if (application.documents.some(d => d.status === 'uploaded')) completed.push(2);
      if (application.documents.length >= 2) completed.push(3);
      // Step 4 is complete if either passport photo OR selfie is uploaded
      if (application.photo?.status === 'uploaded' || application.selfie?.status === 'uploaded') completed.push(4);
      setCompletedSteps(completed);
      
      // Restore selected documents
      const docs = application.documents.map(d => d.type);
      if (docs.length > 0) {
        const uniqueDocs = [...new Set(['aadhaar', 'pan', ...docs])] as DocumentType[];
        setSelectedDocuments(uniqueDocs);
      }

      // Check if already completed
      if (application.status === 'approved' || application.status === 'rejected') {
        setShowFinalStatus(true);
      }
    }
  }, [user, application, initializeApplication]);

  const handleStepComplete = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps(prev => [...prev, step]);
    }
    
    const nextStep = step + 1;
    setCurrentStepIndex(nextStep);
    setCurrentStep(nextStep);
  };

  const handleBack = () => {
    const prevStep = currentStepIndex - 1;
    if (prevStep >= 1) {
      setCurrentStepIndex(prevStep);
      setCurrentStep(prevStep);
    }
  };

  const handleVerificationComplete = (success: boolean) => {
    setCompletedSteps(prev => [...prev, 5]);
    setShowFinalStatus(true);
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  if (showFinalStatus) {
    return (
      <Layout>
        <div className="container py-8 md:py-12">
          <FinalStatusStep />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        {/* Progress Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              Complete Your KYC
            </h1>
            <p className="text-muted-foreground">
              Application ID:{' '}
              <span className="font-mono font-semibold text-primary">
                {application?.applicationId || user?.applicationId}
              </span>
            </p>
          </div>
          
          <ProgressStepper
            steps={steps}
            currentStep={currentStepIndex}
            completedSteps={completedSteps}
          />
        </motion.div>

        {/* Step Content */}
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {currentStepIndex === 1 && (
              <PersonalDetailsStep
                key="step-1"
                onNext={() => handleStepComplete(1)}
                selectedDocuments={selectedDocuments}
                setSelectedDocuments={setSelectedDocuments}
              />
            )}
            
            {currentStepIndex === 2 && (
              <DocumentScanStep
                key="step-2"
                onNext={() => handleStepComplete(2)}
                onBack={handleBack}
                selectedDocuments={selectedDocuments}
              />
            )}
            
            {currentStepIndex === 3 && (
              <DocumentUploadStep
                key="step-3"
                onNext={() => handleStepComplete(3)}
                onBack={handleBack}
                selectedDocuments={selectedDocuments}
              />
            )}
            
            {currentStepIndex === 4 && (
              <PhotoSelfieStep
                key="step-4"
                onNext={() => handleStepComplete(4)}
                onBack={handleBack}
              />
            )}
            
            {currentStepIndex === 5 && (
              <VerificationStep
                key="step-5"
                onComplete={handleVerificationComplete}
                onBack={handleBack}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default KYC;
