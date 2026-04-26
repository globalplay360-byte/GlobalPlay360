import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import Select, { type SingleValue } from 'react-select';
import { Country, State, City } from 'country-state-city';
import type { User } from '@/types';
import { Field, Input, Textarea } from './FormControls';
import { FormSection } from './FormSection';
import { darkSelectStyles, type SelectOption } from '@/components/ui/reactSelectStyles';

interface Props {
  formData: User;
  onChange: (patch: Partial<User>) => void;
  disabled?: boolean;
}

const styles = darkSelectStyles<SelectOption, false>();

export default function CommonFields({ formData, onChange, disabled }: Props) {
  const { t } = useTranslation();

  const countryOptions = useMemo<SelectOption[]>(
    () =>
      Country.getAllCountries().map((c) => ({
        value: c.isoCode,
        label: `${c.flag} ${c.name}`,
      })),
    []
  );

  const currentCountryObj = useMemo(() => {
    if (!formData.country) return null;
    return countryOptions.find((o) => o.value === formData.country) ?? null;
  }, [formData.country, countryOptions]);

  const stateOptions = useMemo<SelectOption[]>(() => {
    if (!formData.country) return [];
    return State.getStatesOfCountry(formData.country).map((s) => ({
      value: s.isoCode,
      label: s.name,
    }));
  }, [formData.country]);

  const currentStateObj = useMemo(() => {
    if (!formData.state || !stateOptions.length) return null;
    return stateOptions.find((o) => o.value === formData.state) ?? null;
  }, [formData.state, stateOptions]);

  const cityOptions = useMemo<SelectOption[]>(() => {
    if (!formData.country || !formData.state) return [];
    return City.getCitiesOfState(formData.country, formData.state).map((c) => ({
      value: c.name,
      label: c.name,
    }));
  }, [formData.country, formData.state]);

  const currentCityObj = useMemo(() => {
    if (!formData.city || !cityOptions.length) return null;
    return cityOptions.find((o) => o.value === formData.city) ?? null;
  }, [formData.city, cityOptions]);

  const handleCountryChange = (option: SingleValue<SelectOption>) => {
    onChange({
      country: option ? option.value : '',
      state: '',
      city: '',
    });
  };

  const handleStateChange = (option: SingleValue<SelectOption>) => {
    onChange({
      state: option ? option.value : '',
      city: '',
    });
  };

  const handleCityChange = (option: SingleValue<SelectOption>) => {
    onChange({ city: option ? option.value : '' });
  };

  return (
    <FormSection title={t('profileEdit.fields.generalInfo', 'Informació general')}>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        <Field label={t('profileEdit.fields.country', 'País')}>
          <Select
            styles={styles}
            options={countryOptions}
            value={currentCountryObj}
            onChange={handleCountryChange}
            placeholder={t('profileEdit.placeholders.country', 'Cerca el teu país...')}
            isDisabled={disabled}
            isClearable
            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
            noOptionsMessage={() => t('profileEdit.noOptions.country', 'Cap país trobat')}
            classNamePrefix="react-select"
          />
        </Field>

        <Field label={t('profileEdit.fields.state', 'Província / Estat')}>
          <Select
            styles={styles}
            options={stateOptions}
            value={currentStateObj}
            onChange={handleStateChange}
            placeholder={t('profileEdit.placeholders.state', 'Selecciona estat...')}
            isDisabled={disabled || !formData.country}
            isClearable
            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
            noOptionsMessage={() => t('profileEdit.noOptions.state', 'Cap estat trobat')}
            classNamePrefix="react-select"
          />
        </Field>

        <Field label={t('profileEdit.fields.city', 'Ciutat')}>
          <Select
            styles={styles}
            options={cityOptions}
            value={currentCityObj}
            onChange={handleCityChange}
            placeholder={t('profileEdit.placeholders.city', 'Selecciona ciutat...')}
            isDisabled={disabled || !formData.state}
            isClearable
            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
            noOptionsMessage={() => t('profileEdit.noOptions.city', 'Cap ciutat trobada')}
            classNamePrefix="react-select"
          />
        </Field>
      </div>

      <Field
        label={t('profileEdit.fields.bio', 'Biografia')}
        hint={t('profileEdit.hints.bio', 'Descriu la teva trajectòria, objectius i experiència.')}
      >
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
    </FormSection>
  );
}
