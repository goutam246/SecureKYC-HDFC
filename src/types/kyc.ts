export type DocumentType = 'aadhaar' | 'pan' | 'passport' | 'voter_id';

export type KYCStatus = 'pending' | 'in_progress' | 'approved' | 'rejected' | 'review';

export interface PersonalDetails {
  fullName: string;
  dateOfBirth: string;
  mobile: string;
  email: string;
  address?: string;
  gender?: 'male' | 'female' | 'other';
  aadhaarNumber?: string;
  panNumber?: string;
  passportNumber?: string;
  voterIdNumber?: string;
}

export interface Document {
  type: DocumentType;
  file?: File;
  previewUrl?: string;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  attempts: number;
  documentNumber?: string;
}

export interface KYCApplication {
  applicationId: string;
  userId: string;
  status: KYCStatus;
  currentStep: number;
  personalDetails?: PersonalDetails;
  documents: Document[];
  photo?: {
    file?: File;
    previewUrl?: string;
    status: 'pending' | 'uploaded' | 'verified' | 'rejected';
    attempts: number;
  };
  selfie?: {
    file?: File;
    previewUrl?: string;
    status: 'pending' | 'uploaded' | 'verified' | 'rejected';
    attempts: number;
    faceMatchScore?: number;
  };
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  mobile: string;
  name?: string;
  applicationId?: string;
}
