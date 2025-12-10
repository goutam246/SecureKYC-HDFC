import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useKYC } from '@/contexts/KYCContext';
import { Camera, Upload, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, RefreshCw, User, ScanFace } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface PhotoSelfieStepProps {
  onNext: () => void;
  onBack: () => void;
}

const MAX_ATTEMPTS = 3;

export const PhotoSelfieStep = ({ onNext, onBack }: PhotoSelfieStepProps) => {
  const { application, updatePhoto, updateSelfie, getAttempts } = useKYC();
  const { toast } = useToast();
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);
  
  const [photoPreview, setPhotoPreview] = useState<string | null>(application?.photo?.previewUrl || null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(application?.selfie?.previewUrl || null);
  const [isProcessing, setIsProcessing] = useState<'photo' | 'selfie' | null>(null);

  const photoAttempts = getAttempts('photo');
  const selfieAttempts = getAttempts('selfie');
  
  const canRetryPhoto = photoAttempts < MAX_ATTEMPTS;
  const canRetrySelfie = selfieAttempts < MAX_ATTEMPTS;

  const photoUploaded = application?.photo?.status === 'uploaded';
  const selfieUploaded = application?.selfie?.status === 'uploaded';

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file (JPG, PNG)',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing('photo');
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const success = await updatePhoto(file, url);
      setIsProcessing(null);
      
      if (!success) {
        toast({
          title: 'Maximum attempts reached',
          description: 'You have exceeded the maximum number of attempts for photo upload.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Photo uploaded',
          description: 'Your passport photo has been uploaded successfully.',
        });
      }
    } catch (error) {
      setIsProcessing(null);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload photo',
        variant: 'destructive',
      });
    }
    
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const handleSelfieCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file (JPG, PNG)',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing('selfie');
    const url = URL.createObjectURL(file);
    setSelfiePreview(url);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const success = await updateSelfie(file, url);
      setIsProcessing(null);
      
      if (!success) {
        toast({
          title: 'Maximum attempts reached',
          description: 'You have exceeded the maximum number of attempts for selfie capture.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Selfie captured',
          description: 'Your live selfie has been captured successfully.',
        });
      }
    } catch (error) {
      setIsProcessing(null);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload selfie',
        variant: 'destructive',
      });
    }
    
    if (selfieInputRef.current) selfieInputRef.current.value = '';
  };

  const simulateLiveSelfie = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast({
        title: 'Camera not available',
        description: 'Your browser does not support live capture. Please upload a photo instead.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing('selfie');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      await new Promise(resolve => {
        video.onloadedmetadata = () => resolve(null);
      });

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Camera capture failed');

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Stop the camera stream once we have the frame
      stream.getTracks().forEach(track => track.stop());

      const blob: Blob | null = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
      if (!blob) throw new Error('Unable to capture image');

      const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      setSelfiePreview(url);

      const success = await updateSelfie(file, url);
      setIsProcessing(null);

      if (!success) {
        toast({
          title: 'Maximum attempts reached',
          description: 'You have exceeded the maximum number of attempts for selfie capture.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Selfie captured',
          description: 'Your live selfie has been captured successfully.',
        });
      }
    } catch (error) {
      setIsProcessing(null);
      // Ensure camera is released on error as well
      if (error instanceof Error) {
        toast({
          title: 'Camera error',
          description: error.message || 'Failed to capture from camera',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Camera error',
          description: 'Failed to capture from camera',
          variant: 'destructive',
        });
      }
    }
  };

  const canProceed = photoUploaded || selfieUploaded;

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
            <Camera className="h-6 w-6 text-primary" />
            Photo & Selfie Verification
          </CardTitle>
          <CardDescription>
            Upload a passport photo or take a live selfie. Only one is required to proceed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Passport Photo */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <h3 className="font-display font-semibold">Passport Photo</h3>
                </div>
                <span className="text-sm text-muted-foreground">
                  {photoAttempts}/{MAX_ATTEMPTS}
                </span>
              </div>

              <div
                className={cn(
                  'relative aspect-[3/4] border-2 border-dashed rounded-xl overflow-hidden transition-all',
                  photoUploaded ? 'border-success bg-success/5' : 'border-border',
                  isProcessing === 'photo' && 'border-primary bg-primary/5'
                )}
              >
                {photoPreview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={photoPreview}
                      alt="Passport photo"
                      className="w-full h-full object-cover"
                    />
                    {photoUploaded && (
                      <div className="absolute top-2 right-2 bg-success text-success-foreground p-1.5 rounded-full">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ) : isProcessing === 'photo' ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <p className="mt-4 text-sm text-muted-foreground">Processing...</p>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Upload a recent passport-size photograph
                    </p>
                  </div>
                )}
              </div>

              {(!photoUploaded || (photoUploaded && canRetryPhoto)) && (
                <Button
                  variant={photoUploaded ? 'outline' : 'default'}
                  onClick={() => photoInputRef.current?.click()}
                  disabled={isProcessing !== null || !canRetryPhoto}
                  className="w-full gap-2"
                >
                  {photoUploaded ? (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Re-upload Photo
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload Photo
                    </>
                  )}
                </Button>
              )}
              
              {!canRetryPhoto && !photoUploaded && (
                <p className="text-sm text-destructive text-center">
                  Maximum attempts reached
                </p>
              )}

              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </div>

            {/* Live Selfie */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ScanFace className="h-5 w-5 text-primary" />
                  <h3 className="font-display font-semibold">Live Selfie</h3>
                </div>
                <span className="text-sm text-muted-foreground">
                  {selfieAttempts}/{MAX_ATTEMPTS}
                </span>
              </div>

              <div
                className={cn(
                  'relative aspect-[3/4] border-2 border-dashed rounded-xl overflow-hidden transition-all',
                  selfieUploaded ? 'border-success bg-success/5' : 'border-border',
                  isProcessing === 'selfie' && 'border-primary bg-primary/5'
                )}
              >
                {selfiePreview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={selfiePreview}
                      alt="Selfie"
                      className="w-full h-full object-cover"
                    />
                    {selfieUploaded && (
                      <div className="absolute top-2 right-2 bg-success text-success-foreground p-1.5 rounded-full">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ) : isProcessing === 'selfie' ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <p className="mt-4 text-sm text-muted-foreground">Capturing...</p>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <ScanFace className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Take a live selfie for face verification
                    </p>
                  </div>
                )}
              </div>

              {(!selfieUploaded || (selfieUploaded && canRetrySelfie)) && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => selfieInputRef.current?.click()}
                    disabled={isProcessing !== null || !canRetrySelfie}
                    className="flex-1 gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload
                  </Button>
                  <Button
                    variant={selfieUploaded ? 'outline' : 'default'}
                    onClick={simulateLiveSelfie}
                    disabled={isProcessing !== null || !canRetrySelfie}
                    className="flex-1 gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    Live Capture
                  </Button>
                </div>
              )}
              
              {!canRetrySelfie && !selfieUploaded && (
                <p className="text-sm text-destructive text-center">
                  Maximum attempts reached
                </p>
              )}

              <input
                ref={selfieInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleSelfieCapture}
                className="hidden"
              />
            </div>
          </div>

          {/* Info Notice */}
          <div className="p-4 bg-muted rounded-xl">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Face Verification:</strong> Your selfie will be matched against your passport photo. Ensure good lighting and face the camera directly.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t border-border">
            <Button variant="outline" onClick={onBack} className="gap-2" disabled={isProcessing !== null}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            <Button
              onClick={onNext}
              disabled={!canProceed || isProcessing !== null}
              className="gap-2"
            >
              Continue to Verification
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
