import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useKYC } from '@/contexts/KYCContext';
import { PersonalDetails, DocumentType } from '@/types/kyc';
import { User, Calendar, Phone, Mail, MapPin, FileText, ArrowRight } from 'lucide-react';

interface PersonalDetailsStepProps {
  onNext: () => void;
  selectedDocuments: DocumentType[];
  setSelectedDocuments: (docs: DocumentType[]) => void;
}

export const PersonalDetailsStep = ({ onNext, selectedDocuments, setSelectedDocuments }: PersonalDetailsStepProps) => {
  const { application, updatePersonalDetails, addDocument } = useKYC();
  
  const [formData, setFormData] = useState<PersonalDetails>({
    fullName: application?.personalDetails?.fullName || '',
    dateOfBirth: application?.personalDetails?.dateOfBirth || '',
    mobile: application?.personalDetails?.mobile || '',
    email: application?.personalDetails?.email || '',
    address: application?.personalDetails?.address || '',
    gender: application?.personalDetails?.gender,
    aadhaarNumber: application?.personalDetails?.aadhaarNumber || '',
    panNumber: application?.personalDetails?.panNumber || '',
    passportNumber: application?.personalDetails?.passportNumber || '',
    voterIdNumber: application?.personalDetails?.voterIdNumber || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PersonalDetails, string>>>({});
  const [additionalDoc, setAdditionalDoc] = useState<DocumentType | ''>('');

  const documentTypes: { value: DocumentType; label: string }[] = [
    { value: 'passport', label: 'Passport' },
    { value: 'voter_id', label: 'Voter ID' },
  ];

  const handleInputChange = (field: keyof PersonalDetails, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleDocumentAdd = (docType: DocumentType) => {
    if (!selectedDocuments.includes(docType)) {
      setSelectedDocuments([...selectedDocuments, docType]);
      addDocument(docType);
    }
    setAdditionalDoc('');
  };

  const removeDocument = (docType: DocumentType) => {
    if (docType !== 'aadhaar' && docType !== 'pan') {
      setSelectedDocuments(selectedDocuments.filter(d => d !== docType));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof PersonalDetails, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 18) {
        newErrors.dateOfBirth = 'You must be at least 18 years old';
      }
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      updatePersonalDetails(formData);
      // Ensure mandatory documents are added
      if (!selectedDocuments.includes('aadhaar')) {
        addDocument('aadhaar');
        setSelectedDocuments([...selectedDocuments, 'aadhaar']);
      }
      if (!selectedDocuments.includes('pan')) {
        addDocument('pan');
        setSelectedDocuments([...selectedDocuments, 'pan']);
      }
      onNext();
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
            <User className="h-6 w-6 text-primary" />
            Personal Details
          </CardTitle>
          <CardDescription>
            Please provide your personal information and select documents for verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={errors.fullName ? 'border-destructive' : ''}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Date of Birth *
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className={errors.dateOfBirth ? 'border-destructive' : ''}
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.dateOfBirth && (
                  <p className="text-sm text-destructive">{errors.dateOfBirth}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Mobile Number *
                </Label>
                <Input
                  id="mobile"
                  placeholder="10-digit mobile number"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className={errors.mobile ? 'border-destructive' : ''}
                />
                {errors.mobile && (
                  <p className="text-sm text-destructive">{errors.mobile}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Address (Optional)
                </Label>
                <Input
                  id="address"
                  placeholder="Enter your address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender (Optional)</Label>
                <Select
                  value={formData.gender || ''}
                  onValueChange={(value) => handleInputChange('gender', value as PersonalDetails['gender'])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Document Numbers Section */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-display font-semibold text-lg">Document Numbers (Optional)</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                You can manually enter your document numbers. These are optional and can be entered later.
              </p>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="aadhaarNumber" className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Aadhaar Number (Optional)
                  </Label>
                  <Input
                    id="aadhaarNumber"
                    placeholder="Enter 12-digit Aadhaar number"
                    value={formData.aadhaarNumber || ''}
                    onChange={(e) => handleInputChange('aadhaarNumber', e.target.value.replace(/\D/g, '').slice(0, 12))}
                    maxLength={12}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="panNumber" className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    PAN Number (Optional)
                  </Label>
                  <Input
                    id="panNumber"
                    placeholder="Enter 10-character PAN"
                    value={formData.panNumber || ''}
                    onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
                    maxLength={10}
                  />
                </div>

                {selectedDocuments.includes('passport') && (
                  <div className="space-y-2">
                    <Label htmlFor="passportNumber" className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      Passport Number (Optional)
                    </Label>
                    <Input
                      id="passportNumber"
                      placeholder="Enter passport number"
                      value={formData.passportNumber || ''}
                      onChange={(e) => handleInputChange('passportNumber', e.target.value.toUpperCase())}
                    />
                  </div>
                )}

                {selectedDocuments.includes('voter_id') && (
                  <div className="space-y-2">
                    <Label htmlFor="voterIdNumber" className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      Voter ID Number (Optional)
                    </Label>
                    <Input
                      id="voterIdNumber"
                      placeholder="Enter voter ID number"
                      value={formData.voterIdNumber || ''}
                      onChange={(e) => handleInputChange('voterIdNumber', e.target.value.toUpperCase())}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Document Selection */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-display font-semibold text-lg">Document Selection</h3>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Aadhaar and PAN are mandatory for digital onboarding. You may add additional documents.
              </p>

              {/* Mandatory Documents */}
              <div className="flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                  <span className="text-sm font-medium text-primary">Aadhaar Card</span>
                  <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">Required</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                  <span className="text-sm font-medium text-primary">PAN Card</span>
                  <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">Required</span>
                </div>
                
                {/* Optional Documents */}
                {selectedDocuments
                  .filter(d => d !== 'aadhaar' && d !== 'pan')
                  .map(doc => (
                    <div
                      key={doc}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 border border-accent/20"
                    >
                      <span className="text-sm font-medium text-accent">
                        {doc === 'passport' ? 'Passport' : 'Voter ID'}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeDocument(doc)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        ×
                      </button>
                    </div>
                  ))}
              </div>

              {/* Add Additional Document */}
              <div className="flex gap-2">
                <Select
                  value={additionalDoc}
                  onValueChange={(value) => setAdditionalDoc(value as DocumentType)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Add document..." />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes
                      .filter(d => !selectedDocuments.includes(d.value))
                      .map(doc => (
                        <SelectItem key={doc.value} value={doc.value}>
                          {doc.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {additionalDoc && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleDocumentAdd(additionalDoc)}
                  >
                    Add
                  </Button>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button type="submit" size="lg" className="gap-2">
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
