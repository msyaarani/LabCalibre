export type UserRole = 'operator' | 'supervisor' | 'officer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
}

export type InstrumentStatus = 'active' | 'out_of_service' | 'due_soon';

export interface Instrument {
  id: string;
  name: string;
  serialNo: string;
  category: string;
  location: string;
  targetReading: number;
  toleranceLimit: number;
  unit: string;
  status: InstrumentStatus;
  lastCalibrationDate: string;
  nextDueDate: string;
  qrCodeRef: string;
  isActive: boolean; // For soft delete audit compliance
  quarantineReason?: string;
  quarantineTimestamp?: string;
  referenceNo?: string; // LGM Reference ID, e.g. LGM/B1, LGM/SW1
  assignedOperator?: string; // e.g. Fendy, Abid, Hisyam, Nuar, Mahfuzah, Zaidi
  calibrationCompany?: string; // e.g. METCAL
  department?: string; // e.g. UPKS
  preparedBy?: string; // e.g. Mohd Fandi bin Mohd Sukri
}

export type CalibrationType = 'Internal' | 'External';
export type ResultStatus = 'Pass' | 'Fail' | 'Lulus' | 'Gagal';
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

export interface VerificationReadings {
  standardReading: number;
  measuredReading: number;
  deviation: number;
  toleranceLimit: number;
  unit: string;
  notes?: string;
}

export interface CalibrationRecord {
  id: string;
  instrumentId: string;
  instrumentName: string;
  serialNo: string;
  type: CalibrationType;
  date: string;
  readings: VerificationReadings;
  uploadedFileUrl?: string;
  uploadedFileName?: string;
  certificateNumber?: string;
  calibrationBody?: string;
  resultStatus: ResultStatus;
  approvalStatus: ApprovalStatus;
  createdBy: string;
  createdRole: UserRole;
  createdAt: string;
  evaluatedBy?: string;
  evaluatedRole?: UserRole;
  evaluatedAt?: string;
  evaluationNotes?: string;
  isActive: boolean;
}

export interface NotificationLog {
  id: string;
  type: 'emergency_quarantine' | 'due_reminder' | 'approval_notice';
  title: string;
  message: string;
  timestamp: string;
  recipient: string;
  instrumentId?: string;
  instrumentName?: string;
  isRead?: boolean;
}
