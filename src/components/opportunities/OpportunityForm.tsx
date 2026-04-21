import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import type { Opportunity } from '@/types';

type FormData = Omit<Opportunity, 'id' | 'createdAt' | 'clubId'>;

const SPORT_OPTIONS = ['Football', 'Basketball', 'Tennis', 'Handball', 'Volleyball', 'Rugby', 'Swimming', 'Athletics'];



export const INITIAL_FORM: FormData = {
  title: '',
  sport: 'Football',
  gender: 'male',
  location: '',
  contractType: 'pro',
  description: '',
  requirements: [],
  status: 'open',
};

interface OpportunityFormProps {
  initialData?: FormData;
  onSubmit: (data: FormData) => Promise<void>;
  submitLabel: string;
  submittingLabel: string;
  onCancel: () => void;
}

const GENDER_OPTIONS = [
  { value: 'male' },
  { value: 'female' },
  { value: 'mixed' },
];

const CONTRACT_OPTIONS = [
  { value: 'pro' },
  { value: 'semi-pro' },
  { value: 'amateur' },
  { value: 'academy' },
  { value: 'trial' },
];

export default function OpportunityForm({
  initialData,
  onSubmit,
  submitLabel,
  submittingLabel,
  onCancel,
}: OpportunityFormProps) {
  const [form, setForm] = useState<FormData>(initialData ?? INITIAL_FORM);
  const { t } = useTranslation();
  const [requirementInput, setRequirementInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addRequirement = () => {
    const trimmed = requirementInput.trim();
    if (!trimmed) return;
    updateField('requirements', [...form.requirements, trimmed]);
    setRequirementInput('');
  };

  const removeRequirement = (index: number) => {
    updateField('requirements', form.requirements.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) return setError('t("opportunityForm.errors.titleRequired")');
    if (!form.location.trim()) return setError('t("opportunityForm.errors.locationRequired")');
    if (!form.description.trim()) return setError('t("opportunityForm.errors.descRequired")');

    try {
      setSubmitting(true);
      setError(null);
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 't("opportunityForm.errors.saveError")');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full bg-[#0F172A] border border-[#1F2937] rounded-lg px-3 py-2.5 sm:px-4 sm:py-3 text-white text-sm placeholder:text-[#6B7280] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] hover:border-[#374151] transition-all duration-fast ease-out shadow-sm';
  const labelClass = 'block text-sm font-semibold text-[#9CA3AF] mb-1.5 tracking-wide';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4 sm:p-6 space-y-4 sm:space-y-5">
        {/* Títol */}
        <div>
          <label className={labelClass}>{t("opportunityForm.fields.titleLabel")}</label>
          <input
            type="text"
            className={inputClass}
            placeholder={t("opportunityForm.fields.titlePlaceholder")}
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
          />
        </div>

        {/* Sport + Gender + Contract */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>{t("opportunityForm.fields.sportLabel")}</label>
            <select className={inputClass} value={form.sport} onChange={(e) => updateField('sport', e.target.value)}>
              {SPORT_OPTIONS.map((s) => <option key={s} value={s}>{t("profile.sports." + s.toLowerCase())}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>{t("opportunityForm.genderLabel")}</label>
            <select className={inputClass} value={form.gender} onChange={(e) => updateField('gender', e.target.value as Opportunity['gender'])}>
              {GENDER_OPTIONS.map((g) => <option key={g.value} value={g.value}>{t("opportunityForm.gender." + g.value)}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>{t("opportunityForm.contractLabel")}</label>
            <select className={inputClass} value={form.contractType} onChange={(e) => updateField('contractType', e.target.value as Opportunity['contractType'])}>
              {CONTRACT_OPTIONS.map((c) => <option key={c.value} value={c.value}>{t("opportunityForm.contractOptions." + c.value)}</option>)}
            </select>
          </div>
        </div>

        {/* Ubicació */}
        <div>
          <label className={labelClass}>{t("opportunityForm.locationLabel", "Ubicació *")}</label>
          <input
            type="text"
            className={inputClass}
            placeholder={t("opportunityForm.fields.locationPlaceholder", "Ex: Barcelona, Spain")}
            value={form.location}
            onChange={(e) => updateField('location', e.target.value)}
          />
        </div>

        {/* Descripció */}
        <div>
          <label className={labelClass}>{t("opportunityForm.descLabel", "Descripció *")}</label>
          <textarea
            className={`${inputClass} min-h-[120px] resize-y`}
            placeholder={t("opportunityForm.fields.descPlaceholder", "Descriu l'oportunitat en detall: què busques, què ofereixes, condicions...")}
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={5}
          />
        </div>
      </div>

      {/* Requisits */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4 sm:p-6 space-y-3 sm:space-y-4">
        <label className={labelClass}>{t("opportunityForm.requirementsLabel", "Requisits")}</label>
        <div className="flex gap-2">
          <input
            type="text"
            className={`${inputClass} flex-1`}
            placeholder={t("opportunityForm.fields.requirementsPlaceholder", "Ex: Menor de 23 anys")}
            value={requirementInput}
            onChange={(e) => setRequirementInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); addRequirement(); }
            }}
          />
          <button
            type="button"
            onClick={addRequirement}
            className="px-3 py-2.5 sm:px-4 sm:py-3 bg-[#1F2937] hover:bg-[#374151] text-white text-sm font-medium rounded-lg transition-all duration-fast ease-out active:scale-[0.98] border border-[#374151] shadow-sm"
          >
            {t("opportunityForm.addBtn", "Afegir")}
          </button>
        </div>

        {form.requirements.length > 0 && (
          <ul className="flex flex-wrap gap-2 mt-2">
            {form.requirements.map((req, idx) => (
              <li key={idx} className="flex items-center gap-2 bg-[#0F172A] border border-[#1F2937] text-sm text-[#9CA3AF] px-3 py-1.5 rounded-lg">
                <span>{req}</span>
                <button type="button" onClick={() => removeRequirement(idx)} className="text-[#6B7280] hover:text-red-400 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="outline" type="button" onClick={onCancel} className="transition-all duration-fast active:scale-[0.98]">
          {t("opportunityForm.cancelBtn")}
        </Button>
        <Button variant="primary" type="submit" disabled={submitting} className="shadow-md hover:shadow-lg hover:shadow-[#3B82F6]/20 transition-all duration-base active:scale-[0.98]">
          {submitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}






