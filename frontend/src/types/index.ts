export interface User {
  id: string;
  name: string;
  email: string;
  role: 'DOCTOR' | 'PATIENT';
  isVerified?: boolean;
  nmcNumber?: string;
  specialization?: string;
  location?: string;
  avatar?: string;
}

export interface MedicalFile {
  id: string;
  name: string;
  type: 'mri' | 'xray' | 'sonography' | 'other';
  url: string;
  uploadedAt: Date;
  patientId: string;
}

export interface CasePost {
  id: string;
  title: string;
  description: string;
  images?: string[];
  patientAge: number;
  patientGender: 'male' | 'female' | 'other';
  symptoms: string[];
  doctorId: string;
  doctorName: string;
  specialization: string;
  createdAt: string | Date;
  likes: number;
  comments: Comment[];
  fileUrl?: string;
  fileName?: string;
}

export interface Comment {
  id: string;
  content: string;
  doctorId: string;
  doctorName: string;
  createdAt: Date;
}

export interface DonationRequest {
  id: string;
  type: 'blood' | 'organ';
  bloodType?: string;
  organType?: string;
  urgency: 'low' | 'medium' | 'high';
  patientName: string;
  hospitalName: string;
  location: string;
  contactPhone: string;
  description: string;
  requiredBy: Date;
  createdAt: Date;
}

export interface AIDiagnosis {
  possibleConditions: {
    condition: string;
    description: string;
  }[];
  recommendedTests: string[];
}
