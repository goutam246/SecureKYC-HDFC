import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useKYC } from '@/contexts/KYCContext';
import { DocumentType } from '@/types/kyc';
import { FileCheck, ArrowRight, ArrowLeft, CheckCircle, Upload, Loader2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploadStepProps {
  onNext: () => void;
  onBack: () => void;
  selectedDocuments: DocumentType[];
}

const documentLabels: Record<DocumentType, string> = {
  aadhaar: 'Aadhaar Card',
  pan: 'PAN Card',
  passport: 'Passport',
  voter_id: 'Voter ID',
};

export const DocumentUploadStep = ({ onNext, onBack, selectedDocuments }: DocumentUploadStepProps) => {
  const { application, updateDocumentNumber } = useKYC();
  const { toast } = useToast();
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<Set<DocumentType>>(new Set());
  const [documentNumbers, setDocumentNumbers] = useState<Record<DocumentType, string>>({
    aadhaar: '',
    pan: '',
    passport: '',
    voter_id: '',
  });

  // Sync document numbers from application state
  useEffect(() => {
    if (application?.documents) {
      const numbers: Record<DocumentType, string> = {
        aadhaar: application.documents.find(d => d.type === 'aadhaar')?.documentNumber || '',
        pan: application.documents.find(d => d.type === 'pan')?.documentNumber || '',
        passport: application.documents.find(d => d.type === 'passport')?.documentNumber || '',
        voter_id: application.documents.find(d => d.type === 'voter_id')?.documentNumber || '',
      };
      setDocumentNumbers(numbers);
    }
  }, [application]);

  const simulateUpload = async (docType: DocumentType) => {
    setIsUploading(true);
    
    // Simulate server processing (10-15 seconds as per requirements < 20sec)
    await new Promise(resolve => setTimeout(resolve, 10000 + Math.random() * 5000));
    
    setUploadedDocs(prev => new Set([...prev, docType]));
    setIsUploading(false);
    
    toast({
      title: 'Document Uploaded',
      description: `${documentLabels[docType]} has been successfully uploaded for verification.`,
    });
  };

  const handleDocumentNumberChange = (docType: DocumentType, value: string) => {
    setDocumentNumbers(prev => ({ ...prev, [docType]: value }));
    // Update document number in context
    if (updateDocumentNumber) {
      updateDocumentNumber(docType, value);
    }
  };

  const getDocumentNumberPlaceholder = (docType: DocumentType): string => {
    switch (docType) {
      case 'aadhaar':
        return 'Enter 12-digit Aadhaar number';
      case 'pan':
        return 'Enter 10-character PAN';
      case 'passport':
        return 'Enter passport number';
      case 'voter_id':
        return 'Enter voter ID number';
      default:
        return 'Enter document number';
    }
  };

  const formatDocumentNumber = (docType: DocumentType, value: string): string => {
    switch (docType) {
      case 'aadhaar':
        return value.replace(/\D/g, '').slice(0, 12);
      case 'pan':
        return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
      case 'passport':
      case 'voter_id':
        return value.toUpperCase();
      default:
        return value;
    }
  };

  const handleConfirmAll = async () => {
    const docsToUpload = selectedDocuments.filter(d => !uploadedDocs.has(d));
    
    for (const doc of docsToUpload) {
      await simulateUpload(doc);
    }
    
    onNext();
  };

  const allConfirmed = selectedDocuments.every(d => uploadedDocs.has(d));

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
            <FileCheck className="h-6 w-6 text-primary" />
            Confirm Documents
          </CardTitle>
          <CardDescription>
            Review and confirm your scanned documents for upload
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Document List */}
          <div className="space-y-3">
            {selectedDocuments.map((docType) => {
              const doc = application?.documents.find(d => d.type === docType);
              const isUploaded = uploadedDocs.has(docType);
              
              return (
                <div
                  key={docType}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-xl border transition-all',
                    isUploaded
                      ? 'bg-success/5 border-success/20'
                      : 'bg-card border-border'
                  )}
                >
                  {/* Preview Thumbnail */}
                  <div className="w-20 h-14 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {doc?.previewUrl ? (
                      <img
                        src={doc.previewUrl}
                        alt={documentLabels[docType]}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileCheck className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  {/* Document Info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <p className="font-medium text-foreground">
                        {documentLabels[docType]}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {doc?.status === 'uploaded' ? 'Scanned' : 'Pending scan'}
                      </p>
                    </div>
                    {/* Document Number Input */}
                    <div className="space-y-1">
                      <Label htmlFor={`doc-number-${docType}`} className="text-xs text-muted-foreground flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Document Number (Optional)
                      </Label>
                      <Input
                        id={`doc-number-${docType}`}
                        placeholder={getDocumentNumberPlaceholder(docType)}
                        value={documentNumbers[docType] || ''}
                        onChange={(e) => handleDocumentNumberChange(docType, formatDocumentNumber(docType, e.target.value))}
                        className="h-8 text-sm"
                        maxLength={docType === 'aadhaar' ? 12 : docType === 'pan' ? 10 : undefined}
                      />
                    </div>
                  </div>
                  
                  {/* Status */}
                  <div className="flex-shrink-0">
                    {isUploaded ? (
                      <div className="flex items-center gap-2 text-success">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-sm font-medium hidden sm:inline">Uploaded</span>
                      </div>
                    ) : doc?.status === 'uploaded' ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => simulateUpload(docType)}
                        disabled={isUploading}
                        className="gap-2"
                      >
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        <span className="hidden sm:inline">Confirm</span>
                      </Button>
                    ) : (
                      <span className="text-sm text-muted-foreground">Not scanned</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <div>
                  <p className="font-medium text-foreground">Uploading to secure server...</p>
                  <p className="text-sm text-muted-foreground">
                    This may take up to 20 seconds. Please don't close this page.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Info Notice */}
          <div className="p-4 bg-muted rounded-xl">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Note:</strong> Your documents will be securely transmitted and stored in compliance with data protection regulations.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t border-border">
            <Button variant="outline" onClick={onBack} className="gap-2" disabled={isUploading}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            {allConfirmed ? (
              <Button onClick={onNext} className="gap-2">
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleConfirmAll}
                disabled={isUploading}
                className="gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Confirm All & Continue
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
