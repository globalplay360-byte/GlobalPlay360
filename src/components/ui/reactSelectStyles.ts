import type { StylesConfig, GroupBase } from 'react-select';

export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Estils Dark SaaS Navy compartits per tots els `react-select` del projecte.
 * Tipats genèricament per acceptar qualsevol forma `{ value, label }`.
 */
export function darkSelectStyles<
  T extends SelectOption = SelectOption,
  IsMulti extends boolean = false,
>(): StylesConfig<T, IsMulti, GroupBase<T>> {
  return {
    control: (base, state) => ({
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
    menu: (base) => ({
      ...base,
      backgroundColor: '#1F2937',
      border: '1px solid #374151',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
      zIndex: 50,
    }),
    menuPortal: (base) => ({ ...base, zIndex: 60 }),
    option: (base, state) => ({
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
    singleValue: (base) => ({
      ...base,
      color: '#D1D5DB',
      fontSize: '0.875rem',
    }),
    input: (base) => ({
      ...base,
      color: '#D1D5DB',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#6B7280',
      fontSize: '0.875rem',
    }),
    indicatorSeparator: (base) => ({
      ...base,
      backgroundColor: '#374151',
    }),
  };
}
