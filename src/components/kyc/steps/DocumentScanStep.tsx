import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useKYC } from '@/contexts/KYCContext';
import { DocumentType } from '@/types/kyc';
import { Scan, Upload, Camera, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface DocumentScanStepProps {
  onNext: () => void;
  onBack: () => void;
  selectedDocuments: DocumentType[];
}

const MAX_ATTEMPTS = 3;

const documentLabels: Record<DocumentType, string> = {
  aadhaar: 'Aadhaar Card',
  pan: 'PAN Card',
  passport: 'Passport',
  voter_id: 'Voter ID',
};

export const DocumentScanStep = ({ onNext, onBack, selectedDocuments }: DocumentScanStepProps) => {
  const { application, updateDocument, getAttempts } = useKYC();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentDocIndex, setCurrentDocIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<'success' | 'blurry' | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const currentDoc = selectedDocuments[currentDocIndex];
  const attempts = getAttempts('document', currentDoc);
  const canRetry = attempts < MAX_ATTEMPTS;

  const simulateScan = useCallback(async (file: File) => {
    setIsScanning(true);
    setScanResult(null);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Simulate scan processing (2-4 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
    
    // Simulate edge detection and quality check (85% success rate)
    const isQualityGood = Math.random() > 0.15;
    
    setIsScanning(false);
    setScanResult(isQualityGood ? 'success' : 'blurry');
    
    if (isQualityGood) {
      try {
        const success = await updateDocument(currentDoc, file, url);
        if (!success) {
          toast({
            title: 'Maximum attempts reached',
            description: 'You have exceeded the maximum number of attempts for this document.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Document uploaded',
            description: 'Your document has been uploaded successfully.',
          });
        }
      } catch (error) {
        toast({
          title: 'Upload failed',
          description: error instanceof Error ? error.message : 'Failed to upload document',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Image Quality Issue',
        description: 'The image appears blurry. Please try again with better lighting.',
        variant: 'destructive',
      });
    }
  }, [currentDoc, updateDocument, toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an image file (JPG, PNG)',
          variant: 'destructive',
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload an image smaller than 5MB',
          variant: 'destructive',
        });
        return;
      }
      
      simulateScan(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSimulateLiveScan = () => {
    // Create a fake file for simulation
    const fakeFile = new File([''], 'scan.jpg', { type: 'image/jpeg' });
    simulateScan(fakeFile);
  };

  const handleNextDocument = () => {
    if (currentDocIndex < selectedDocuments.length - 1) {
      setCurrentDocIndex(prev => prev + 1);
      setScanResult(null);
      setPreviewUrl(null);
    } else {
      onNext();
    }
  };

  const handleReset = () => {
    setScanResult(null);
    setPreviewUrl(null);
  };

  const isDocumentUploaded = (docType: DocumentType) => {
    return application?.documents.some(d => d.type === docType && d.status === 'uploaded');
  };

  const allDocumentsScanned = selectedDocuments.every(d => isDocumentUploaded(d));

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
            <Scan className="h-6 w-6 text-primary" />
            Scan Documents
          </CardTitle>
          <CardDescription>
            Upload or scan your documents for verification. Ensure images are clear and well-lit.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Document Progress */}
          <div className="flex gap-2 flex-wrap">
            {selectedDocuments.map((doc, index) => {
              const uploaded = isDocumentUploaded(doc);
              return (
                <button
                  key={doc}
                  onClick={() => {
                    setCurrentDocIndex(index);
                    setScanResult(null);
                    setPreviewUrl(null);
                  }}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                    index === currentDocIndex
                      ? 'bg-primary text-primary-foreground'
                      : uploaded
                      ? 'bg-success/10 text-success border border-success/20'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {uploaded ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span className="h-4 w-4 rounded-full border-2 border-current" />
                  )}
                  {documentLabels[doc]}
                </button>
              );
            })}
          </div>

          {/* Current Document Scanner */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-lg">
                {documentLabels[currentDoc]}
              </h3>
              <span className="text-sm text-muted-foreground">
                Attempts: {attempts}/{MAX_ATTEMPTS}
              </span>
            </div>

            {/* Scan Area */}
            <div
              className={cn(
                'relative border-2 border-dashed rounded-xl p-8 text-center transition-all',
                isScanning && 'border-primary bg-primary/5',
                scanResult === 'success' && 'border-success bg-success/5',
                scanResult === 'blurry' && 'border-destructive bg-destructive/5',
                !isScanning && !scanResult && 'border-border hover:border-primary/50'
              )}
            >
              {previewUrl && !isScanning ? (
                <div className="space-y-4">
                  <img
                    src={previewUrl}
                    alt="Document preview"
                    className="max-h-48 mx-auto rounded-lg shadow-md"
                  />
                  
                  {scanResult === 'success' && (
                    <div className="flex items-center justify-center gap-2 text-success">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Document scanned successfully</span>
                    </div>
                  )}
                  
                  {scanResult === 'blurry' && canRetry && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-medium">Image appears blurry</span>
                      </div>
                      <Button variant="outline" onClick={handleReset} className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                      </Button>
                    </div>
                  )}
                </div>
              ) : isScanning ? (
                <div className="space-y-4 py-8">
                  <div className="relative mx-auto w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Scanning document...</p>
                    <p className="text-sm text-muted-foreground">Performing edge detection and quality check</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Upload document image</p>
                    <p className="text-sm text-muted-foreground">
                      JPG or PNG, max 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {!isScanning && scanResult !== 'success' && canRetry && (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Upload Image
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1 gap-2"
                  onClick={handleSimulateLiveScan}
                >
                  <Camera className="h-4 w-4" />
                  Simulate Live Scan
                </Button>
              </div>
            )}
            
            {!canRetry && !isDocumentUploaded(currentDoc) && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">
                  Maximum attempts reached for this document. Please contact support for assistance.
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t border-border">
            <Button variant="outline" onClick={onBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            {scanResult === 'success' || isDocumentUploaded(currentDoc) ? (
              <Button onClick={handleNextDocument} className="gap-2">
                {currentDocIndex < selectedDocuments.length - 1 ? 'Next Document' : 'Continue'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : allDocumentsScanned ? (
              <Button onClick={onNext} className="gap-2">
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
