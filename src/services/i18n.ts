import { useState, useEffect } from 'react';

export type Language = 'en' | 'ar';

export const STORAGE_KEY_LANG = 'icu_app_lang';

export const translations = {
  en: {
    // App Brand & Nav
    appName: 'CardioVault',
    appSubtitle: 'ICU & CCU Clinical Notebook',
    version: '1.1.0',
    allSystems: 'All Units',
    ccuMode: 'CCU Cardiology',
    icuMode: 'ICU Critical Care',
    activeBeds: 'Active Beds',
    dischargedArchive: 'Discharged Archive',
    patients: 'Patients',
    beds: 'Beds',
    archive: 'Archive',
    settings: 'Settings',
    calculators: 'Calculators',
    cloudAccount: 'Cloud Account',
    lockApp: 'Lock',
    logout: 'Logout',
    online: 'Online',
    offline: 'Offline',
    synced: 'Synced',
    syncing: 'Syncing...',
    syncError: 'Sync Error',

    // Census & Bed Management
    bedCensusTitle: 'ICU / CCU Bed Census',
    bedCensusSubtitle: 'Real-time bed occupancy, hemodynamics, patient acuity and bed allocation',
    archiveTitle: 'Medical Records Archive',
    archiveSubtitle: 'Permanent archive of discharged and transferred patient clinical files',
    totalBeds: 'Total Beds',
    occupiedBeds: 'Occupied',
    availableBeds: 'Available',
    criticalPatients: 'Critical',
    stablePatients: 'Stable',
    occupancyRate: 'Occupancy',
    searchPatientOrBed: 'Search by patient name, MRN, diagnosis, bed...',
    allStatus: 'All Status',
    occupiedOnly: 'Occupied Only',
    availableOnly: 'Available Only',
    criticalOnly: 'Critical Only',
    stableOnly: 'Stable Only',
    admitPatient: 'Admit Patient',
    configureBeds: 'Manage Beds',
    reassignBed: 'Move Bed',
    discharge: 'Discharge',
    readmit: 'Re-admit',
    viewFile: 'View File',
    noActiveBeds: 'No matching beds found',
    noArchivedPatients: 'No archived records found',
    emptyBed: 'Available Bed',
    clickToAdmit: 'Click to admit patient to this bed',
    bedNumber: 'Bed',
    department: 'Department',
    status: 'Status',
    primaryDiagnosis: 'Diagnosis',
    attendingPhysician: 'Attending Physician',
    admissionDate: 'Admission Date',

    // Patient File Navigation & Tabs
    patientFile: 'Patient Clinical File',
    tabOverview: 'Overview',
    tabHistory: 'History',
    tabExamination: 'Examination',
    tabVitalsIO: 'Vitals & I/O',
    tabLabs: 'Labs',
    tabABG: 'ABG',
    tabECG: 'ECG',
    tabEcho: 'Echo',
    tabImaging: 'Imaging',
    tabMedications: 'Medications',
    tabInfusions: 'Infusions',
    tabProcedures: 'Procedures',
    tabProgressNotes: 'Progress Notes',
    tabDischarge: 'Discharge',

    // Clinical History Fields
    chiefComplaint: 'Chief Complaint',
    hpi: 'History of Present Illness (HPI)',
    pmh: 'Past Medical History (PMH)',
    psh: 'Past Surgical History (PSH)',
    drugHistory: 'Drug History',
    drugAllergies: 'Drug Allergies',
    familyHistory: 'Family History',
    socialHistory: 'Social History',
    saveHistory: 'Save History',
    historySaved: 'Clinical history saved successfully',
    clearField: 'Clear',

    // Clinical Examination Fields
    generalExam: 'General Examination',
    cvsExam: 'Cardiovascular Examination (CVS)',
    rsExam: 'Respiratory Examination (RS)',
    abdExam: 'Abdominal Examination (GIT)',
    cnsExam: 'Neurological Examination (CNS)',
    pvdExam: 'Peripheral Vascular Examination',
    otherExam: 'Other Examination Findings',
    saveExam: 'Save Examination',
    examSaved: 'Examination findings saved successfully',

    // Labs
    addLab: 'Add Laboratory Test',
    editLab: 'Edit Lab Record',
    deleteLab: 'Delete Lab',
    testName: 'Test Name',
    result: 'Result',
    unit: 'Unit',
    refRange: 'Reference Range',
    flag: 'Flag',
    normal: 'Normal',
    high: 'High',
    low: 'Low',
    critical: 'Critical',
    dateTime: 'Date & Time',
    notes: 'Notes',
    customTest: 'Custom Test',
    selectPanel: 'Select Lab Panel',
    saveLab: 'Save Laboratory Record',
    deleteLabConfirm: 'Are you sure you want to delete this lab record?',

    // ABG
    addABG: 'Add ABG Record',
    editABG: 'Edit ABG',
    deleteABG: 'Delete ABG',
    ph: 'pH',
    paco2: 'PaCO₂ (mmHg)',
    pao2: 'PaO₂ (mmHg)',
    hco3: 'HCO₃⁻ (mmol/L)',
    be: 'Base Excess (BE)',
    lactate: 'Lactate (mmol/L)',
    sao2: 'SaO₂ (%)',
    fio2: 'FiO₂ (%)',
    interpretation: 'Interpretation',
    saveABG: 'Save ABG',

    // ECG
    addECG: 'Add ECG Record',
    editECG: 'Edit ECG',
    deleteECG: 'Delete ECG',
    rhythm: 'Rhythm',
    heartRate: 'Heart Rate (bpm)',
    axis: 'Axis',
    prInterval: 'PR Interval (ms)',
    qrsDuration: 'QRS Duration (ms)',
    qtInterval: 'QT (ms)',
    qtcInterval: 'QTc (ms)',
    stChanges: 'ST Segment Changes',
    tChanges: 'T Wave Changes',
    ecgAttachment: 'ECG Tracing Attachment',
    uploadECGImage: 'Upload ECG Image',
    saveECG: 'Save ECG Record',

    // Echo
    addEcho: 'Add Echocardiogram Study',
    editEcho: 'Edit Echo Study',
    deleteEcho: 'Delete Echo',
    ef: 'Ejection Fraction (LVEF %)',
    lvDimensions: 'LV Dimensions',
    lvSystolic: 'LV Systolic Function',
    rvAssessment: 'RV Assessment',
    tapse: 'TAPSE (mm)',
    laRa: 'LA / RA Dimensions',
    rwma: 'Regional Wall Motion (RWMA)',
    diastolicFunction: 'Diastolic Function',
    valvularAssessment: 'Valvular Assessment',
    pasp: 'Estimated PASP (mmHg)',
    ivc: 'IVC Collapsibility',
    pericardium: 'Pericardium / Effusion',
    findings: 'Key Findings',
    impression: 'Impression / Conclusion',
    saveEcho: 'Save Echo Study',

    // Imaging
    addImaging: 'Add Imaging Study',
    editImaging: 'Edit Imaging',
    deleteImaging: 'Delete Imaging',
    imagingType: 'Imaging Modality',
    cxr: 'Chest X-Ray (CXR)',
    ct: 'Computed Tomography (CT)',
    mri: 'Magnetic Resonance Imaging (MRI)',
    ultrasound: 'Ultrasound / POCUS',
    otherImaging: 'Other Imaging',
    uploadImage: 'Upload Image / Document',
    previewImage: 'Preview Image',
    replaceImage: 'Replace Attachment',
    deleteAttachment: 'Remove Attachment',
    saveImaging: 'Save Imaging Study',

    // Medications & Infusions
    addMedication: 'Add Medication',
    drugName: 'Drug Name',
    dose: 'Dose',
    route: 'Route',
    frequency: 'Frequency',
    startDate: 'Start Date',
    stopDate: 'Stop Date',
    activeMeds: 'Active Medications',
    addInfusion: 'Add Infusion',
    infusionDrug: 'Infusion Drug / Fluid',
    concentration: 'Concentration',
    rate: 'Rate',
    infusionUnit: 'Rate Unit',
    infusionStatus: 'Status',
    running: 'Running',
    titrating: 'Titrating',
    held: 'Held',
    stopped: 'Stopped',

    // Input / Output
    addIO: 'Add Fluid I/O Entry',
    intakeOral: 'Oral Intake (mL)',
    intakeIV: 'IV Fluids (mL)',
    intakeOther: 'Other Intake (mL)',
    totalIntake: 'Total Intake',
    outputUrine: 'Urine Output (mL)',
    outputDrains: 'Drains Output (mL)',
    outputOther: 'Other Output (mL)',
    totalOutput: 'Total Output',
    runningBalance: 'Running Net Balance',
    dailyBalance: '24h Fluid Balance',

    // Progress Notes
    addNote: 'Add Progress Note',
    noteAuthor: 'Author / Clinician',
    clinicalAssessment: 'Clinical Assessment',
    plan: 'Plan of Care',
    freeTextNotes: 'Detailed Notes',
    saveNote: 'Save Note',

    // Common Actions
    save: 'Save Changes',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    close: 'Close',
    confirm: 'Confirm',
    clear: 'Clear',
    add: 'Add',
    search: 'Search...',
    loading: 'Loading...',
    print: 'Print Clinical Summary',

    // Settings
    settingsTitle: 'CardioVault Settings',
    settingsSubtitle: 'Configure application theme, language, notifications, account, and security',
    theme: 'Theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSystem: 'System',
    language: 'Language',
    languageEn: 'English',
    languageAr: 'العربية',
    notifications: 'Notifications',
    enableNotifications: 'Enable Clinical Alerts',
    notificationDesc: 'Receive alerts on critical vital alarms, infusion stops, and round handovers',
    permissionAllowed: 'Permission Granted',
    permissionDenied: 'Permission Blocked',
    requestPermission: 'Request Permission',
    account: 'Account & Synchronization',
    contactUs: 'Contact Us',
    about: 'About CardioVault',
    aboutDesc: 'CardioVault is a state-of-the-art ICU & CCU clinical documentation and bedside decision support notebook designed for critical care physicians and cardiology teams.',
    versionLabel: 'Application Version',

    // Contact Us Modal
    contactTitle: 'Contact Us & Feedback',
    contactSubtitle: 'Get in touch with the CardioVault medical informatics team',
    contactEmail: 'Email Support',
    contactTelegram: 'Clinical Telegram Channel',
    contactPhone: 'Medical Helpline',
    subject: 'Subject',
    message: 'Message',
    sendEmail: 'Send Email',
    sendFeedback: 'Submit Message',
    feedbackSuccess: 'Thank you for your feedback! Our clinical support team will respond shortly.',

    // Authentication
    loginTitle: 'Clinical Access & Cloud Sync',
    signInWithGoogle: 'Sign in with Google',
    signInEmail: 'Sign In with Email',
    createAccount: 'Create Clinical Account',
    offlinePin: 'Offline Local PIN',
    offlinePinDesc: 'Work offline or quick bedside access via encrypted local PIN',
    loginSuccess: 'Logged in successfully',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    fullName: 'Dr. Full Name',
    enterPin: 'Enter 6-digit PIN',
  },
  ar: {
    // App Brand & Nav
    appName: 'CardioVault',
    appSubtitle: 'دفتر التوثيق السريري للعناية المركزة والقلبية',
    version: '1.1.0',
    allSystems: 'كافة الأقسام',
    ccuMode: 'عناية القلب CCU',
    icuMode: 'العناية المركزة ICU',
    activeBeds: 'الأسرة النشطة',
    dischargedArchive: 'أرشيف المرضى',
    patients: 'المرضى',
    beds: 'الأسرة',
    archive: 'الأرشيف',
    settings: 'الإعدادات',
    calculators: 'الحاسبات السريرية',
    cloudAccount: 'الحساب السحابي',
    lockApp: 'قفل الشاشة',
    logout: 'تسجيل الخروج',
    online: 'متصل بالإنترنت',
    offline: 'غير متصل (محلي)',
    synced: 'تمت المزامنة',
    syncing: 'جاري المزامنة...',
    syncError: 'خطأ بالمزامنة',

    // Census & Bed Management
    bedCensusTitle: 'سجل أسرة العناية المركزة والقلبية',
    bedCensusSubtitle: 'متابعة حية لشواغر الأسرة، الديناميكا الدموية، درجة خطورة المريض وتوزيع الحالات',
    archiveTitle: 'أرشيف السجلات الطبية',
    archiveSubtitle: 'سجل دائم للمرضى الذين تم تخريجهم أو تحويلهم خارج العناية',
    totalBeds: 'إجمالي الأسرة',
    occupiedBeds: 'مشغول',
    availableBeds: 'شاغر',
    criticalPatients: 'حالات حرجة',
    stablePatients: 'حالات مستقرة',
    occupancyRate: 'نسبة الإشغال',
    searchPatientOrBed: 'البحث باسم المريض، الرقم الطبي، التشخيص، السرير...',
    allStatus: 'جميع الحالات',
    occupiedOnly: 'الأسرة المشغولة',
    availableOnly: 'الأسرة الشاغرة',
    criticalOnly: 'الحالات الحرجة فقط',
    stableOnly: 'الحالات المستقرة فقط',
    admitPatient: 'إدخال مريض',
    configureBeds: 'إدارة وتعديل الأسرة',
    reassignBed: 'نقل إلى سرير آخر',
    discharge: 'تخريج المريض',
    readmit: 'إعادة إدخال',
    viewFile: 'فتح الملف السريري',
    noActiveBeds: 'لم يتم العثور على أسرة مطابقة',
    noArchivedPatients: 'لا يوجد مرضى في الأرشيف',
    emptyBed: 'سرير شاغر',
    clickToAdmit: 'اضغط لإدخال وتسكين مريض في هذا السرير',
    bedNumber: 'السرير',
    department: 'القسم',
    status: 'الحالة',
    primaryDiagnosis: 'التشخيص الرئيسي',
    attendingPhysician: 'الطبيب المعالج',
    admissionDate: 'تاريخ الدخول',

    // Patient File Navigation & Tabs
    patientFile: 'الملف السريري للمريض',
    tabOverview: 'نظرة عامة',
    tabHistory: 'القصة المرضية',
    tabExamination: 'الفحص السريري',
    tabVitalsIO: 'العلامات والصادر والوارد',
    tabLabs: 'المختبر والتحاليل',
    tabABG: 'غازات الدم ABG',
    tabECG: 'تخطيط القلب ECG',
    tabEcho: 'إيكو القلب Echo',
    tabImaging: 'الأشعة والتصوير',
    tabMedications: 'الأدوية والعلاجات',
    tabInfusions: 'التسريب الوريدي',
    tabProcedures: 'الإجراءات التداخلية',
    tabProgressNotes: 'الملاحظات اليومية',
    tabDischarge: 'خطة التخريج',

    // Clinical History Fields
    chiefComplaint: 'الشكوى الرئيسية',
    hpi: 'قصة المرض الحالي (HPI)',
    pmh: 'السوابق المرضية والطبية (PMH)',
    psh: 'السوابق الجراحية (PSH)',
    drugHistory: 'السوابق الدوائية',
    drugAllergies: 'التحسس الدوائي والغذائي',
    familyHistory: 'القصة العائلية',
    socialHistory: 'القصة الاجتماعية والعادات',
    saveHistory: 'حفظ القصة السريرية',
    historySaved: 'تم حفظ القصة المرضية بنجاح',
    clearField: 'مسح الحقل',

    // Clinical Examination Fields
    generalExam: 'الفحص العام والحالة العامة',
    cvsExam: 'فحص الجهاز القلبي الوعائي (CVS)',
    rsExam: 'فحص الجهاز التنفسي والرئتين (RS)',
    abdExam: 'فحص البطن والجهاز الهضمي (GIT)',
    cnsExam: 'فحص الجهاز العصبي ودرجة الوعي (CNS)',
    pvdExam: 'فحص الأوعية المحيطية والنبض',
    otherExam: 'موجودات سريرية أخرى',
    saveExam: 'حفظ الفحص السريري',
    examSaved: 'تم حفظ نتائج الفحص السريري بنجاح',

    // Labs
    addLab: 'إضافة تحليل مخبري',
    editLab: 'تعديل السجل المخبري',
    deleteLab: 'حذف التحليل',
    testName: 'اسم التحليل',
    result: 'النتيجة',
    unit: 'الوحدة',
    refRange: 'المجال المرجعي',
    flag: 'المستوى',
    normal: 'طبيعي',
    high: 'مرتفع',
    low: 'منخفض',
    critical: 'حرج جداً',
    dateTime: 'التاريخ والوقت',
    notes: 'ملاحظات',
    customTest: 'تحليل مخصص',
    selectPanel: 'اختر باقة التحاليل',
    saveLab: 'حفظ السجل المخبري',
    deleteLabConfirm: 'هل أنت متأكد من رغبتك في حذف هذا التحليل المخبري؟',

    // ABG
    addABG: 'إضافة تحليل غازات دم ABG',
    editABG: 'تعديل تحليل ABG',
    deleteABG: 'حذف تحليل ABG',
    ph: 'درجة الحموضة pH',
    paco2: 'ضغط ثاني أكسيد الكربون PaCO₂',
    pao2: 'ضغط الأكسجين الشرياني PaO₂',
    hco3: 'البيكربونات HCO₃⁻',
    be: 'الفائض القاعدي Base Excess',
    lactate: 'حمض اللاكتات Lactate',
    sao2: 'إشباع الأكسجين الشرياني SaO₂',
    fio2: 'نسبة الأكسجين المستنشق FiO₂',
    interpretation: 'تفسير وقراءة غازات الدم',
    saveABG: 'حفظ تحليل ABG',

    // ECG
    addECG: 'إضافة تخطيط قلب ECG',
    editECG: 'تعديل تخطيط ECG',
    deleteECG: 'حذف تخطيط ECG',
    rhythm: 'النظم القلبي',
    heartRate: 'معدل النبض (bpm)',
    axis: 'المحور الكهربائي Axis',
    prInterval: 'المسافة PR (ms)',
    qrsDuration: 'عرض مركب QRS (ms)',
    qtInterval: 'المسافة QT (ms)',
    qtcInterval: 'المسافة المصححة QTc (ms)',
    stChanges: 'تغيرات قطعة ST',
    tChanges: 'تغيرات موجة T',
    ecgAttachment: 'مرفق صورة تخطيط القلب',
    uploadECGImage: 'رفع صورة التخطيط',
    saveECG: 'حفظ سجل ECG',

    // Echo
    addEcho: 'إضافة فحص إيكو قلب Echo',
    editEcho: 'تعديل فحص الإيكو',
    deleteEcho: 'حذف فحص الإيكو',
    ef: 'الكسر القذفي للبطين الأيسر (LVEF %)',
    lvDimensions: 'أبعاد البطين الأيسر (LVEDD / LVESD)',
    lvSystolic: 'الوظيفة الانقباضية للبطين الأيسر',
    rvAssessment: 'تقييم البطين الأيمن',
    tapse: 'قياس تابس TAPSE (mm)',
    laRa: 'أبعاد الأذينتين (LA / RA)',
    rwma: 'اضطراب حركة الجدر الموضعية (RWMA)',
    diastolicFunction: 'الوظيفة الانبساطية',
    valvularAssessment: 'تقييم الصمامات القلبية',
    pasp: 'الضغط الرئوي التقديري (PASP mmHg)',
    ivc: 'الوريد الأجوف السفلي وقابلية الانخماص IVC',
    pericardium: 'التأمور وانصباب التأمور',
    findings: 'أهم الموجودات',
    impression: 'الخلاصة والتشخيص النهائي',
    saveEcho: 'حفظ فحص الإيكو',

    // Imaging
    addImaging: 'إضافة فحص أشعة / تصوير',
    editImaging: 'تعديل فحص الأشعة',
    deleteImaging: 'حذف فحص الأشعة',
    imagingType: 'نوع التصوير الشعاعي',
    cxr: 'أشعة الصدر البسيطة (CXR)',
    ct: 'الأشعة المقطعية المحوسبة (CT)',
    mri: 'الرنين المغناطيسي (MRI)',
    ultrasound: 'الأمواج فوق الصوتية / السونار (US/POCUS)',
    otherImaging: 'فحص شعاعي آخر',
    uploadImage: 'رفع الصورة / التقرير',
    previewImage: 'معاينة الصورة',
    replaceImage: 'استبدال المرفق',
    deleteAttachment: 'حذف المرفق',
    saveImaging: 'حفظ فحص الأشعة',

    // Medications & Infusions
    addMedication: 'إضافة دواء جديد',
    drugName: 'اسم الدواء التجاري / العلمي',
    dose: 'الجرعة',
    route: 'طريقة الإعطاء',
    frequency: 'التكرار',
    startDate: 'تاريخ البدء',
    stopDate: 'تاريخ الإيقاف',
    activeMeds: 'الأدوية الفعالة الحالية',
    addInfusion: 'إضافة تسريب وريدي مستمر',
    infusionDrug: 'مادة / سائل التسريب',
    concentration: 'التركيز',
    rate: 'معدل التسريب',
    infusionUnit: 'وحدة التسريب',
    infusionStatus: 'حالة التسريب',
    running: 'جاري التسريب',
    titrating: 'معايرة الجرعة',
    held: 'موقوف مؤقتاً',
    stopped: 'متوقف نهائياً',

    // Input / Output
    addIO: 'إضافة قيد صادر ووارد',
    intakeOral: 'الوارد الفموي (mL)',
    intakeIV: 'السوائل الوريدية (mL)',
    intakeOther: 'واردات أخرى (mL)',
    totalIntake: 'إجمالي الوارد',
    outputUrine: 'الصادر البولي (mL)',
    outputDrains: 'المفجرات والنزح (mL)',
    outputOther: 'صادرات أخرى (mL)',
    totalOutput: 'إجمالي الصادر',
    runningBalance: 'الرصيد التراكمي للسوائل',
    dailyBalance: 'رصيد سوائل 24 ساعة',

    // Progress Notes
    addNote: 'إضافة ملاحظة سريرية',
    noteAuthor: 'الطبيب / كاتب الملاحظة',
    clinicalAssessment: 'التقييم السريري الشامل',
    plan: 'الخطة العلاجية والدوائية',
    freeTextNotes: 'الملاحظات التفصيلية',
    saveNote: 'حفظ الملاحظة',

    // Common Actions
    save: 'حفظ التغييرات',
    edit: 'تعديل',
    delete: 'حذف',
    cancel: 'إلغاء',
    close: 'إغلاق',
    confirm: 'تأكيد',
    clear: 'مسح',
    add: 'إضافة',
    search: 'بحث...',
    loading: 'جاري التحميل...',
    print: 'طباعة الملخص السريري',

    // Settings
    settingsTitle: 'إعدادات CardioVault',
    settingsSubtitle: 'تخصيص المظهر، لغة التطبيق، الإشعارات، الحساب والأمان السريري',
    theme: 'المظهر والنمط',
    themeLight: 'فاتح (Light)',
    themeDark: 'داكن (Dark)',
    themeSystem: 'تلقائي حسب النظام (System)',
    language: 'لغة الواجهة',
    languageEn: 'English (الإنجليزية)',
    languageAr: 'العربية (Arabic)',
    notifications: 'التنبيهات السريرية',
    enableNotifications: 'تفعيل التنبيهات الفورية',
    notificationDesc: 'استقبال تنبيهات العلامات الحيوية الحرجة، توقف التسريبات، ومواعيد المرور اليومي',
    permissionAllowed: 'الإذن مفعل وممنوح',
    permissionDenied: 'تم رفض الإذن في المتصفح',
    requestPermission: 'طلب إذن الإشعارات',
    account: 'الحساب والمزامنة السحابية',
    contactUs: 'تواصل معنا',
    about: 'عن تطبيق CardioVault',
    aboutDesc: 'CardioVault هو مفكرة سريرية متقدمة ومنظومة توثيق رقمي لأطباء وفرق العناية المركزة والقلبية، مجهزة بحاسبات دقيقة وتوثيق فوري لخدمة المرضى.',
    versionLabel: 'إصدار التطبيق',

    // Contact Us Modal
    contactTitle: 'تواصل معنا والدعم الفني',
    contactSubtitle: 'تواصل مع فريق تطوير المعلوماتية السريرية لتطبيق CardioVault',
    contactEmail: 'البريد الإلكتروني للدعم',
    contactTelegram: 'قناة الدعم والتحديثات (Telegram)',
    contactPhone: 'خط الدعم الطبي',
    subject: 'الموضوع',
    message: 'نص الرسالة أو الاستفسار',
    sendEmail: 'إرسال عبر البريد',
    sendFeedback: 'إرسال الرسالة',
    feedbackSuccess: 'شكراً لتواصلك! سيقوم فريق الدعم الطبي بالرد في أقرب وقت.',

    // Authentication
    loginTitle: 'الدخول السريري والمزامنة السحابية',
    signInWithGoogle: 'تسجيل الدخول السريع عبر Google',
    signInEmail: 'تسجيل الدخول بالبريد الإلكتروني',
    createAccount: 'إنشاء حساب طبيب جديد',
    offlinePin: 'رمز PIN المحلي (بدون إنترنت)',
    offlinePinDesc: 'العمل بدون إنترنت أو الدخول السريع عند سرير المريض برمز PIN المحلي',
    loginSuccess: 'تم تسجيل الدخول بنجاح',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    fullName: 'الاسم الكامل واللقب الطبي',
    enterPin: 'أدخل رمز PIN المكون من 6 أرقام',
  }
};

export type TranslationKey = keyof typeof translations['en'];

export function getLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = localStorage.getItem(STORAGE_KEY_LANG);
    if (saved === 'ar' || saved === 'en') return saved;
    // Auto-detect browser language
    const browserLang = navigator.language || (navigator as any).userLanguage || '';
    if (browserLang.startsWith('ar')) return 'ar';
  } catch {}
  return 'en';
}

export function setLanguage(lang: Language): void {
  try {
    localStorage.setItem(STORAGE_KEY_LANG, lang);
  } catch {}
  applyLanguageToDom(lang);
  window.dispatchEvent(new CustomEvent('cardiovault-lang-change', { detail: lang }));
}

export function applyLanguageToDom(lang: Language): void {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  if (lang === 'ar') {
    document.documentElement.classList.add('rtl-mode');
  } else {
    document.documentElement.classList.remove('rtl-mode');
  }
}

export function t(key: TranslationKey, lang?: Language): string {
  const currentLang = lang || getLanguage();
  const dict = translations[currentLang] || translations.en;
  return (dict as any)[key] || (translations.en as any)[key] || key;
}

export function useI18n() {
  const [lang, setLangState] = useState<Language>(() => getLanguage());

  useEffect(() => {
    applyLanguageToDom(lang);

    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<Language>;
      if (customEvent.detail) {
        setLangState(customEvent.detail);
      } else {
        setLangState(getLanguage());
      }
    };

    window.addEventListener('cardiovault-lang-change', handleLangChange);
    return () => window.removeEventListener('cardiovault-lang-change', handleLangChange);
  }, [lang]);

  const changeLanguage = (newLang: Language) => {
    setLangState(newLang);
    setLanguage(newLang);
  };

  return {
    lang,
    isRtl: lang === 'ar',
    t: (key: TranslationKey) => t(key, lang),
    setLanguage: changeLanguage,
    setLang: changeLanguage,
  };
}
