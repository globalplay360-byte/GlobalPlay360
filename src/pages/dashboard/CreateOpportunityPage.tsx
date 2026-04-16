import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { createOpportunity } from '@/services/opportunities.service';
import { Button } from '@/components/ui/Button';
import type { Opportunity } from '@/types';
import EmptyState from '@/components/ui/EmptyState';

type FormData = Omit<Opportunity, 'id' | 'createdAt' | 'clubId'>;

const SPORT_OPTIONS = ['Football', 'Basketball', 'Tennis', 'Handball', 'Volleyball', 'Rugby', 'Swimming', 'Athletics'];
const GENDER_OPTIONS: { value: Opportunity['gender']; label: string }[] = [
  { value: 'male', label: 'Masculí' },
  { value: 'female', label: 'Femení' },
  { value: 'mixed', label: 'Mixt' },
];
const CONTRACT_OPTIONS: { value: Opportunity['contractType']; label: string }[] = [
  { value: 'pro', label: 'Professional' },
  { value: 'semi-pro', label: 'Semi-professional' },
  { value: 'amateur', label: 'Amateur' },
  { value: 'academy', label: 'Acadèmia' },
  { value: 'trial', label: 'Proves / Trial' },
];

const INITIAL_FORM: FormData = {
  title: '',
  sport: 'Football',
  gender: 'male',
  location: '',
  contractType: 'pro',
  description: '',
  requirements: [],
  status: 'open',
};

export default function CreateOpportunityPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [requirementInput, setRequirementInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guard: only clubs can access
  if (user?.role !== 'club') {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <EmptyState
          title="Accés restringit"
          description="Només els clubs poden publicar oportunitats."
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7z" />
            </svg>
          }
          action={
            <Button variant="primary" onClick={() => navigate('/dashboard/opportunities')}>
              Tornar al Marketplace
            </Button>
          }
        />
      </div>
    );
  }

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
    if (!user) return;

    // Basic validation
    if (!form.title.trim()) return setError('El títol és obligatori.');
    if (!form.location.trim()) return setError('La ubicació és obligatòria.');
    if (!form.description.trim()) return setError('La descripció és obligatòria.');

    try {
      setSubmitting(true);
      setError(null);
      const newId = await createOpportunity({
        ...form,
        clubId: user.uid,
      });
      navigate(`/dashboard/opportunities/${newId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error publicant la oportunitat.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full bg-[#0F172A] border border-[#1F2937] rounded-lg px-4 py-3 text-white text-sm placeholder:text-[#6B7280] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-colors';
  const labelClass = 'block text-sm font-medium text-[#9CA3AF] mb-1.5';

  return (
    <div className="p-6 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard/opportunities')}
          className="flex items-center text-sm text-[#9CA3AF] hover:text-white transition-colors mb-4"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Tornar al Marketplace
        </button>
        <h1 className="text-2xl font-bold text-white tracking-tight">Publicar Nova Oportunitat</h1>
        <p className="text-[#9CA3AF] mt-1 text-sm">
          Omple el formulari per publicar una oferta al marketplace.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card principal */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 space-y-5">

          {/* Títol */}
          <div>
            <label className={labelClass}>Títol de l'Oportunitat *</label>
            <input
              type="text"
              className={inputClass}
              placeholder="Ex: Davanter Centre per al Primer Equip"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
            />
          </div>

          {/* Sport + Gender + Contract — row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Esport *</label>
              <select
                className={inputClass}
                value={form.sport}
                onChange={(e) => updateField('sport', e.target.value)}
              >
                {SPORT_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Gènere *</label>
              <select
                className={inputClass}
                value={form.gender}
                onChange={(e) => updateField('gender', e.target.value as Opportunity['gender'])}
              >
                {GENDER_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Tipus de Contracte *</label>
              <select
                className={inputClass}
                value={form.contractType}
                onChange={(e) => updateField('contractType', e.target.value as Opportunity['contractType'])}
              >
                {CONTRACT_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Ubicació */}
          <div>
            <label className={labelClass}>Ubicació *</label>
            <input
              type="text"
              className={inputClass}
              placeholder="Ex: Barcelona, Spain"
              value={form.location}
              onChange={(e) => updateField('location', e.target.value)}
            />
          </div>

          {/* Descripció */}
          <div>
            <label className={labelClass}>Descripció *</label>
            <textarea
              className={`${inputClass} min-h-[120px] resize-y`}
              placeholder="Descriu l'oportunitat en detall: què busques, què ofereixes, condicions..."
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={5}
            />
          </div>
        </div>

        {/* Requisits — card separat */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-6 space-y-4">
          <label className={labelClass}>Requisits</label>
          <div className="flex gap-2">
            <input
              type="text"
              className={`${inputClass} flex-1`}
              placeholder="Ex: Menor de 23 anys"
              value={requirementInput}
              onChange={(e) => setRequirementInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addRequirement();
                }
              }}
            />
            <button
              type="button"
              onClick={addRequirement}
              className="px-4 py-3 bg-[#1F2937] hover:bg-[#374151] text-white text-sm font-medium rounded-lg transition-colors border border-[#374151]"
            >
              Afegir
            </button>
          </div>

          {form.requirements.length > 0 && (
            <ul className="flex flex-wrap gap-2 mt-2">
              {form.requirements.map((req, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-2 bg-[#0F172A] border border-[#1F2937] text-sm text-[#9CA3AF] px-3 py-1.5 rounded-lg"
                >
                  <span>{req}</span>
                  <button
                    type="button"
                    onClick={() => removeRequirement(idx)}
                    className="text-[#6B7280] hover:text-red-400 transition-colors"
                  >
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
          <Button
            variant="outline"
            type="button"
            onClick={() => navigate('/dashboard/opportunities')}
          >
            Cancel·lar
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Publicant...' : 'Publicar Oportunitat'}
          </Button>
        </div>
      </form>
    </div>
  );
}
