export interface User {
  id: string;
  email: string;
  role: string;
}

export interface Driver {
  id: string;
  userId: string;
  registrationId: string;
  fullName: string;
  profilePhoto?: string;
  dateOfBirth?: string;
  gender?: string;
  mobileNumber: string;
  alternateMobile?: string;
  email: string;
  registrationType: 'DRIVER_ONLY' | 'DRIVER_WITH_VEHICLE';
  verificationStatus: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'RESUBMISSION_REQUIRED';
  profileCompletionPercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface DrivingLicence {
  id: string;
  driverId: string;
  licenceNumber: string;
  licenceClass: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  stateOfIssue: string;
}

export interface DrivingExperience {
  id: string;
  driverId: string;
  totalYears: number;
  previousCompany?: string;
  employmentDuration?: string;
  workDescription?: string;
  languages: string[];
  preferredLocation?: string;
  willingLongDistance: boolean;
  drivingCategories: string[];
}

export interface DriverAddress {
  id: string;
  driverId: string;
  doorNumber: string;
  street: string;
  village: string;
  district: string;
  state: string;
  pinCode: string;
}

export interface EmergencyContact {
  id: string;
  driverId: string;
  contactName: string;
  contactNumber: string;
  relationship: string;
}

export interface DriverDocument {
  id: string;
  driverId: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'UNDER_REVIEW' | 'REJECTED' | 'EXPIRED' | 'RESUBMISSION_REQUIRED';
  expiryDate?: string;
  rejectionReason?: string;
}

export interface FullDriver extends Driver {
  address?: DriverAddress;
  drivingExperience?: DrivingExperience;
  drivingLicence?: DrivingLicence;
  emergencyContact?: EmergencyContact;
  documents?: DriverDocument[];
  vehicles?: Vehicle[];
}

export interface Vehicle {
  id: string;
  driverId: string;
  category: string;
  manufacturer: string;
  model: string;
  registrationNumber: string;
  manufacturingYear: number;
  seatingCapacity: number;
  fuelType: string;
  colour: string;
  hasAC: boolean;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'UNDER_REVIEW' | 'REJECTED';
}

export interface Notification {
  id: string;
  driverId: string;
  title: string;
  message: string;
  type: 'REGISTRATION' | 'DOCUMENT' | 'APPROVAL' | 'REJECTION' | 'VEHICLE' | 'PROFILE' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegistrationData {
  step1?: Step1Data;
  step2?: Step2Data;
  step3?: Step3Data;
}

export interface Step1Data {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  mobileNumber: string;
  alternateMobile?: string;
  email: string;
  password: string;
  confirmPassword: string;
  doorNumber: string;
  street: string;
  village: string;
  district: string;
  state: string;
  pinCode: string;
  registrationType: 'DRIVER_ONLY' | 'DRIVER_WITH_VEHICLE';
}

export interface Step2Data {
  totalYears: number;
  previousCompany?: string;
  employmentDuration?: string;
  workDescription?: string;
  licenceNumber: string;
  licenceClass: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  stateOfIssue: string;
  languages: string[];
  preferredLocation?: string;
  willingLongDistance: boolean;
  drivingCategories: string[];
  emergencyContactName: string;
  emergencyContactNumber: string;
  emergencyRelationship: string;
}

export interface Step3Data {
  documents: { [key: string]: File | null };
  vehicle?: VehicleData;
  cameraPermission?: boolean;
  locationPermission?: boolean;
  microphonePermission?: boolean;
  consentAccurate: boolean;
  consentVerify: boolean;
  consentTerms: boolean;
}

export interface VehicleData {
  category: string;
  manufacturer: string;
  model: string;
  registrationNumber: string;
  manufacturingYear: number;
  seatingCapacity: number;
  fuelType: string;
  colour: string;
  hasAC: boolean;
}
