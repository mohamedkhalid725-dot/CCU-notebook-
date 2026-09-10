import { useCallback, useSyncExternalStore } from 'react';

export type AppLanguage = 'en' | 'ar';

const STORAGE_KEY_LANGUAGE = 'cardiovault_language';

export const translations = {
  en: {
    app: {
      name: 'CardioVault',
      subtitle: 'ICU & CCU Clinical Notebook',
    },

    nav: {
      home: 'Home',
      patients: 'Patients',
      beds: 'Beds',
      archive: 'Archive',
      settings: 'Settings',
      all: 'All',
      ccu: 'CCU',
      icu: 'ICU',
    },

    common: {
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      update: 'Update',
      search: 'Search',
      print: 'Print',
      export: 'Export',
      download: 'Download',
      confirm: 'Confirm',
      back: 'Back',
      yes: 'Yes',
      no: 'No',
      loading: 'Loading...',
      noData: 'No data available',
      unknown: 'Unknown',
      notAvailable: 'N/A',
      active: 'Active',
      inactive: 'Inactive',
      online: 'Online',
      offline: 'Offline',
      enabled: 'Enabled',
      disabled: 'Disabled',
      language: 'Language',
      english: 'English',
      arabic: 'العربية',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
      theme: 'Theme',
      date: 'Date',
      time: 'Time',
      status: 'Status',
      notes: 'Notes',
      details: 'Details',
    },

    dashboard: {
      title: 'Clinical Dashboard',
      overview: 'Unit Overview',
      totalBeds: 'Total Beds',
      occupiedBeds: 'Occupied',
      availableBeds: 'Available',
      critical: 'Critical',
      stable: 'Stable',
      guarded: 'Guarded',
      deteriorating: 'Deteriorating',
      postOp: 'Post-op',
      recentPatients: 'Recent Patients',
      noPatients: 'No patients found',
      occupancy: 'Occupancy',
    },

    patients: {
      title: 'Patients',
      patient: 'Patient',
      patientName: 'Patient Name',
      age: 'Age',
      gender: 'Gender',
      mrn: 'MRN',
      bed: 'Bed',
      admissionDate: 'Admission Date',
      diagnosis: 'Diagnosis',
      primaryDiagnosis: 'Primary Diagnosis',
      secondaryDiagnoses: 'Secondary Diagnoses',
      chiefComplaint: 'Chief Complaint',
      history: 'History',
      historyOfPresentIllness: 'History of Present Illness',
      pastMedicalHistory: 'Past Medical History',
      pastSurgicalHistory: 'Past Surgical History',
      drugHistory: 'Drug History',
      allergies: 'Allergies',
      familyHistory: 'Family History',
      socialHistory: 'Social History',
      examination: 'Examination',
      examinationSummary: 'Examination Summary',
      generalExamination: 'General Examination',
      cardiovascularExamination: 'Cardiovascular Examination',
      respiratoryExamination: 'Respiratory Examination',
      abdominalExamination: 'Abdominal Examination',
      cnsExamination: 'CNS Examination',
      peripheralVascularExamination: 'Peripheral Vascular Examination',
      otherExamination: 'Other Examination',
      attendingPhysician: 'Attending Physician',
      codeStatus: 'Code Status',
      noPatients: 'No patients found',
      searchPlaceholder: 'Search patients...',
      admit: 'Admit Patient',
      discharge: 'Discharge',
      readmit: 'Readmit',
      viewFile: 'View Patient File',
      patientFile: 'Patient File',
      printReport: 'Print / Export PDF',
    },

    vitals: {
      title: 'Vital Signs',
      heartRate: 'HR',
      bloodPressure: 'BP',
      map: 'MAP',
      respiratoryRate: 'RR',
      oxygenSaturation: 'SpO2',
      temperature: 'Temperature',
      cvp: 'CVP',
      rhythm: 'Rhythm',
    },

    io: {
      title: 'Input / Output',
      intake: 'Intake',
      output: 'Output',
      iv: 'IV',
      enteral: 'Enteral',
      oral: 'Oral',
      blood: 'Blood',
      other: 'Other',
      urine: 'Urine',
      drain: 'Drain',
      gi: 'GI',
      stool: 'Stool',
      totalIntake: 'Total Intake',
      totalOutput: 'Total Output',
      netBalance: 'Net Balance',
      runningBalance: 'Running Balance',
      dailyBalance: 'Daily Balance',
    },

    labs: {
      title: 'Laboratory Results',
      panel: 'Lab Panel',
      result: 'Result',
      unit: 'Unit',
      referenceRange: 'Reference Range',
      normal: 'Normal',
      high: 'High',
      low: 'Low',
      critical: 'Critical',
      cbc: 'CBC',
      chemistry: 'Chemistry',
      cardiac: 'Cardiac Markers',
      coagulation: 'Coagulation',
      inflammatory: 'Inflammatory Markers',
    },

    abg: {
      title: 'ABG',
      ph: 'pH',
      pco2: 'PaCO2',
      po2: 'PaO2',
      hco3: 'HCO3',
      be: 'BE',
      lactate: 'Lactate',
      fio2: 'FiO2',
      ratio: 'PaO2/FiO2',
      interpretation: 'Interpretation',
      ventilatorMode: 'Ventilator Mode',
    },

    cardiology: {
      title: 'CCU / Cardiology',
      ecg: 'ECG',
      echo: 'Echo',
      cath: 'Cath',
      stent: 'Stent',
      ecgSummary: 'ECG Summary',
      stElevation: 'ST Elevation Leads',
      arrhythmia: 'Arrhythmia',
      ef: 'EF',
      echoFindings: 'Echo Findings',
      cathDate: 'Cath Date',
      cathFindings: 'Cath Findings',
      culpritLesion: 'Culprit Lesion',
      stentType: 'Stent Type',
      stentDetails: 'Stent Details',
      antiplatelets: 'Antiplatelets',
      anticoagulation: 'Anticoagulation',
      timiFlow: 'TIMI Flow',
    },

    icu: {
      title: 'ICU',
      scores: 'ICU Scores',
      ventilator: 'Ventilator',
      gcs: 'GCS',
      rass: 'RASS',
      sofa: 'SOFA',
      pupils: 'Pupils',
      delirium: 'CAM-ICU',
      mode: 'Mode',
      peep: 'PEEP',
      tidalVolume: 'Tidal Volume',
      rate: 'Rate',
      totalRate: 'Total Rate',
      peakPressure: 'Ppeak',
      plateauPressure: 'Pplat',
      ettSize: 'ETT Size',
      ettDepth: 'ETT Depth',
    },

    treatment: {
      medications: 'Medications',
      infusions: 'Infusions',
      procedures: 'Procedures',
      consultations: 'Consultations',
    },

    documentation: {
      progressNotes: 'Progress Notes',
      dailyNotes: 'Daily Notes',
      clinicalEvents: 'Clinical Events',
      imaging: 'Imaging',
      dischargePlan: 'Discharge Plan',
      subjective: 'Subjective',
      objective: 'Objective',
      assessment: 'Assessment',
      plan: 'Plan',
      author: 'Author',
      indication: 'Indication',
      findings: 'Findings',
      impression: 'Impression',
    },

    settings: {
      title: 'Settings',
      language: 'Language',
      languageDescription: 'Choose the application language',
      theme: 'Appearance',
      themeDescription: 'Choose light, dark, or follow the device',
      bedConfiguration: 'Bed Configuration',
      security: 'Security',
      patientFields: 'Patient Fields',
      cloudSync: 'Cloud Sync',
      session: 'Session',
      totalBeds: 'Total Beds',
      saveBeds: 'Save Bed Configuration',
      lock: 'Lock App',
      logout: 'Logout',
    },

    pdf: {
      reportTitle: 'Patient Clinical Report',
      generatedBy: 'Generated by CardioVault',
      generatedAt: 'Generated At',
      unit: 'Unit',
      patientInformation: 'Patient Information',
      clinicalHistory: 'Clinical History',
      physicalExamination: 'Physical Examination',
      vitalSigns: 'Vital Signs',
      inputOutput: 'Input / Output',
      laboratoryResults: 'Laboratory Results',
      bloodGas: 'Arterial Blood Gas',
      cardiology: 'Cardiology',
      ecgStudies: 'ECG Studies',
      echoStudies: 'Echocardiography',
      imagingStudies: 'Imaging Studies',
      medications: 'Medications',
      infusions: 'Infusions',
      procedures: 'Procedures',
      progressNotes: 'Progress Notes',
      discharge: 'Discharge / Transfer',
      noInformation: 'No information available',
    },

    status: {
      stable: 'Stable',
      critical: 'Critical',
      guarded: 'Guarded',
      deteriorating: 'Deteriorating',
      postOp: 'Post-op',
      discharged: 'Discharged',
      empty: 'Empty',
    },

    messages: {
      saved: 'Saved successfully',
      deleted: 'Deleted successfully',
      saveFailed: 'Unable to save data',
      loadFailed: 'Unable to load data',
      invalidData:
        'Some stored data was invalid and has been safely migrated.',
      offline: 'You are currently offline',
      online: 'Connection restored',
      confirmDelete: 'Are you sure you want to delete this patient?',
      noInternet:
        'Internet connection is unavailable. Local data remains available.',
    },
  },

  ar: {
    app: {
      name: 'CardioVault',
      subtitle: 'دفتر الملاحظات السريرية للعناية المركزة والقلب',
    },

    nav: {
      home: 'الرئيسية',
      patients: 'المرضى',
      beds: 'الأسِرّة',
      archive: 'الأرشيف',
      settings: 'الإعدادات',
      all: 'الكل',
      ccu: 'CCU',
      icu: 'ICU',
    },

    common: {
      save: 'حفظ',
      cancel: 'إلغاء',
      close: 'إغلاق',
      delete: 'حذف',
      edit: 'تعديل',
      add: 'إضافة',
      update: 'تحديث',
      search: 'بحث',
      print: 'طباعة',
      export: 'تصدير',
      download: 'تنزيل',
      confirm: 'تأكيد',
      back: 'رجوع',
      yes: 'نعم',
      no: 'لا',
      loading: 'جارٍ التحميل...',
      noData: 'لا توجد بيانات',
      unknown: 'غير معروف',
      notAvailable: 'غير متاح',
      active: 'نشط',
      inactive: 'غير نشط',
      online: 'متصل',
      offline: 'غير متصل',
      enabled: 'مفعّل',
      disabled: 'غير مفعّل',
      language: 'اللغة',
      english: 'English',
      arabic: 'العربية',
      light: 'فاتح',
      dark: 'داكن',
      system: 'النظام',
      theme: 'المظهر',
      date: 'التاريخ',
      time: 'الوقت',
      status: 'الحالة',
      notes: 'ملاحظات',
      details: 'التفاصيل',
    },

    dashboard: {
      title: 'لوحة التحكم السريرية',
      overview: 'نظرة عامة على الوحدة',
      totalBeds: 'إجمالي الأسِرّة',
      occupiedBeds: 'مشغول',
      availableBeds: 'متاح',
      critical: 'حرج',
      stable: 'مستقر',
      guarded: 'تحت المراقبة',
      deteriorating: 'متدهور',
      postOp: 'ما بعد الجراحة',
      recentPatients: 'أحدث المرضى',
      noPatients: 'لا يوجد مرضى',
      occupancy: 'الإشغال',
    },

    patients: {
      title: 'المرضى',
      patient: 'مريض',
      patientName: 'اسم المريض',
      age: 'العمر',
      gender: 'النوع',
      mrn: 'رقم الملف',
      bed: 'السرير',
      admissionDate: 'تاريخ الدخول',
      diagnosis: 'التشخيص',
      primaryDiagnosis: 'التشخيص الأساسي',
      secondaryDiagnoses: 'التشخيصات الثانوية',
      chiefComplaint: 'الشكوى الرئيسية',
      history: 'التاريخ المرضي',
      historyOfPresentIllness: 'تاريخ المرض الحالي',
      pastMedicalHistory: 'التاريخ المرضي السابق',
      pastSurgicalHistory: 'التاريخ الجراحي السابق',
      drugHistory: 'التاريخ الدوائي',
      allergies: 'الحساسية',
      familyHistory: 'التاريخ العائلي',
      socialHistory: 'التاريخ الاجتماعي',
      examination: 'الفحص السريري',
      examinationSummary: 'ملخص الفحص',
      generalExamination: 'الفحص العام',
      cardiovascularExamination: 'فحص القلب والأوعية',
      respiratoryExamination: 'فحص الجهاز التنفسي',
      abdominalExamination: 'فحص البطن',
      cnsExamination: 'فحص الجهاز العصبي',
      peripheralVascularExamination: 'فحص الأوعية الطرفية',
      otherExamination: 'فحوصات أخرى',
      attendingPhysician: 'الطبيب المسؤول',
      codeStatus: 'حالة الإنعاش',
      noPatients: 'لا يوجد مرضى',
      searchPlaceholder: 'البحث عن مريض...',
      admit: 'دخول مريض',
      discharge: 'خروج',
      readmit: 'إعادة دخول',
      viewFile: 'فتح ملف المريض',
      patientFile: 'ملف المريض',
      printReport: 'طباعة / تصدير PDF',
    },

    vitals: {
      title: 'العلامات الحيوية',
      heartRate: 'HR',
      bloodPressure: 'BP',
      map: 'MAP',
      respiratoryRate: 'RR',
      oxygenSaturation: 'SpO2',
      temperature: 'الحرارة',
      cvp: 'CVP',
      rhythm: 'النظم',
    },

    io: {
      title: 'السوائل الداخلة والخارجة',
      intake: 'الداخل',
      output: 'الخارج',
      iv: 'وريدي',
      enteral: 'تغذية معوية',
      oral: 'فموي',
      blood: 'دم',
      other: 'أخرى',
      urine: 'بول',
      drain: 'درنقة',
      gi: 'جهاز هضمي',
      stool: 'براز',
      totalIntake: 'إجمالي الداخل',
      totalOutput: 'إجمالي الخارج',
      netBalance: 'صافي التوازن',
      runningBalance: 'التوازن التراكمي',
      dailyBalance: 'التوازن اليومي',
    },

    labs: {
      title: 'نتائج التحاليل',
      panel: 'مجموعة تحاليل',
      result: 'النتيجة',
      unit: 'الوحدة',
      referenceRange: 'المعدل المرجعي',
      normal: 'طبيعي',
      high: 'مرتفع',
      low: 'منخفض',
      critical: 'حرج',
      cbc: 'CBC',
      chemistry: 'كيمياء الدم',
      cardiac: 'مؤشرات القلب',
      coagulation: 'التجلط',
      inflammatory: 'مؤشرات الالتهاب',
    },

    abg: {
      title: 'غازات الدم الشرياني',
      ph: 'pH',
      pco2: 'PaCO2',
      po2: 'PaO2',
      hco3: 'HCO3',
      be: 'BE',
      lactate: 'Lactate',
      fio2: 'FiO2',
      ratio: 'PaO2/FiO2',
      interpretation: 'التفسير',
      ventilatorMode: 'وضع جهاز التنفس',
    },

    cardiology: {
      title: 'العناية القلبية / القلب والأوعية',
      ecg: 'ECG',
      echo: 'Echo',
      cath: 'قسطرة قلبية',
      stent: 'دعامة',
      ecgSummary: 'ملخص ECG',
      stElevation: 'مشتقات ارتفاع ST',
      arrhythmia: 'اضطراب النظم',
      ef: 'EF',
      echoFindings: 'نتائج Echo',
      cathDate: 'تاريخ القسطرة',
      cathFindings: 'نتائج القسطرة',
      culpritLesion: 'الآفة المسؤولة',
      stentType: 'نوع الدعامة',
      stentDetails: 'تفاصيل الدعامة',
      antiplatelets: 'مضادات الصفائح',
      anticoagulation: 'مضادات التجلط',
      timiFlow: 'تدفق TIMI',
    },

    icu: {
      title: 'العناية المركزة',
      scores: 'درجات تقييم الحالة',
      ventilator: 'جهاز التنفس الصناعي',
      gcs: 'GCS',
      rass: 'RASS',
      sofa: 'SOFA',
      pupils: 'الحدقات',
      delirium: 'CAM-ICU',
      mode: 'الوضع',
      peep: 'PEEP',
      tidalVolume: 'الحجم الجاري',
      rate: 'المعدل',
      totalRate: 'المعدل الكلي',
      peakPressure: 'Ppeak',
      plateauPressure: 'Pplat',
      ettSize: 'مقاس ETT',
      ettDepth: 'عمق ETT',
    },

    treatment: {
      medications: 'الأدوية',
      infusions: 'المحاليل الوريدية / التسريبات',
      procedures: 'الإجراءات',
      consultations: 'الاستشارات',
    },

    documentation: {
      progressNotes: 'ملاحظات المتابعة',
      dailyNotes: 'ملاحظات المتابعة اليومية',
      clinicalEvents: 'الأحداث السريرية',
      imaging: 'الأشعة والتصوير',
      dischargePlan: 'خطة الخروج',
      subjective: 'ذاتي',
      objective: 'موضوعي',
      assessment: 'التقييم',
      plan: 'الخطة',
      author: 'الطبيب',
      indication: 'الداعي للفحص',
      findings: 'النتائج',
      impression: 'الانطباع',
    },

    settings: {
      title: 'الإعدادات',
      language: 'اللغة',
      languageDescription: 'اختر لغة التطبيق',
      theme: 'المظهر',
      themeDescription: 'اختر المظهر الفاتح أو الداكن أو مظهر الجهاز',
      bedConfiguration: 'إعدادات الأسِرّة',
      security: 'الأمان',
      patientFields: 'حقول بيانات المريض',
      cloudSync: 'المزامنة السحابية',
      session: 'الجلسة',
      totalBeds: 'إجمالي الأسِرّة',
      saveBeds: 'حفظ إعدادات الأسِرّة',
      lock: 'قفل التطبيق',
      logout: 'تسجيل الخروج',
    },

    pdf: {
      reportTitle: 'التقرير السريري للمريض',
      generatedBy: 'تم إنشاء التقرير بواسطة CardioVault',
      generatedAt: 'تاريخ ووقت الإنشاء',
      unit: 'الوحدة',
      patientInformation: 'بيانات المريض',
      clinicalHistory: 'التاريخ المرضي',
      physicalExamination: 'الفحص السريري',
      vitalSigns: 'العلامات الحيوية',
      inputOutput: 'السوائل الداخلة والخارجة',
      laboratoryResults: 'نتائج التحاليل',
      bloodGas: 'غازات الدم الشرياني',
      cardiology: 'القلب والأوعية',
      ecgStudies: 'دراسات ECG',
      echoStudies: 'دراسات Echo',
      imagingStudies: 'دراسات التصوير',
      medications: 'الأدوية',
      infusions: 'التسريبات',
      procedures: 'الإجراءات',
      progressNotes: 'ملاحظات المتابعة',
      discharge: 'الخروج / النقل',
      noInformation: 'لا توجد معلومات متاحة',
    },

    status: {
      stable: 'مستقر',
      critical: 'حرج',
      guarded: 'تحت المراقبة',
      deteriorating: 'متدهور',
      postOp: 'ما بعد الجراحة',
      discharged: 'خرج',
      empty: 'فارغ',
    },

    messages: {
      saved: 'تم الحفظ بنجاح',
      deleted: 'تم الحذف بنجاح',
      saveFailed: 'تعذر حفظ البيانات',
      loadFailed: 'تعذر تحميل البيانات',
      invalidData:
        'تم العثور على بيانات قديمة أو غير مكتملة وتمت معالجتها بأمان.',
      offline: 'أنت غير متصل بالإنترنت حاليًا',
      online: 'تم استعادة الاتصال',
      confirmDelete: 'هل أنت متأكد من حذف هذا المريض؟',
      noInternet:
        'لا يوجد اتصال بالإنترنت. بياناتك المحلية ما زالت متاحة.',
    },
  },
} as const;

type TranslationTree = typeof translations.en;

let currentLanguage: AppLanguage = 'en';

type LanguageListener = () => void;

const languageListeners = new Set<LanguageListener>();

function notifyLanguageListeners(): void {
  languageListeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Ignore listener errors.
    }
  });
}

function subscribeToLanguage(listener: LanguageListener): () => void {
  languageListeners.add(listener);

  return () => {
    languageListeners.delete(listener);
  };
}

function getLanguageSnapshot(): AppLanguage {
  return currentLanguage;
}

function detectDeviceLanguage(): AppLanguage {
  if (typeof navigator === 'undefined') {
    return 'en';
  }

  const language =
    navigator.language ||
    (Array.isArray(navigator.languages) ? navigator.languages[0] : '');

  return language?.toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

export function getAppLanguage(): AppLanguage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_LANGUAGE);

    if (stored === 'ar' || stored === 'en') {
      currentLanguage = stored;
      return stored;
    }
  } catch {
    // Ignore storage errors.
  }

  currentLanguage = detectDeviceLanguage();
  return currentLanguage;
}

export function setAppLanguage(language: AppLanguage): void {
  currentLanguage = language;

  try {
    localStorage.setItem(STORAGE_KEY_LANGUAGE, language);
  } catch {
    // Ignore storage errors.
  }

  applyLanguageToDom(language);
  notifyLanguageListeners();
}

export function applyLanguageToDom(language: AppLanguage): void {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;

  root.lang = language;
  root.dir = language === 'ar' ? 'rtl' : 'ltr';

  root.classList.toggle('rtl', language === 'ar');
  root.classList.toggle('ltr', language === 'en');
}

export function initializeLanguage(): AppLanguage {
  const language = getAppLanguage();

  applyLanguageToDom(language);

  return language;
}

export function getCurrentLanguage(): AppLanguage {
  return currentLanguage;
}

/*
 * Compatibility alias.
 * main.tsx imports getLanguage, while the rest of the app
 * may use getAppLanguage / getCurrentLanguage.
 */
export function getLanguage(): AppLanguage {
  return getAppLanguage();
}

export function t<
  T extends TranslationTree = TranslationTree
>(
  path: string,
  language: AppLanguage = currentLanguage
): string {
  const source = translations[language] ?? translations.en;

  const value = path
    .split('.')
    .reduce<unknown>((current, key) => {
      if (
        current &&
        typeof current === 'object' &&
        key in current
      ) {
        return (current as Record<string, unknown>)[key];
      }

      return undefined;
    }, source);

  if (typeof value === 'string') {
    return value;
  }

  return path;
}

export function getDirection(
  language: AppLanguage
): 'rtl' | 'ltr' {
  return language === 'ar' ? 'rtl' : 'ltr';
}

export function getLanguageName(language: AppLanguage): string {
  return language === 'ar' ? 'العربية' : 'English';
}

export function useI18n() {
  const language = useSyncExternalStore(
    subscribeToLanguage,
    getLanguageSnapshot,
    getLanguageSnapshot
  );

  const translate = useCallback(
    (path: string): string => t(path, language),
    [language]
  );

  const setLanguage = useCallback(
    (nextLanguage: AppLanguage): void => {
      setAppLanguage(nextLanguage);
    },
    []
  );

  return {
    language,
    t: translate,
    direction: getDirection(language),
    setLanguage,
  };
}
