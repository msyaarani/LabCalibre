import React, { createContext, useContext, useState, useEffect } from 'react';
import { Instrument, CalibrationRecord, User, UserRole, NotificationLog } from '../types';
import { INITIAL_USERS, INITIAL_INSTRUMENTS, INITIAL_RECORDS, INITIAL_NOTIFICATIONS } from '../data/mockData';

interface AppContextType {
  currentUser: User;
  users: User[];
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  loginWithGoogle: (email: string, name?: string) => { success: boolean; message: string };
  logout: () => void;
  instruments: Instrument[];
  addInstrument: (instrument: Omit<Instrument, 'id' | 'qrCodeRef' | 'isActive'>) => Instrument;
  updateInstrument: (id: string, updates: Partial<Instrument>) => void;
  quarantineInstrument: (id: string, reason: string) => Promise<void>;
  activateInstrument: (id: string) => void;
  deleteInstrument: (id: string) => void;
  records: CalibrationRecord[];
  addRecord: (record: Omit<CalibrationRecord, 'id' | 'createdAt' | 'isActive'>) => { success: boolean; message?: string; record?: CalibrationRecord };
  approveRecord: (recordId: string, notes?: string) => { success: boolean; message: string };
  rejectRecord: (recordId: string, notes: string) => { success: boolean; message: string };
  notifications: NotificationLog[];
  unreadCount: number;
  markNotificationsAsRead: () => void;
  resetAllData: () => void;
  syncLgmMasterlist: () => void;
  importMasterlistFromCsv: (csvContent: string) => { success: boolean; count: number; message: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  INSTRUMENTS: 'labcalibre_instruments_v2_lgm',
  RECORDS: 'labcalibre_records_v2_lgm',
  NOTIFICATIONS: 'labcalibre_notifications_v2_lgm',
  USER: 'labcalibre_current_user_v2_lgm',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users] = useState<User[]>(INITIAL_USERS);

  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved user:', e);
    }
    return INITIAL_USERS[0]; // Default to Operator Ahmad Danial
  });

  const [instruments, setInstruments] = useState<Instrument[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INSTRUMENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved instruments:', e);
    }
    return INITIAL_INSTRUMENTS;
  });

  const [records, setRecords] = useState<CalibrationRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECORDS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved records:', e);
    }
    return INITIAL_RECORDS;
  });

  const [notifications, setNotifications] = useState<NotificationLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved notifications:', e);
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INSTRUMENTS, JSON.stringify(instruments));
  }, [instruments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  const switchRole = (role: UserRole) => {
    const matched = users.find((u) => u.role === role);
    if (matched) {
      setCurrentUser(matched);
    } else {
      setCurrentUser({
        ...currentUser,
        role,
      });
    }
  };

  const loginWithGoogle = (email: string, name?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    // FR-001 Acceptance Criteria: Login using corporate account. Deny access if missing or not corporate domain.
    if (!cleanEmail) {
      return { success: false, message: 'Please enter a valid corporate email address.' };
    }

    if (!cleanEmail.endsWith('@syarikat.com') && !cleanEmail.endsWith('@lgm.gov.my')) {
      return {
        success: false,
        message: 'Access Denied: Only authorized Google Workspace corporate accounts (@syarikat.com / @lgm.gov.my) are permitted.',
      };
    }

    let role: UserRole = 'operator';
    if (cleanEmail.includes('faridah') || cleanEmail.includes('supervisor')) {
      role = 'supervisor';
    } else if (cleanEmail.includes('officer') || cleanEmail.includes('syaarani') || cleanEmail.includes('compliance')) {
      role = 'officer';
    }

    const newUser: User = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      name: name || (cleanEmail.split('@')[0].replace('.', ' ').toUpperCase()),
      email: cleanEmail,
      role,
      department: role === 'officer' ? 'Laboratory Audit & Compliance' : role === 'supervisor' ? 'Quality Assurance' : 'Analytical Testing Operations',
    };

    setCurrentUser(newUser);
    return { success: true, message: `Successfully authenticated as ${newUser.name} (${role.toUpperCase()})` };
  };

  const logout = () => {
    // Revert to demo operator
    setCurrentUser(INITIAL_USERS[0]);
  };

  const addInstrument = (data: Omit<Instrument, 'id' | 'qrCodeRef' | 'isActive'>) => {
    const id = `INST-${String(instruments.length + 1).padStart(3, '0')}`;
    const newInst: Instrument = {
      ...data,
      id,
      qrCodeRef: `LAB-QR-${id}`,
      isActive: true,
    };
    setInstruments((prev) => [newInst, ...prev]);
    return newInst;
  };

  const updateInstrument = (id: string, updates: Partial<Instrument>) => {
    setInstruments((prev) =>
      prev.map((inst) => (inst.id === id ? { ...inst, ...updates } : inst))
    );
  };

  const quarantineInstrument = async (id: string, reason: string) => {
    const target = instruments.find((i) => i.id === id);
    if (!target) return;

    const timestamp = new Date().toISOString();

    // 1. Update instrument status to 'out_of_service'
    setInstruments((prev) =>
      prev.map((inst) =>
        inst.id === id
          ? {
              ...inst,
              status: 'out_of_service',
              quarantineReason: reason,
              quarantineTimestamp: timestamp,
            }
          : inst
      )
    );

    // 2. Dispatch Emergency Email Notification to Supervisors & Officers (FR-005)
    try {
      await fetch('/api/notifications/emergency-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instrumentId: target.id,
          instrumentName: target.name,
          serialNo: target.serialNo,
          failureReason: reason,
          timestamp,
          operatorName: currentUser.name,
        }),
      });
    } catch (e) {
      console.warn('Network alert log fallback (offline / demo mode):', e);
    }

    // 3. Add to In-App Notification log
    const emergencyNotif: NotificationLog = {
      id: `NOTIF-${Date.now()}`,
      type: 'emergency_quarantine',
      title: `🚨 AUTO-QUARANTINE: ${target.name}`,
      message: `Instrument ${target.serialNo} FAILED tolerance verification (${reason}). Status changed to "Out of Service" and emergency alert dispatched to Supervisors.`,
      timestamp,
      recipient: 'lab-supervisors@syarikat.com, safety-officers@syarikat.com',
      instrumentId: target.id,
      instrumentName: target.name,
      isRead: false,
    };

    setNotifications((prev) => [emergencyNotif, ...prev]);
  };

  const activateInstrument = (id: string) => {
    setInstruments((prev) =>
      prev.map((inst) =>
        inst.id === id
          ? {
              ...inst,
              status: 'active',
              quarantineReason: undefined,
              quarantineTimestamp: undefined,
            }
          : inst
      )
    );

    const infoNotif: NotificationLog = {
      id: `NOTIF-${Date.now()}`,
      type: 'approval_notice',
      title: `Status Updated: Instrument Reactivated`,
      message: `Instrument ${id} recalibration has been re-verified and reactivated by ${currentUser.name}.`,
      timestamp: new Date().toISOString(),
      recipient: 'all-lab-staff@syarikat.com',
      instrumentId: id,
      isRead: false,
    };
    setNotifications((prev) => [infoNotif, ...prev]);
  };

  const deleteInstrument = (id: string) => {
    // Soft delete per PRD Section 10
    setInstruments((prev) =>
      prev.map((inst) => (inst.id === id ? { ...inst, isActive: false } : inst))
    );
  };

  const addRecord = (data: Omit<CalibrationRecord, 'id' | 'createdAt' | 'isActive'>) => {
    // Business Rule FR-013: Check duplicate upload/record
    const isDuplicate = records.some(
      (r) =>
        r.isActive &&
        r.instrumentId === data.instrumentId &&
        r.date === data.date &&
        r.type === data.type &&
        (data.certificateNumber ? r.certificateNumber === data.certificateNumber : true)
    );

    if (isDuplicate) {
      return {
        success: false,
        message: 'Duplicate Record: A calibration certificate or verification record for this instrument on this date has already been registered.',
      };
    }

    const newRecordId = `REC-2026-${String(records.length + 1).padStart(3, '0')}`;
    const newRecord: CalibrationRecord = {
      ...data,
      id: newRecordId,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    setRecords((prev) => [newRecord, ...prev]);

    // If result is FAIL -> Execute Auto-Quarantine (FR-005)
    if (data.resultStatus === 'Fail' || data.resultStatus === 'Gagal') {
      const devText = `Deviation of ${data.readings.deviation} ${data.readings.unit} exceeds allowed tolerance limit of ±${data.readings.toleranceLimit} ${data.readings.unit}`;
      quarantineInstrument(data.instrumentId, devText);
    } else {
      // If Pass, inform supervisor
      const notif: NotificationLog = {
        id: `NOTIF-${Date.now()}`,
        type: 'approval_notice',
        title: `New Record Pending Approval (${data.type})`,
        message: `${currentUser.name} (${currentUser.role}) submitted a verification record for ${data.instrumentName}. Pending review.`,
        timestamp: new Date().toISOString(),
        recipient: 'faridah.yusof@syarikat.com',
        instrumentId: data.instrumentId,
        instrumentName: data.instrumentName,
        isRead: false,
      };
      setNotifications((prev) => [notif, ...prev]);
    }

    return {
      success: true,
      message: 'Record successfully registered.',
      record: newRecord,
    };
  };

  const approveRecord = (recordId: string, notes?: string) => {
    if (currentUser.role !== 'supervisor' && currentUser.role !== 'officer') {
      return {
        success: false,
        message: 'Access Denied: Only Quality Supervisors or Compliance Officers possess authority to approve records.',
      };
    }

    const record = records.find((r) => r.id === recordId);
    if (!record) return { success: false, message: 'Record not found.' };

    const evaluatedAt = new Date().toISOString();
    setRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? {
              ...r,
              approvalStatus: 'Approved',
              evaluatedBy: currentUser.name,
              evaluatedRole: currentUser.role,
              evaluatedAt,
              evaluationNotes: notes || 'Reviewed and approved in accordance with laboratory SOP.',
            }
          : r
      )
    );

    // If external calibration was approved, update the instrument's last & next due date
    if (record.type === 'External' && (record.resultStatus === 'Pass' || record.resultStatus === 'Lulus')) {
      const calDate = record.date;
      const d = new Date(calDate);
      d.setFullYear(d.getFullYear() + 1);
      const nextDue = d.toISOString().split('T')[0];

      updateInstrument(record.instrumentId, {
        lastCalibrationDate: calDate,
        nextDueDate: nextDue,
        status: 'active',
      });
    }

    return { success: true, message: `Record ${recordId} was successfully approved by ${currentUser.name}.` };
  };

  const rejectRecord = (recordId: string, notes: string) => {
    if (currentUser.role !== 'supervisor' && currentUser.role !== 'officer') {
      return {
        success: false,
        message: 'Access Denied: Only Quality Supervisors or Compliance Officers possess authority to reject records.',
      };
    }

    const evaluatedAt = new Date().toISOString();
    setRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? {
              ...r,
              approvalStatus: 'Rejected',
              evaluatedBy: currentUser.name,
              evaluatedRole: currentUser.role,
              evaluatedAt,
              evaluationNotes: notes,
            }
          : r
      )
    );

    return { success: true, message: `Record ${recordId} was rejected with recorded audit trail remarks.` };
  };

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const syncLgmMasterlist = () => {
    setInstruments(INITIAL_INSTRUMENTS);
    const notif: NotificationLog = {
      id: `NOTIF-${Date.now()}`,
      type: 'approval_notice',
      title: 'LGM Master List Synchronized',
      message: 'Successfully synchronized 12 official balance calibration records from UPKS 2026 Masterlist.',
      timestamp: new Date().toISOString(),
      recipient: currentUser.email,
      isRead: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const importMasterlistFromCsv = (csvContent: string): { success: boolean; count: number; message: string } => {
    try {
      const lines = csvContent.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
      const parsedInstruments: Instrument[] = [];

      for (const line of lines) {
        if (line.includes('MASTER LIST') || line.includes('PREPARED BY') || line.includes('SIGN')) continue;
        const cols = line.split(',').map((c) => c.trim());
        
        const refColIndex = cols.findIndex((c) => /^LGM\/(SW|B)\d+$/i.test(c));
        if (refColIndex === -1) continue;

        const refNo = cols[refColIndex];
        const instName = cols[refColIndex + 1] || 'Balance';
        const operator = cols[refColIndex + 2] || 'Lab Operator';
        const location = cols[refColIndex + 3] || 'UPKS Lab';
        const calDateRaw = cols[refColIndex + 4] || '';
        const nextCalDateRaw = cols[refColIndex + 5] || '';
        const company = cols[refColIndex + 6] || 'METCAL';
        const statusRaw = (cols[refColIndex + 7] || '').toUpperCase();

        const formatDate = (raw: string) => {
          if (!raw) return '';
          const parts = raw.split('/');
          if (parts.length === 3) {
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            const year = parts[2];
            return `${year}-${month}-${day}`;
          }
          return raw;
        };

        const calDate = formatDate(calDateRaw);
        const nextDate = formatDate(nextCalDateRaw);

        let category = 'Analytical Balances';
        let target = 100.0000;
        let tol = 0.0002;
        let unit = 'g';

        if (instName.toUpperCase().includes('STANDARD WEIGHT')) {
          category = 'Standard Weights';
          tol = 0.0001;
        } else if (instName.toUpperCase().includes('MICRO BALANCE')) {
          category = 'Micro Balances';
          target = 10.00000;
          tol = 0.00005;
        } else if (instName.toUpperCase().includes('SEMI-MICRO')) {
          category = 'Semi-Micro Balances';
          target = 50.00000;
          tol = 0.00010;
        } else if (instName.toUpperCase().includes('PRECISION')) {
          category = 'Precision Balances';
          target = 200.000;
          tol = 0.002;
        }

        const cleanId = refNo.replace('/', '-').toUpperCase();
        parsedInstruments.push({
          id: cleanId,
          referenceNo: refNo,
          name: instName,
          serialNo: `${cleanId}-SERIES`,
          category,
          location,
          department: 'UPKS',
          assignedOperator: operator,
          calibrationCompany: company,
          targetReading: target,
          toleranceLimit: tol,
          unit,
          status: statusRaw === 'GOOD' ? 'active' : (!calDate ? 'due_soon' : 'active'),
          lastCalibrationDate: calDate || 'Not Calibrated',
          nextDueDate: nextDate || 'Pending Schedule',
          qrCodeRef: `LAB-QR-${cleanId}`,
          isActive: true,
          preparedBy: 'MOHD FANDI BIN MOHD SUKRI',
        });
      }

      if (parsedInstruments.length === 0) {
        return { success: false, count: 0, message: 'No valid LGM instrument rows detected in CSV.' };
      }

      setInstruments((prev) => {
        const existingMap = new Map(prev.map((i) => [i.id, i]));
        for (const item of parsedInstruments) {
          existingMap.set(item.id, item);
        }
        return Array.from(existingMap.values());
      });

      return {
        success: true,
        count: parsedInstruments.length,
        message: `Successfully extracted and updated ${parsedInstruments.length} balance instruments from master list.`,
      };
    } catch (e: any) {
      return { success: false, count: 0, message: `Failed to parse master list: ${e?.message || 'Invalid format'}` };
    }
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEYS.INSTRUMENTS);
    localStorage.removeItem(STORAGE_KEYS.RECORDS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setInstruments(INITIAL_INSTRUMENTS);
    setRecords(INITIAL_RECORDS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentUser(INITIAL_USERS[0]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        setCurrentUser,
        switchRole,
        loginWithGoogle,
        logout,
        instruments,
        addInstrument,
        updateInstrument,
        quarantineInstrument,
        activateInstrument,
        deleteInstrument,
        records,
        addRecord,
        approveRecord,
        rejectRecord,
        notifications,
        unreadCount,
        markNotificationsAsRead,
        resetAllData,
        syncLgmMasterlist,
        importMasterlistFromCsv,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
