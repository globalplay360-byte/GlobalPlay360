import { useTranslation } from 'react-i18next';
import type { User } from '@/types';
import { Field, Input, Textarea } from './FormControls';
import Select from 'react-select';
import { Country, State, City } from 'country-state-city';
import { useMemo } from 'react';

// Define the darker custom styles explicitly matching our Dark SaaS theme
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

interface Props {
  formData: User;
  onChange: (patch: Partial<User>) => void;
  disabled?: boolean;
}

export default function CommonFields({ formData, onChange, disabled }: Props) {
  const { t } = useTranslation();
  
  // Format the country options from our downloaded database securely
  const countryOptions = useMemo(() => {
    return Country.getAllCountries().map((c) => ({
      value: c.isoCode,
      label: `${c.flag} ${c.name}`
    }));
  }, []);

  // Make sure we select the object correctly if formData.country already has a country code or name
  const currentCountryObj = useMemo(() => {
    if (!formData.country) return null;
    return countryOptions.find(o => o.value === formData.country || o.label.includes(formData.country!)) || null;
  }, [formData.country, countryOptions]);

  // Load States for the selected Country
  const stateOptions = useMemo(() => {
    if (!formData.country) return [];
    return State.getStatesOfCountry(formData.country).map(s => ({
      value: s.isoCode,
      label: s.name
    }));
  }, [formData.country]);

  const currentStateObj = useMemo(() => {
    if (!formData.state || !stateOptions.length) return null;
    return stateOptions.find(o => o.value === formData.state) || null;
  }, [formData.state, stateOptions]);

  // Load Cities for the selected Country & State
  const cityOptions = useMemo(() => {
    if (!formData.country || !formData.state) return [];
    return City.getCitiesOfState(formData.country, formData.state).map(c => ({
      value: c.name,
      label: c.name
    }));
  }, [formData.country, formData.state]);

  const currentCityObj = useMemo(() => {
    if (!formData.city || !cityOptions.length) return null;
    return cityOptions.find(o => o.value === formData.city) || null;
  }, [formData.city, cityOptions]);

  return (
    <section className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 sm:p-7 flex flex-col gap-5 sm:gap-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="w-1 h-5 rounded-md bg-[#FFC107] shadow-sm shadow-[#FFC107]/30" />
        <h2 className="text-lg sm:text-xl font-extrabold text-gray-100 tracking-tight">{t('profileEdit.fields.generalInfo', 'Informació general')}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <Field label={t('profileEdit.fields.displayName', 'Nom mostrat')}>
          <Input
            type="text"
            value={formData.displayName || ''}
            onChange={(e) => onChange({ displayName: e.target.value })}
            placeholder={t('profileEdit.placeholders.displayName', 'El teu nom públic')}
            disabled={disabled}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 z-20 relative">
        <div className="z-30">
          <Field label={t('profileEdit.fields.country', 'País')}>
            <Select
              styles={darkSelectStyles}
              options={countryOptions}
              value={currentCountryObj}
              onChange={(selectedOption: any) => {
                // When country changes, reset state and city
                onChange({ 
                  country: selectedOption ? selectedOption.value : '',
                  state: '',
                  city: ''
                });
              }}
              placeholder={t('profileEdit.placeholders.country', 'Cerca el teu país...')}
              isDisabled={disabled}
              isClearable
              noOptionsMessage={() => "Cap país trobat"}
              classNamePrefix="react-select"
            />
          </Field>
        </div>

        <div className="z-20">
          <Field label={t('profileEdit.fields.state', 'Província / Estat')}>
            <Select
              styles={darkSelectStyles}
              options={stateOptions}
              value={currentStateObj}
              onChange={(selectedOption: any) => {
                // When state changes, reset city
                onChange({ 
                  state: selectedOption ? selectedOption.value : '',
                  city: '' 
                });
              }}
              placeholder={t('profileEdit.placeholders.state', 'Selecciona estat...')}
              isDisabled={disabled || !formData.country}
              isClearable
              noOptionsMessage={() => "Cap estat trobat"}
              classNamePrefix="react-select"
            />
          </Field>
        </div>

        <div className="z-10">
          <Field label={t('profileEdit.fields.city', 'Ciutat')}>
            <Select
              styles={darkSelectStyles}
              options={cityOptions}
              value={currentCityObj}
              onChange={(selectedOption: any) => {
                onChange({ city: selectedOption ? selectedOption.value : '' });
              }}
              placeholder={t('profileEdit.placeholders.city', 'Selecciona ciutat...')}
              isDisabled={disabled || !formData.state}
              isClearable
              noOptionsMessage={() => "Cap ciutat trobada"}
              classNamePrefix="react-select"
            />
          </Field>
        </div>
      </div>

      <Field label={t('profileEdit.fields.bio', 'Biografia')} hint={t('profileEdit.hints.bio', 'Descriu la teva trajectòria, objectius i experiència.')}>
        <Textarea
          value={formData.bio || ''}
          onChange={(e) => onChange({ bio: e.target.value })}
          placeholder={t('profileEdit.placeholders.bio', 'Comparteix la teva història amb clubs i scouts...')}
          disabled={disabled}
        />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        <Field label={t('profileEdit.fields.phone', 'Telèfon')} hint={t('profileEdit.hints.phone', 'Visible per clubs premium.')}>
          <Input
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder={t('profileEdit.placeholders.phone', '+34 600 000 000')}
            disabled={disabled}
          />
        </Field>
        <Field label={t('profileEdit.fields.instagram', 'Instagram')} hint={t('profileEdit.hints.instagram', 'Handle o URL del perfil.')}>
          <Input
            type="text"
            value={formData.instagram || ''}
            onChange={(e) => onChange({ instagram: e.target.value })}
            placeholder={t('profileEdit.placeholders.instagram', '@elteucompte')}
            disabled={disabled}
          />
        </Field>
        <Field label={t('profileEdit.fields.youtube', 'Vídeo Highlights')} hint={t('profileEdit.hints.youtube', 'URL de YouTube amb la teva reel.')}>
          <Input
            type="url"
            value={formData.youtubeVideoUrl || ''}
            onChange={(e) => onChange({ youtubeVideoUrl: e.target.value })}
            placeholder={t('profileEdit.placeholders.youtube', 'https://youtube.com/watch?v=...')}
            disabled={disabled}
          />
        </Field>
      </div>
    </section>
  );
}

