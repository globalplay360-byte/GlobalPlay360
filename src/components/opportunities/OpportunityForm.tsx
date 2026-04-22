import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import type { Opportunity } from '@/types';
import Select from 'react-select';
import { Country, State, City } from 'country-state-city';

type FormData = Omit<Opportunity, 'id' | 'createdAt' | 'clubId'>;

const SPORT_OPTIONS = ['Football', 'Basketball', 'Tennis', 'Handball', 'Volleyball', 'Rugby', 'Swimming', 'Athletics'];

export const INITIAL_FORM: FormData = {
  title: '',
  sport: 'Football',
  gender: 'male',
  country: '',
  state: '',
  city: '',
  contractType: 'pro',
  description: '',
  requirements: [],
  status: 'open',
};

const darkSelectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    backgroundColor: '#0F172A',
    borderColor: state.isFocused ? '#3B82F6' : '#1F2937',
    '&:hover': {
      borderColor: state.isFocused ? '#3B82F6' : '#374151',
    },
    boxShadow: state.isFocused ? '0 0 0 1px #3B82F6' : 'none',
    borderRadius: '0.5rem',
    minHeight: '44px',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    opacity: state.isDisabled ? 0.5 : 1,
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: '#1F2937',
    border: '1px solid #374151',
    borderRadius: '0.5rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
    zIndex: 50,
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected 
      ? '#3B82F6' 
      : state.isFocused 
        ? '#374151' 
        : 'transparent',
    color: state.isSelected ? '#ffffff' : '#D1D5DB',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: '#2563EB',
    },
  }),
  singleValue: (base: any) => ({
    ...base,
    color: '#D1D5DB',
    fontSize: '0.875rem'
  }),
  input: (base: any) => ({
    ...base,
    color: '#D1D5DB',
  }),
  placeholder: (base: any) => ({
    ...base,
    color: '#6B7280',
    fontSize: '0.875rem'
  }),
  indicatorSeparator: (base: any) => ({
    ...base,
    backgroundColor: '#374151',
  })
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

  const countryOptions = useMemo(() => {
    return Country.getAllCountries().map((c) => ({
      value: c.isoCode,
      label: `${c.flag} ${c.name}`
    }));
  }, []);

  const currentCountryObj = useMemo(() => {
    if (!form.country) return null;
    return countryOptions.find(o => o.value === form.country || o.label.includes(form.country!)) || null;
  }, [form.country, countryOptions]);

  const stateOptions = useMemo(() => {
    if (!form.country) return [];
    return State.getStatesOfCountry(form.country).map(s => ({
      value: s.isoCode,
      label: s.name
    }));
  }, [form.country]);

  const currentStateObj = useMemo(() => {
    if (!form.state || !stateOptions.length) return null;
    return stateOptions.find(o => o.value === form.state) || null;
  }, [form.state, stateOptions]);

  const cityOptions = useMemo(() => {
    if (!form.country || !form.state) return [];
    return City.getCitiesOfState(form.country, form.state).map(c => ({
      value: c.name,
      label: c.name
    }));
  }, [form.country, form.state]);

  const currentCityObj = useMemo(() => {
    if (!form.city || !cityOptions.length) return null;
    return cityOptions.find(o => o.value === form.city) || null;
  }, [form.city, cityOptions]);

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

    if (!form.title.trim()) return setError(t("opportunityForm.errors.titleRequired", "El títol és obligatori"));
    if (!form.country) return setError(t("opportunityForm.errors.locationRequired", "La ubicació és obligatòria"));
    if (!form.description.trim()) return setError(t("opportunityForm.errors.descRequired", "La descripció és obligatòria"));

    try {
      setSubmitting(true);
      setError(null);
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("opportunityForm.errors.saveError", "Error al desar"));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full bg-[#0F172A] border border-[#1F2937] rounded-lg px-3 py-2.5 sm:px-4 sm:py-3 text-gray-100 text-sm placeholder:text-[#6B7280] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] hover:border-[#374151] transition-all duration-fast ease-out shadow-sm';
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-50">
          <div>
            <label className={labelClass}>{t("opportunityForm.fields.country", "Country *")}</label>
            <div className="relative">
              <Select
                styles={darkSelectStyles}
                options={countryOptions}
                value={currentCountryObj}
                placeholder={t('opportunityForm.placeholders.country', 'Select country...')}
                onChange={(selected: any) => {
                  setForm(prev => ({
                    ...prev,
                    country: selected ? selected.value : '',
                    state: '',
                    city: ''
                  }));
                }}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>{t("opportunityForm.fields.state", "State / Province")}</label>
            <Select
              styles={darkSelectStyles}
              options={stateOptions}
              value={currentStateObj}
              placeholder={t('opportunityForm.placeholders.state', 'Select state...')}
              onChange={(selected: any) => {
                setForm(prev => ({
                  ...prev,
                  state: selected ? selected.value : '',
                  city: ''
                }));
              }}
              isDisabled={!form.country}
            />
          </div>
          <div>
            <label className={labelClass}>{t("opportunityForm.fields.city", "City")}</label>
            <Select
              styles={darkSelectStyles}
              options={cityOptions}
              value={currentCityObj}
              placeholder={t('opportunityForm.placeholders.city', 'Select city...')}
              onChange={(selected: any) => updateField('city', selected ? selected.value : '')}
              isDisabled={!form.state}
            />
          </div>
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
            className="px-3 py-2.5 sm:px-4 sm:py-3 bg-[#1F2937] hover:bg-[#374151] text-gray-100 text-sm font-medium rounded-lg transition-all duration-fast ease-out active:scale-[0.98] border border-[#374151] shadow-sm"
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






