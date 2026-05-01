import { useTranslation } from 'react-i18next';
import { Field, Select } from './FormControls';
import type { Handedness, StickHand } from '@/types';

type HandFieldKind =
  | 'preferredFoot'   // football, futsal — "Cama bona"
  | 'preferredHand'   // handball, waterpolo — "Mà preferida"
  | 'playingHand'     // tennis — "Mà dominant"
  | 'stickHand';      // hockey — "Mà del stick" (només dret/esquerre)

interface HandSelectProps<V extends Handedness | StickHand> {
  kind: HandFieldKind;
  value: V | undefined;
  onChange: (v: V | undefined) => void;
  disabled?: boolean;
  hint?: string;
}

const LABEL_KEY: Record<HandFieldKind, string> = {
  preferredFoot: 'profileEdit.fields.preferredFoot',
  preferredHand: 'profileEdit.fields.preferredHand',
  playingHand: 'profileEdit.fields.playingHand',
  stickHand: 'profileEdit.fields.stickHand',
};

const LABEL_FALLBACK: Record<HandFieldKind, string> = {
  preferredFoot: 'Cama bona',
  preferredHand: 'Mà preferida',
  playingHand: 'Mà dominant',
  stickHand: 'Mà del stick',
};

export function HandSelect<V extends Handedness | StickHand>({
  kind,
  value,
  onChange,
  disabled,
  hint,
}: HandSelectProps<V>) {
  const { t } = useTranslation();
  // L'hoquei restringeix el tipus a 'left' | 'right' (StickHand). La resta de
  // selectors permeten 'both' (Handedness).
  const includeBoth = kind !== 'stickHand';
  // Tennis usa Dretà/Esquerrà (formes adjectivades); la resta usa Dret/Esquerre.
  const useAdjectiveForm = kind === 'playingHand';

  return (
    <Field label={t(LABEL_KEY[kind], LABEL_FALLBACK[kind])} hint={hint}>
      <Select
        value={value || ''}
        onChange={(e) => onChange((e.target.value || undefined) as V | undefined)}
        disabled={disabled}
      >
        <option value="">{t('profileEdit.fields.selectPlaceholder', 'Selecciona...')}</option>
        <option value="right">
          {useAdjectiveForm
            ? t('profileEdit.fields.rightHanded', 'Dretà')
            : t('profileEdit.fields.right', 'Dreta')}
        </option>
        <option value="left">
          {useAdjectiveForm
            ? t('profileEdit.fields.leftHanded', 'Esquerrà')
            : t('profileEdit.fields.left', 'Esquerra')}
        </option>
        {includeBoth && (
          <option value="both">{t('profileEdit.fields.both', 'Ambidextre')}</option>
        )}
      </Select>
    </Field>
  );
}
