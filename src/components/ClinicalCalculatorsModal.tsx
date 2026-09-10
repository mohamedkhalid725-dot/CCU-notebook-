import React, { useState } from 'react';
import {
  Calculator,
  X,
  Activity,
  Flame,
  Droplets,
  HeartPulse,
  ShieldAlert,
  Wind,
  Zap,
  Info,
} from 'lucide-react';

import { CriticalCareCalcs } from './calculators/CriticalCareCalcs';
import { CardiologyCalcs } from './calculators/CardiologyCalcs';
import { ThromboembolismCalcs } from './calculators/ThromboembolismCalcs';
import { RenalRespiratoryCalcs } from './calculators/RenalRespiratoryCalcs';
import { ElectrolytesGeneralCalcs } from './calculators/ElectrolytesGeneralCalcs';
import { useI18n } from '../services/i18n';

interface ClinicalCalculatorsModalProps {
  onClose: () => void;
  onApplyScoreToPatient?: (data: {
    sofa?: number;
    gcs?: number;
    rass?: number;
  }) => void;
}

type CategoryId =
  | 'critical'
  | 'cardiology'
  | 'thrombo'
  | 'renal_resp'
  | 'electrolytes'
  | 'fluid';

export const ClinicalCalculatorsModal: React.FC<
  ClinicalCalculatorsModalProps
> = ({ onClose, onApplyScoreToPatient }) => {
  const { language, t } = useI18n();

  const [activeCategory, setActiveCategory] =
    useState<CategoryId>('critical');

  // Fluid Calculator State
  const [ivFluids, setIvFluids] = useState<number>(1500);
  const [enteralFeed, setEnteralFeed] = useState<number>(500);
  const [urineOutput, setUrineOutput] = useState<number>(1800);
  const [drainOutput, setDrainOutput] = useState<number>(0);
  const [patientWeight, setPatientWeight] = useState<number>(70);

  // ABG State
  const [abgPh, setAbgPh] = useState<number>(7.4);
  const [abgPco2, setAbgPco2] = useState<number>(40);
  const [abgHco3, setAbgHco3] = useState<number>(24);
  const [abgNa, setAbgNa] = useState<number>(140);
  const [abgCl, setAbgCl] = useState<number>(102);

  const isArabic = language === 'ar';

  const interpretAbg = () => {
    const anionGap = abgNa - (abgCl + abgHco3);
    const hasHighAG = anionGap > 12;
    const agValue = anionGap.toFixed(1);

    let primary = isArabic
      ? 'غازات الدم الشرياني طبيعية'
      : 'Normal arterial blood gas';

    if (abgPh < 7.35) {
      if (abgHco3 < 22 && abgPco2 <= 42) {
        if (hasHighAG) {
          primary = isArabic
            ? 'حماض أيضي بفجوة أنيونية مرتفعة (AG = ' +
              agValue +
              ' mmol/L)'
            : 'High Anion Gap Metabolic Acidosis (AG = ' +
              agValue +
              ' mmol/L)';
        } else {
          primary = isArabic
            ? 'حماض أيضي بفجوة أنيونية طبيعية (AG = ' +
              agValue +
              ')'
            : 'Normal Anion Gap Metabolic Acidosis (AG = ' +
              agValue +
              ')';
        }
      } else if (abgPco2 > 45) {
        primary = isArabic
          ? 'حماض تنفسي (احتباس CO2 / نقص التهوية)'
          : 'Respiratory Acidosis (CO2 retention / Hypoventilation)';
      } else {
        primary = isArabic ? 'حماض مختلط' : 'Mixed Acidosis';
      }
    } else if (abgPh > 7.45) {
      if (abgHco3 > 26) {
        primary = isArabic
          ? 'قلاء أيضي (زيادة القاعدة / انكماش الحجم)'
          : 'Metabolic Alkalosis (Excess base / Volume contraction)';
      } else if (abgPco2 < 35) {
        primary = isArabic
          ? 'قلاء تنفسي (فرط التهوية)'
          : 'Respiratory Alkalosis (Hyperventilation)';
      } else {
        primary = isArabic ? 'قلاء مختلط' : 'Mixed Alkalosis';
      }
    } else if (
      abgHco3 < 22 ||
      abgPco2 > 45 ||
      hasHighAG
    ) {
      primary = isArabic
        ? 'اضطراب حمضي-قاعدي معوَّض (AG = ' +
          agValue +
          ')'
        : 'Compensated Acid-Base Disturbance (AG = ' +
          agValue +
          ')';
    }

    return {
      primary,
      anionGap,
    };
  };

  const safeIvFluids = Number.isFinite(ivFluids)
    ? ivFluids
    : 0;

  const safeEnteralFeed = Number.isFinite(enteralFeed)
    ? enteralFeed
    : 0;

  const safeUrineOutput = Number.isFinite(urineOutput)
    ? urineOutput
    : 0;

  const safeDrainOutput = Number.isFinite(drainOutput)
    ? drainOutput
    : 0;

  const safePatientWeight =
    Number.isFinite(patientWeight) && patientWeight > 0
      ? patientWeight
      : 70;

  const netBalance =
    safeIvFluids +
    safeEnteralFeed -
    (safeUrineOutput + safeDrainOutput);

  const urinePerKgHr = (
    safeUrineOutput /
    (safePatientWeight * 24)
  ).toFixed(2);

  const abgAnalysis = interpretAbg();

  const categories: Array<{
    id: CategoryId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      id: 'critical',
      label: isArabic ? 'العناية المركزة' : 'Critical Care',
      icon: Flame,
    },
    {
      id: 'cardiology',
      label: isArabic ? 'أمراض القلب' : 'Cardiology',
      icon: HeartPulse,
    },
    {
      id: 'thrombo',
      label: isArabic
        ? 'الانسداد التجلطي'
        : 'Thromboembolism',
      icon: ShieldAlert,
    },
    {
      id: 'renal_resp',
      label: isArabic
        ? 'الكلى والتنفس'
        : 'Renal & Respiratory',
      icon: Wind,
    },
    {
      id: 'electrolytes',
      label: isArabic
        ? 'الشوارد والعلامات'
        : 'Electrolytes & General',
      icon: Zap,
    },
    {
      id: 'fluid',
      label: isArabic
        ? 'السوائل وغازات الدم'
        : 'Fluids & ABG',
      icon: Droplets,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Calculator className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>
                  {isArabic
                    ? 'الحاسبات السريرية'
                    : 'Clinical Calculators'}
                </span>

                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                  CardioVault v1.1.0
                </span>
              </h3>

              <p className="text-xs text-slate-400">
                {isArabic
                  ? 'حاسبات التقييم السريري للعناية المركزة وأمراض القلب'
                  : 'Evidence-based ICU/CCU prognostic risk and physiological scoring engine'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label={t('common.close')}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-4 py-2 border-b border-slate-800 bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;

            const tabClassName =
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ' +
              (activeCategory === cat.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60');

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={tabClassName}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">

          {activeCategory === 'critical' && (
            <CriticalCareCalcs
              onApplyScore={onApplyScoreToPatient}
            />
          )}

          {activeCategory === 'cardiology' && (
            <CardiologyCalcs />
          )}

          {activeCategory === 'thrombo' && (
            <ThromboembolismCalcs />
          )}

          {activeCategory === 'renal_resp' && (
            <RenalRespiratoryCalcs />
          )}

          {activeCategory === 'electrolytes' && (
            <ElectrolytesGeneralCalcs />
          )}

          {activeCategory === 'fluid' && (
            <div className="space-y-5">

              {/* Fluid Balance */}
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-cyan-400" />

                    <span>
                      {isArabic
                        ? 'توازن السوائل خلال 24 ساعة ومعدل إخراج البول'
                        : '24h Fluid Balance & Urine Output Rate'}
                    </span>
                  </h4>

                  <div className="text-right">
                    <span className="text-xs text-slate-400">
                      {isArabic
                        ? 'إخراج البول: '
                        : 'Urine Output: '}
                    </span>

                    <span className="text-sm font-bold text-emerald-400 font-mono">
                      {urinePerKgHr} mL/kg/hr
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400 font-medium">
                      {isArabic
                        ? 'صافي التوازن خلال 24 ساعة'
                        : '24h Net Balance'}
                    </div>

                    <div
                      className={
                        'text-2xl font-bold font-mono ' +
                        (netBalance >= 0
                          ? 'text-cyan-400'
                          : 'text-amber-400')
                      }
                    >
                      {netBalance > 0
                        ? '+' + netBalance
                        : netBalance}{' '}
                      mL
                    </div>
                  </div>

                  <div className="text-xs text-slate-400">
                    {isArabic
                      ? 'الهدف: إخراج البول > 0.5 mL/kg/hr'
                      : 'Target UO: > 0.5 mL/kg/hr'}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">

                  {/* Intake */}
                  <div className="space-y-2 p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="font-semibold text-cyan-300">
                      {isArabic
                        ? 'السوائل الداخلة (mL)'
                        : 'Intake (mL)'}
                    </span>

                    <div>
                      <label className="text-slate-400 block mb-0.5">
                        {isArabic
                          ? 'المحاليل الوريدية والترطيب'
                          : 'IV Fluids & Hydration'}
                      </label>

                      <input
                        type="number"
                        value={ivFluids}
                        onChange={(e) =>
                          setIvFluids(
                            Number(e.target.value)
                          )
                        }
                        className="w-full p-1.5 rounded bg-slate-950 border border-slate-800 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-0.5">
                        {isArabic
                          ? 'التغذية المعوية / الفموية'
                          : 'Enteral / Oral Intake'}
                      </label>

                      <input
                        type="number"
                        value={enteralFeed}
                        onChange={(e) =>
                          setEnteralFeed(
                            Number(e.target.value)
                          )
                        }
                        className="w-full p-1.5 rounded bg-slate-950 border border-slate-800 text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Output */}
                  <div className="space-y-2 p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="font-semibold text-rose-300">
                      {isArabic
                        ? 'السوائل الخارجة (mL)'
                        : 'Output (mL)'}
                    </span>

                    <div>
                      <label className="text-slate-400 block mb-0.5">
                        {isArabic
                          ? 'إخراج البول'
                          : 'Urine Output'}
                      </label>

                      <input
                        type="number"
                        value={urineOutput}
                        onChange={(e) =>
                          setUrineOutput(
                            Number(e.target.value)
                          )
                        }
                        className="w-full p-1.5 rounded bg-slate-950 border border-slate-800 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-0.5">
                        {isArabic
                          ? 'الدرنقات / أنبوب الأنف والمعدة'
                          : 'Surgical Drains / NG Tube'}
                      </label>

                      <input
                        type="number"
                        value={drainOutput}
                        onChange={(e) =>
                          setDrainOutput(
                            Number(e.target.value)
                          )
                        }
                        className="w-full p-1.5 rounded bg-slate-950 border border-slate-800 text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">
                    {isArabic
                      ? 'وزن المريض (kg):'
                      : 'Patient Weight (kg):'}
                  </span>

                  <input
                    type="number"
                    min="0"
                    value={patientWeight}
                    onChange={(e) =>
                      setPatientWeight(
                        Number(e.target.value)
                      )
                    }
                    className="w-20 p-1 rounded bg-slate-900 border border-slate-800 text-white font-mono text-center"
                  />
                </div>
              </div>

              {/* ABG Interpretation */}
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />

                  <span>
                    {isArabic
                      ? 'مفسر غازات الدم الشرياني (ABG) واضطرابات الحمض-القاعدة'
                      : 'Arterial Blood Gas (ABG) Acid-Base Interpreter'}
                  </span>
                </h4>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">
                    {isArabic
                      ? 'التفسير التشخيصي'
                      : 'Diagnostic Interpretation'}
                  </div>

                  <div className="text-sm font-bold text-emerald-400 mt-0.5">
                    {abgAnalysis.primary}
                  </div>

                  <div className="text-xs text-slate-400 mt-1">
                    Anion Gap:{' '}

                    <span className="text-white font-mono font-bold">
                      {abgAnalysis.anionGap.toFixed(1)} mmol/L
                    </span>

                    <span>
                      {isArabic
                        ? ' (الطبيعي: 8 - 12)'
                        : ' (Normal: 8 - 12)'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">

                  <div>
                    <label className="text-slate-400 block mb-0.5">
                      pH (7.35-7.45)
                    </label>

                    <input
                      type="number"
                      step="0.01"
                      value={abgPh}
                      onChange={(e) =>
                        setAbgPh(
                          Number(e.target.value)
                        )
                      }
                      className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-0.5">
                      PaCO₂ (35-45)
                    </label>

                    <input
                      type="number"
                      value={abgPco2}
                      onChange={(e) =>
                        setAbgPco2(
                          Number(e.target.value)
                        )
                      }
                      className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-0.5">
                      HCO₃⁻ (22-26)
                    </label>

                    <input
                      type="number"
                      value={abgHco3}
                      onChange={(e) =>
                        setAbgHco3(
                          Number(e.target.value)
                        )
                      }
                      className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-0.5">
                      Na⁺ (135-145)
                    </label>

                    <input
                      type="number"
                      value={abgNa}
                      onChange={(e) =>
                        setAbgNa(
                          Number(e.target.value)
                        )
                      }
                      className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-0.5">
                      Cl⁻ (96-106)
                    </label>

                    <input
                      type="number"
                      value={abgCl}
                      onChange={(e) =>
                        setAbgCl(
                          Number(e.target.value)
                        )
                      }
                      className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />

            <span>
              {isArabic
                ? 'جميع الحاسبات للأغراض الاسترشادية والتوثيق السريري فقط.'
                : 'All scoring tools are for clinical reference and guidance only.'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition shadow-sm"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
