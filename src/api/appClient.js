const STORE_KEY = 'clinica_scheduler_store';
const SESSION_KEY = 'clinica_scheduler_session';
const REDIRECT_KEY = 'clinica_scheduler_post_login_redirect';

const COLLECTIONS = {
  User: 'users',
  Doctor: 'doctors',
  Appointment: 'appointments',
  Notification: 'notifications',
  AuditLog: 'auditLogs'
};

const DEFAULT_SETTINGS = {
  emailNotifications: true,
  appointmentReminders: true,
  marketingEmails: false,
  darkMode: false,
  language: 'en'
};

const clone = (value) => {
  if (value === undefined || value === null) {
    return value;
  }

  if (typeof globalThis.structuredClone === 'function') {
    return globalThis.structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
};

const getLocalStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
};

const getSessionStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.sessionStorage;
};

const nowIso = () => new Date().toISOString();

const addDays = (offset) => {
  const value = new Date();
  value.setHours(0, 0, 0, 0);
  value.setDate(value.getDate() + offset);
  return value.toISOString().slice(0, 10);
};

const createId = (prefix) => {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}_${globalThis.crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const emailToName = (email = '') => {
  const parts = email.split('@')[0]?.split(/[._-]+/).filter(Boolean) ?? [];
  if (!parts.length) {
    return 'Local User';
  }

  return parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const buildError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const createSeedStore = () => {
  const createdDate = nowIso();

  return {
    users: [
      {
        id: 'user_admin',
        full_name: 'Choice Admin',
        email: 'admin@clinic.local',
        role: 'admin',
        doctor_id: null,
        is_active: true,
        deleted_at: null,
        created_date: createdDate,
        settings: { ...DEFAULT_SETTINGS }
      },
      {
        id: 'user_doctor',
        full_name: 'Jane Smith',
        email: 'doctor@clinic.local',
        role: 'user',
        doctor_id: 'doctor_jane_smith',
        is_active: true,
        deleted_at: null,
        created_date: createdDate,
        settings: { ...DEFAULT_SETTINGS }
      },
      {
        id: 'user_patient',
        full_name: 'Alice Johnson',
        email: 'patient@clinic.local',
        role: 'user',
        doctor_id: null,
        is_active: true,
        deleted_at: null,
        created_date: createdDate,
        settings: { ...DEFAULT_SETTINGS }
      }
    ],
    doctors: [
      {
        id: 'doctor_jane_smith',
        name: 'Jane Smith',
        email: 'doctor@clinic.local',
        phone: '+1 (555) 010-0001',
        specialty: 'General Practice',
        bio: 'Experienced family physician focused on accessible local care.',
        user_id: 'user_doctor',
        is_active: true,
        consultation_duration: 30,
        availability: [
          { day: 'Monday', start_time: '09:00', end_time: '16:00' },
          { day: 'Tuesday', start_time: '09:00', end_time: '16:00' },
          { day: 'Wednesday', start_time: '09:00', end_time: '16:00' },
          { day: 'Thursday', start_time: '09:00', end_time: '16:00' },
          { day: 'Friday', start_time: '09:00', end_time: '13:00' }
        ],
        created_date: createdDate
      }
    ],
    appointments: [
      {
        id: 'appointment_pending',
        patient_id: 'user_patient',
        patient_name: 'Alice Johnson',
        patient_email: 'patient@clinic.local',
        doctor_id: 'doctor_jane_smith',
        doctor_name: 'Jane Smith',
        doctor_email: 'doctor@clinic.local',
        date: addDays(1),
        start_time: '09:00',
        end_time: '09:30',
        status: 'pending',
        reason: 'Routine consultation',
        notes: null,
        cancellation_reason: null,
        created_date: createdDate
      },
      {
        id: 'appointment_approved',
        patient_id: 'user_patient',
        patient_name: 'Alice Johnson',
        patient_email: 'patient@clinic.local',
        doctor_id: 'doctor_jane_smith',
        doctor_name: 'Jane Smith',
        doctor_email: 'doctor@clinic.local',
        date: addDays(3),
        start_time: '10:00',
        end_time: '10:30',
        status: 'approved',
        reason: 'Follow-up visit',
        notes: 'Bring recent lab results.',
        cancellation_reason: null,
        created_date: createdDate
      }
    ],
    notifications: [
      {
        id: 'notification_seed',
        user_id: 'user_patient',
        user_email: 'patient@clinic.local',
        appointment_id: 'appointment_approved',
        type: 'appointment_approved',
        title: 'Appointment Approved',
        message: 'Your appointment with Dr. Jane Smith has been approved.',
        created_date: createdDate
      }
    ],
    auditLogs: [
      {
        id: 'audit_seed',
        user_id: 'user_admin',
        user_email: 'admin@clinic.local',
        user_role: 'admin',
        action: 'local_store_initialized',
        details: JSON.stringify({ source: 'browser_storage' }),
        ip_address: 'local',
        created_date: createdDate
      }
    ]
  };
};

const persistStore = (store) => {
  const storage = getLocalStorage();
  if (!storage) {
    return;
  }

  storage.setItem(STORE_KEY, JSON.stringify(store));
};

const normalizeUser = (record, previous, store) => {
  const email = record.email?.trim().toLowerCase();
  if (!email) {
    throw buildError('User email is required.');
  }

  const duplicate = store.users.find(
    (user) => user.email?.toLowerCase() === email && user.id !== record.id
  );

  if (duplicate) {
    throw buildError('A user with this email already exists.', 409);
  }

  return {
    ...record,
    email,
    full_name: record.full_name?.trim() || previous?.full_name || emailToName(email),
    role: record.role || previous?.role || 'user',
    doctor_id: record.doctor_id ?? previous?.doctor_id ?? null,
    is_active: record.is_active ?? previous?.is_active ?? true,
    deleted_at: record.deleted_at ?? previous?.deleted_at ?? null,
    created_date: record.created_date || previous?.created_date || nowIso(),
    settings: {
      ...DEFAULT_SETTINGS,
      ...(previous?.settings ?? {}),
      ...(record.settings ?? {})
    }
  };
};

const normalizeDoctor = (record, previous, store) => {
  const linkedUser = record.user_id
    ? store.users.find((user) => user.id === record.user_id)
    : null;

  return {
    ...record,
    name: record.name?.trim() || previous?.name || linkedUser?.full_name || 'Doctor',
    email: record.email?.trim().toLowerCase() || previous?.email || linkedUser?.email || '',
    phone: record.phone ?? previous?.phone ?? '',
    specialty: record.specialty || previous?.specialty || 'General Practice',
    bio: record.bio ?? previous?.bio ?? '',
    user_id: record.user_id ?? previous?.user_id ?? null,
    is_active: record.is_active ?? previous?.is_active ?? true,
    consultation_duration: Number(record.consultation_duration ?? previous?.consultation_duration ?? 30),
    availability: Array.isArray(record.availability)
      ? record.availability
      : (previous?.availability ?? []),
    created_date: record.created_date || previous?.created_date || nowIso()
  };
};

const normalizeAppointment = (record, previous, store) => {
  const doctor = store.doctors.find((item) => item.id === record.doctor_id);
  const patient = store.users.find((item) => item.id === record.patient_id);

  return {
    ...record,
    patient_name: record.patient_name?.trim() || previous?.patient_name || patient?.full_name || 'Patient',
    patient_email: record.patient_email?.trim().toLowerCase() || previous?.patient_email || patient?.email || '',
    doctor_name: record.doctor_name?.trim() || previous?.doctor_name || doctor?.name || '',
    doctor_email: record.doctor_email?.trim().toLowerCase() || previous?.doctor_email || doctor?.email || '',
    status: record.status || previous?.status || 'pending',
    reason: record.reason?.trim() || previous?.reason || '',
    notes: record.notes ?? previous?.notes ?? null,
    cancellation_reason: record.cancellation_reason ?? previous?.cancellation_reason ?? null,
    created_date: record.created_date || previous?.created_date || nowIso()
  };
};

const normalizeNotification = (record, previous, store) => {
  const user = store.users.find((item) => item.id === record.user_id);

  return {
    ...record,
    user_email: record.user_email?.trim().toLowerCase() || previous?.user_email || user?.email || '',
    title: record.title || previous?.title || 'Notification',
    message: record.message || previous?.message || '',
    created_date: record.created_date || previous?.created_date || nowIso()
  };
};

const normalizeAuditLog = (record, previous) => ({
  ...record,
  user_id: record.user_id ?? previous?.user_id ?? null,
  user_email: record.user_email ?? previous?.user_email ?? '',
  user_role: record.user_role ?? previous?.user_role ?? 'user',
  action: record.action || previous?.action || 'updated',
  details: record.details ?? previous?.details ?? '',
  ip_address: record.ip_address ?? previous?.ip_address ?? 'local',
  created_date: record.created_date || previous?.created_date || nowIso()
});

const normalizeEntity = (entityName, record, store, previous = null) => {
  if (entityName === 'User') {
    return normalizeUser(record, previous, store);
  }

  if (entityName === 'Doctor') {
    return normalizeDoctor(record, previous, store);
  }

  if (entityName === 'Appointment') {
    return normalizeAppointment(record, previous, store);
  }

  if (entityName === 'Notification') {
    return normalizeNotification(record, previous, store);
  }

  if (entityName === 'AuditLog') {
    return normalizeAuditLog(record, previous, store);
  }

  return { ...record };
};

const synchronizeLinks = (store, entityName, record, previous = null) => {
  if (entityName === 'Doctor') {
    if (previous?.user_id && previous.user_id !== record.user_id) {
      store.users = store.users.map((user) =>
        user.id === previous.user_id ? { ...user, doctor_id: null } : user
      );
    }

    if (record.user_id) {
      store.users = store.users.map((user) =>
        user.id === record.user_id ? { ...user, doctor_id: record.id } : user
      );
    }
  }

  if (entityName === 'User' && record.doctor_id) {
    store.doctors = store.doctors.map((doctor) =>
      doctor.id === record.doctor_id
        ? { ...doctor, user_id: record.id, email: doctor.email || record.email, name: doctor.name || record.full_name }
        : doctor
    );
  }
};

const migrateStore = (rawStore) => {
  const seedStore = createSeedStore();
  const store = {
    users: Array.isArray(rawStore?.users) ? rawStore.users : seedStore.users,
    doctors: Array.isArray(rawStore?.doctors) ? rawStore.doctors : seedStore.doctors,
    appointments: Array.isArray(rawStore?.appointments) ? rawStore.appointments : seedStore.appointments,
    notifications: Array.isArray(rawStore?.notifications) ? rawStore.notifications : seedStore.notifications,
    auditLogs: Array.isArray(rawStore?.auditLogs) ? rawStore.auditLogs : seedStore.auditLogs
  };

  store.users = store.users.map((record) => normalizeUser(record, null, store));
  store.doctors = store.doctors.map((record) => normalizeDoctor(record, null, store));
  store.appointments = store.appointments.map((record) => normalizeAppointment(record, null, store));
  store.notifications = store.notifications.map((record) => normalizeNotification(record, null, store));
  store.auditLogs = store.auditLogs.map((record) => normalizeAuditLog(record, null, store));

  persistStore(store);
  return store;
};

const loadStore = () => {
  const storage = getLocalStorage();
  if (!storage) {
    return migrateStore(createSeedStore());
  }

  const rawValue = storage.getItem(STORE_KEY);
  if (!rawValue) {
    const seedStore = migrateStore(createSeedStore());
    persistStore(seedStore);
    return seedStore;
  }

  try {
    return migrateStore(JSON.parse(rawValue));
  } catch {
    const seedStore = migrateStore(createSeedStore());
    persistStore(seedStore);
    return seedStore;
  }
};

const loadSession = () => {
  const storage = getLocalStorage();
  if (!storage) {
    return { userId: null };
  }

  const rawValue = storage.getItem(SESSION_KEY);
  if (!rawValue) {
    return { userId: null };
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return { userId: null };
  }
};

const emitAuthChange = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent('clinica-scheduler-auth-changed'));
};

const saveSession = (session) => {
  const storage = getLocalStorage();
  if (!storage) {
    return;
  }

  storage.setItem(SESSION_KEY, JSON.stringify(session));
  emitAuthChange();
};

const clearSession = () => {
  const storage = getLocalStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(SESSION_KEY);
  emitAuthChange();
};

const getCurrentUser = (store = loadStore()) => {
  const session = loadSession();
  if (!session.userId) {
    return null;
  }

  const user = store.users.find((item) => item.id === session.userId);
  if (!user || !user.is_active || user.deleted_at) {
    clearSession();
    return null;
  }

  return user;
};

const compareValues = (left, right) => {
  if (left === right) {
    return 0;
  }

  if (left === undefined || left === null) {
    return 1;
  }

  if (right === undefined || right === null) {
    return -1;
  }

  if (typeof left === 'number' && typeof right === 'number') {
    return left - right;
  }

  return String(left).localeCompare(String(right));
};

const sortRecords = (records, sortOrder) => {
  if (!sortOrder) {
    return [...records];
  }

  const descending = sortOrder.startsWith('-');
  const field = descending ? sortOrder.slice(1) : sortOrder;

  return [...records].sort((left, right) => {
    const result = compareValues(left[field], right[field]);
    return descending ? -result : result;
  });
};

const filterRecords = (records, criteria = {}) => {
  const entries = Object.entries(criteria ?? {});
  if (!entries.length) {
    return [...records];
  }

  return records.filter((record) =>
    entries.every(([field, expected]) => record[field] === expected)
  );
};

const limitRecords = (records, limit) => {
  if (!limit) {
    return records;
  }

  return records.slice(0, limit);
};

const createEntityApi = (entityName) => {
  const collectionKey = COLLECTIONS[entityName];

  return {
    async list(sortOrder, limit) {
      const store = loadStore();
      return clone(limitRecords(sortRecords(store[collectionKey], sortOrder), limit));
    },

    async filter(criteria = {}, sortOrder, limit) {
      const store = loadStore();
      const filtered = filterRecords(store[collectionKey], criteria);
      return clone(limitRecords(sortRecords(filtered, sortOrder), limit));
    },

    async create(payload) {
      const store = loadStore();
      const record = normalizeEntity(
        entityName,
        {
          id: payload.id || createId(entityName.toLowerCase()),
          ...payload,
          created_date: payload.created_date || nowIso()
        },
        store
      );

      store[collectionKey] = [record, ...store[collectionKey].filter((item) => item.id !== record.id)];
      synchronizeLinks(store, entityName, record, null);
      persistStore(store);

      return clone(record);
    },

    async update(id, payload) {
      const store = loadStore();
      const index = store[collectionKey].findIndex((item) => item.id === id);
      if (index === -1) {
        throw buildError(`${entityName} not found.`, 404);
      }

      const previous = store[collectionKey][index];
      const record = normalizeEntity(entityName, { ...previous, ...payload, id }, store, previous);
      store[collectionKey][index] = record;
      synchronizeLinks(store, entityName, record, previous);
      persistStore(store);

      if (entityName === 'User' && loadSession().userId === id) {
        emitAuthChange();
      }

      return clone(record);
    },

    async delete(id) {
      const store = loadStore();
      const record = store[collectionKey].find((item) => item.id === id);
      if (!record) {
        throw buildError(`${entityName} not found.`, 404);
      }

      store[collectionKey] = store[collectionKey].filter((item) => item.id !== id);

      if (entityName === 'Doctor') {
        store.users = store.users.map((user) =>
          user.doctor_id === id ? { ...user, doctor_id: null } : user
        );
      }

      if (entityName === 'User') {
        store.doctors = store.doctors.map((doctor) =>
          doctor.user_id === id ? { ...doctor, user_id: null } : doctor
        );

        if (loadSession().userId === id) {
          clearSession();
        }
      }

      persistStore(store);
      return clone(record);
    }
  };
};

const entities = Object.keys(COLLECTIONS).reduce((result, entityName) => {
  result[entityName] = createEntityApi(entityName);
  return result;
}, {});

const users = {
  async inviteUser(email, role = 'user') {
    const store = loadStore();
    const invitedUser = normalizeUser(
      {
        id: createId('user'),
        email,
        role,
        full_name: emailToName(email),
        is_active: true,
        deleted_at: null,
        created_date: nowIso(),
        settings: { ...DEFAULT_SETTINGS }
      },
      null,
      store
    );

    store.users = [invitedUser, ...store.users];
    store.auditLogs = [
      {
        id: createId('audit'),
        user_id: invitedUser.id,
        user_email: invitedUser.email,
        user_role: invitedUser.role,
        action: 'user_invited',
        details: JSON.stringify({ invited: true }),
        ip_address: 'local',
        created_date: nowIso()
      },
      ...store.auditLogs
    ];
    persistStore(store);

    return clone(invitedUser);
  }
};

const auth = {
  async isAuthenticated() {
    return Boolean(getCurrentUser());
  },

  async me() {
    const store = loadStore();
    const user = getCurrentUser(store);
    if (!user) {
      throw buildError('Authentication required.', 401);
    }

    return clone(user);
  },

  async login(email) {
    const store = loadStore();
    const normalizedEmail = email.trim().toLowerCase();
    const user = store.users.find(
      (item) => item.email?.toLowerCase() === normalizedEmail && item.is_active && !item.deleted_at
    );

    if (!user) {
      throw buildError('No active local account matches this email.', 404);
    }

    saveSession({ userId: user.id });

    store.auditLogs = [
      {
        id: createId('audit'),
        user_id: user.id,
        user_email: user.email,
        user_role: user.role,
        action: 'user_login',
        details: JSON.stringify({ source: 'local_sign_in' }),
        ip_address: 'local',
        created_date: nowIso()
      },
      ...store.auditLogs
    ];
    persistStore(store);

    return clone(user);
  },

  async updateMe(payload) {
    const currentUser = await auth.me();
    return entities.User.update(currentUser.id, payload);
  },

  logout(redirectTarget = true) {
    const user = getCurrentUser();
    const store = loadStore();

    if (user) {
      store.auditLogs = [
        {
          id: createId('audit'),
          user_id: user.id,
          user_email: user.email,
          user_role: user.role,
          action: 'user_logout',
          details: JSON.stringify({ source: 'local_sign_out' }),
          ip_address: 'local',
          created_date: nowIso()
        },
        ...store.auditLogs
      ];
      persistStore(store);
    }

    clearSession();

    if (redirectTarget && typeof window !== 'undefined') {
      const homeUrl = new URL(window.location.href);
      homeUrl.pathname = '/';
      homeUrl.search = '';
      window.location.assign(homeUrl.toString());
    }
  },

  redirectToLogin(returnUrl) {
    if (typeof window === 'undefined') {
      return;
    }

    const storage = getSessionStorage();
    if (storage) {
      storage.setItem(REDIRECT_KEY, returnUrl || window.location.href);
    }

    const loginUrl = new URL(window.location.href);
    loginUrl.pathname = '/';
    loginUrl.searchParams.set('login', '1');
    window.location.assign(loginUrl.toString());
  },

  consumeRedirectUrl() {
    const storage = getSessionStorage();
    if (!storage) {
      return null;
    }

    const redirectUrl = storage.getItem(REDIRECT_KEY);
    storage.removeItem(REDIRECT_KEY);
    return redirectUrl;
  }
};

const appLogs = {
  async logUserInApp(pageName) {
    const user = getCurrentUser();
    if (!user) {
      return null;
    }

    const store = loadStore();
    const entry = {
      id: createId('audit'),
      user_id: user.id,
      user_email: user.email,
      user_role: user.role,
      action: 'page_view',
      details: JSON.stringify({ page: pageName }),
      ip_address: 'local',
      created_date: nowIso()
    };

    store.auditLogs = [entry, ...store.auditLogs].slice(0, 200);
    persistStore(store);
    return clone(entry);
  }
};

export const appClient = {
  auth,
  users,
  entities,
  appLogs
};