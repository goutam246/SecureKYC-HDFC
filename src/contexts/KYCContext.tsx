import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { KYCApplication, PersonalDetails, Document, DocumentType, KYCStatus } from '@/types/kyc';
import { kycAPI, uploadAPI } from '@/lib/api';
import { useAuth } from './AuthContext';

interface KYCContextType {
  application: KYCApplication | null;
  isLoading: boolean;
  error: string | null;
  initializeApplication: (userId: string, email: string, mobile: string) => Promise<void>;
  updatePersonalDetails: (details: PersonalDetails) => Promise<void>;
  addDocument: (type: DocumentType) => void;
  updateDocument: (type: DocumentType, file: File, previewUrl: string) => Promise<boolean>;
  updateDocumentNumber: (type: DocumentType, documentNumber: string) => void;
  updatePhoto: (file: File, previewUrl: string) => Promise<boolean>;
  updateSelfie: (file: File, previewUrl: string) => Promise<boolean>;
  setCurrentStep: (step: number) => Promise<void>;
  submitForVerification: () => Promise<{ success: boolean; status: KYCStatus; reason?: string }>;
  resetApplication: () => void;
  getAttempts: (type: 'document' | 'photo' | 'selfie', docType?: DocumentType) => number;
  refreshApplication: () => Promise<void>;
}

const KYCContext = createContext<KYCContextType | undefined>(undefined);

// Helper to convert API response to KYCApplication format
const mapApiResponseToApplication = (apiData: any, email: string, mobile: string): KYCApplication => {
  return {
    applicationId: apiData.applicationId,
    userId: apiData.userId,
    status: apiData.status as KYCStatus,
    currentStep: apiData.currentStep,
    personalDetails: {
      fullName: apiData.personalDetails?.fullName || '',
      dateOfBirth: apiData.personalDetails?.dateOfBirth || '',
      mobile: mobile,
      email: email,
      address: apiData.personalDetails?.address,
      gender: apiData.personalDetails?.gender,
      aadhaarNumber: apiData.personalDetails?.aadhaarNumber,
      panNumber: apiData.personalDetails?.panNumber,
      passportNumber: apiData.personalDetails?.passportNumber,
      voterIdNumber: apiData.personalDetails?.voterIdNumber,
    },
    documents: apiData.documents || [],
    photo: apiData.photo ? {
      previewUrl: apiData.photo.filePath,
      status: apiData.photo.status,
      attempts: apiData.photo.attempts,
    } : undefined,
    selfie: apiData.selfie ? {
      previewUrl: apiData.selfie.filePath,
      status: apiData.selfie.status,
      attempts: apiData.selfie.attempts,
      faceMatchScore: apiData.selfie.faceMatchScore,
    } : undefined,
    rejectionReason: apiData.rejectionReason,
    createdAt: apiData.createdAt,
    updatedAt: apiData.updatedAt,
  };
};

export const KYCProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [application, setApplication] = useState<KYCApplication | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshApplication = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await kycAPI.getApplication(user.id);
      if (response.success && response.application) {
        const mappedApp = mapApiResponseToApplication(response.application, user.email, user.mobile);
        setApplication(mappedApp);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to refresh application:', err);
      setError(err instanceof Error ? err.message : 'Failed to load application');
    }
  }, [user]);

  const initializeApplication = useCallback(async (userId: string, email: string, mobile: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await kycAPI.getApplication(userId);
      if (response.success && response.application) {
        const mappedApp = mapApiResponseToApplication(response.application, email, mobile);
        setApplication(mappedApp);
      } else {
        // Application doesn't exist yet (should be created during registration)
        // For now, create a local state representation
        setApplication({
          applicationId: user?.applicationId || '',
          userId,
          status: 'in_progress',
          currentStep: 1,
          documents: [],
          personalDetails: {
            fullName: '',
            dateOfBirth: '',
            mobile,
            email,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Failed to initialize application:', err);
      setError(err instanceof Error ? err.message : 'Failed to load application');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updatePersonalDetails = useCallback(async (details: PersonalDetails) => {
    if (!user?.id) return;

    try {
      await kycAPI.updatePersonalDetails(user.id, {
        fullName: details.fullName,
        dateOfBirth: details.dateOfBirth,
        address: details.address,
        gender: details.gender,
        aadhaarNumber: details.aadhaarNumber,
        panNumber: details.panNumber,
        passportNumber: details.passportNumber,
        voterIdNumber: details.voterIdNumber,
      });

      // Update local state
      setApplication(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          personalDetails: details,
          updatedAt: new Date().toISOString(),
        };
      });
    } catch (err) {
      console.error('Failed to update personal details:', err);
      setError(err instanceof Error ? err.message : 'Failed to update personal details');
      throw err;
    }
  }, [user]);

  const addDocument = useCallback((type: DocumentType) => {
    setApplication(prev => {
      if (!prev) return prev;
      const existingDoc = prev.documents.find(d => d.type === type);
      if (existingDoc) return prev;
      
      return {
        ...prev,
        documents: [...prev.documents, {
          type,
          status: 'pending',
          attempts: 0,
        }],
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const updateDocument = useCallback(async (type: DocumentType, file: File, previewUrl: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const response = await uploadAPI.uploadDocument(user.id, type, file);
      
      if (response.success) {
        // Update local state
        setApplication(prev => {
          if (!prev) return false;
          
          const docIndex = prev.documents.findIndex(d => d.type === type);
          if (docIndex === -1) {
            prev.documents.push({
              type,
              previewUrl: response.previewUrl || previewUrl,
              status: 'uploaded',
              attempts: response.attempts || 1,
            });
          } else {
            prev.documents[docIndex] = {
              ...prev.documents[docIndex],
              previewUrl: response.previewUrl || previewUrl,
              status: 'uploaded',
              attempts: response.attempts || prev.documents[docIndex].attempts + 1,
            };
          }
          
          return {
            ...prev,
            documents: [...prev.documents],
            updatedAt: new Date().toISOString(),
          };
        });
        
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to upload document:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload document');
      return false;
    }
  }, [user]);

  const updateDocumentNumber = useCallback((type: DocumentType, documentNumber: string) => {
    setApplication(prev => {
      if (!prev) return prev;
      
      const docIndex = prev.documents.findIndex(d => d.type === type);
      if (docIndex === -1) {
        // Document doesn't exist yet, create it
        prev.documents.push({
          type,
          status: 'pending',
          attempts: 0,
          documentNumber,
        });
      } else {
        // Update existing document
        prev.documents[docIndex] = {
          ...prev.documents[docIndex],
          documentNumber,
        };
      }
      
      return {
        ...prev,
        documents: [...prev.documents],
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const updatePhoto = useCallback(async (file: File, previewUrl: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const response = await uploadAPI.uploadPhoto(user.id, 'photo', file);
      
      if (response.success) {
        setApplication(prev => {
          if (!prev) return false;
          return {
            ...prev,
            photo: {
              previewUrl: response.previewUrl || previewUrl,
              status: 'uploaded',
              attempts: response.attempts || (prev.photo?.attempts || 0) + 1,
            },
            updatedAt: new Date().toISOString(),
          };
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to upload photo:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload photo');
      return false;
    }
  }, [user]);

  const updateSelfie = useCallback(async (file: File, previewUrl: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const response = await uploadAPI.uploadPhoto(user.id, 'selfie', file);
      
      if (response.success) {
        setApplication(prev => {
          if (!prev) return false;
          return {
            ...prev,
            selfie: {
              previewUrl: response.previewUrl || previewUrl,
              status: 'uploaded',
              attempts: response.attempts || (prev.selfie?.attempts || 0) + 1,
            },
            updatedAt: new Date().toISOString(),
          };
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to upload selfie:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload selfie');
      return false;
    }
  }, [user]);

  const setCurrentStep = useCallback(async (step: number) => {
    if (!user?.id) return;

    try {
      await kycAPI.updateStep(user.id, step);
      
      setApplication(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          currentStep: step,
          updatedAt: new Date().toISOString(),
        };
      });
    } catch (err) {
      console.error('Failed to update step:', err);
    }
  }, [user]);

  const submitForVerification = useCallback(async (): Promise<{ success: boolean; status: KYCStatus; reason?: string }> => {
    if (!user?.id) {
      return { success: false, status: 'rejected', reason: 'User not found' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await kycAPI.submitForVerification(user.id);
      
      if (response.success) {
        // Refresh application to get updated status
        await refreshApplication();
        setIsLoading(false);
        return { success: true, status: response.status as KYCStatus };
      } else {
        await refreshApplication();
        setIsLoading(false);
        return { 
          success: false, 
          status: response.status as KYCStatus, 
          reason: response.reason 
        };
      }
    } catch (err) {
      setIsLoading(false);
      const errorMsg = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMsg);
      return { success: false, status: 'rejected', reason: errorMsg };
    }
  }, [user, refreshApplication]);

  const resetApplication = useCallback(() => {
    setApplication(null);
    setError(null);
  }, []);

  const getAttempts = useCallback((type: 'document' | 'photo' | 'selfie', docType?: DocumentType): number => {
    if (!application) return 0;
    
    if (type === 'document' && docType) {
      const doc = application.documents.find(d => d.type === docType);
      return doc?.attempts || 0;
    }
    if (type === 'photo') return application.photo?.attempts || 0;
    if (type === 'selfie') return application.selfie?.attempts || 0;
    return 0;
  }, [application]);

  return (
    <KYCContext.Provider
      value={{
        application,
        isLoading,
        error,
        initializeApplication,
        updatePersonalDetails,
        addDocument,
        updateDocument,
        updateDocumentNumber,
        updatePhoto,
        updateSelfie,
        setCurrentStep,
        submitForVerification,
        resetApplication,
        getAttempts,
        refreshApplication,
      }}
    >
      {children}
    </KYCContext.Provider>
  );
};

export const useKYC = () => {
  const context = useContext(KYCContext);
  if (context === undefined) {
    throw new Error('useKYC must be used within a KYCProvider');
  }
  return context;
};
