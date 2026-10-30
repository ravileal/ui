import { useId, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { Badge } from './Badge';
import Button from './Button';
import Dropdown from './Dropdown';
import TextInput from './TextInput';

export interface RegexPreset {
  id?: string;
  label: string;
  pattern: string;
  flags?: string;
  description?: string;
}

export interface RegexFieldProps {
  label: ReactNode;
  value: string;
  onChange: (pattern: string, flags?: string) => void;
  flags?: string;
  onFlagsChange?: (flags: string) => void;
  helpText?: ReactNode;
  requiredGroups?: string[];
  presets?: RegexPreset[];
  sampleText?: string;
  maxLength?: number;
  disabled?: boolean;
  error?: string | null;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

const FLAGS = [
  { flag: 'i', title: 'Case-insensitive', description: 'Ignora maiúsculas/minúsculas' },
  { flag: 'm', title: 'Multiline', description: '^ e $ casam início/fim de linha' },
  { flag: 's', title: 'DotAll', description: '. casa quebras de linha' },
  { flag: 'u', title: 'Unicode', description: 'Modo Unicode completo' },
];

function validate(
  pattern: string,
  flags: string,
  requiredGroups: string[],
  maxLength: number,
): string | null {
  if (!pattern.trim()) return 'Expressão regular não pode ser vazia.';
  if (pattern.length > maxLength) {
    return `Limite de ${maxLength} caracteres excedido (${pattern.length}/${maxLength}).`;
  }
  if (/[^imsu]/.test(flags)) {
    return `Flags inválidas (${flags}). Permitidas apenas i, m, s, u.`;
  }
  try {
    new RegExp(pattern, flags);
  } catch (err) {
    return `Regex inválida: ${(err as Error).message}`;
  }
  for (const group of requiredGroups) {
    const hasNamed = pattern.includes(`(?<${group}>`);
    const hasPositional = requiredGroups.length === 1 && /\([^?]/.test(pattern);
    if (!hasNamed && !hasPositional) {
      return `Captura o grupo nomeado (?<${group}>...) ou o grupo posicional 1.`;
    }
  }
  return null;
}

/**
 * Regex editor with flag toggles, required groups, presets and an inline
 * sample tester. It is UI-only; the API remains the source of truth on save.
 */
export default function RegexField({
  label,
  value,
  onChange,
  flags = '',
  onFlagsChange,
  helpText,
  requiredGroups = [],
  presets = [],
  sampleText = '',
  maxLength = 500,
  disabled = false,
  error,
  ariaLabel,
  className,
  style,
}: RegexFieldProps) {
  const [testInput, setTestInput] = useState(sampleText);
  const [showTester, setShowTester] = useState(false);
  const testId = useId();
  const localError = value.trim() ? validate(value, flags, requiredGroups, maxLength) : null;
  const shownError = error ?? localError;

  const testResult = useMemo(() => {
    if (!testInput || localError) return null;
    try {
      const regex = new RegExp(value, flags);
      const match = testInput.match(regex);
      if (!match) return { matched: false, groups: [] as Array<[string, string]> };
      const groups: Array<[string, string]> = Object.entries(match.groups ?? {});
      match.slice(1).forEach((captured, index) => {
        if (captured !== undefined) groups.push([`Grupo ${index + 1}`, captured]);
      });
      return { matched: true, groups };
    } catch {
      return null;
    }
  }, [testInput, value, flags, localError]);

  const toggleFlag = (flag: string) => {
    if (!onFlagsChange) return;
    onFlagsChange(flags.includes(flag) ? flags.replace(flag, '') : `${flags}${flag}`);
  };

  return (
    <div
      className={className}
      style={{
        border: '1px solid var(--ui-border)',
        borderRadius: 10,
        padding: 12,
        background: 'var(--ui-surface)',
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          marginBottom: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span
            style={{
              color: 'var(--ui-text)',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
            }}
          >
            {label}
          </span>
          {requiredGroups.map((group) => {
            const present =
              value.includes(`(?<${group}>`) ||
              (requiredGroups.length === 1 && /\([^?]/.test(value));
            return (
              <Badge key={group} tone={present ? 'success' : 'warning'} variant="outline">
                {present ? '✓' : '!'} ?&lt;{group}&gt;
              </Badge>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {presets.length > 0 && (
            <Dropdown
              size="sm"
              ariaLabel={`${typeof label === 'string' ? label : 'Regex'} presets`}
              value=""
              placeholder="Exemplos prontos"
              options={presets.map((preset, index) => ({
                value: preset.id ?? String(index),
                label: preset.label,
              }))}
              onChange={(id) => {
                const preset = presets.find(
                  (candidate, index) => (candidate.id ?? String(index)) === id,
                );
                if (!preset) return;
                onChange(preset.pattern, preset.flags);
              }}
            />
          )}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowTester((current) => !current)}
          >
            {showTester ? 'Fechar teste' : 'Testar linha'}
          </Button>
        </div>
      </div>

      {helpText && (
        <div style={{ color: 'var(--ui-text-3)', fontSize: 11, marginBottom: 6 }}>{helpText}</div>
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <TextInput
            aria-label={ariaLabel ?? (typeof label === 'string' ? label : 'Regex')}
            value={value}
            disabled={disabled}
            maxLength={maxLength}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Expressão regular…"
            style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
          />
        </div>
        {onFlagsChange && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              padding: 2,
              border: '1px solid var(--ui-border)',
              borderRadius: 8,
            }}
          >
            {FLAGS.map((item) => {
              const active = flags.includes(item.flag);
              return (
                <Button
                  key={item.flag}
                  size="sm"
                  variant={active ? 'primary' : 'ghost'}
                  title={item.description}
                  aria-label={item.title}
                  onClick={() => toggleFlag(item.flag)}
                  disabled={disabled}
                >
                  {item.flag}
                </Button>
              );
            })}
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          marginTop: 4,
          fontSize: 11,
        }}
      >
        <span style={{ color: shownError ? 'var(--ui-red)' : 'var(--ui-green)' }}>
          {shownError ?? 'Regex válida e compilada'}
        </span>
        <span style={{ color: 'var(--ui-text-3)', fontFamily: 'monospace' }}>
          {value.length}/{maxLength}
        </span>
      </div>

      {showTester && (
        <div
          style={{
            marginTop: 8,
            borderTop: '1px solid var(--ui-border)',
            paddingTop: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <TextInput
            aria-label={`${ariaLabel ?? (typeof label === 'string' ? label : 'Regex')} sample`}
            value={testInput}
            onChange={(event) => setTestInput(event.target.value)}
            placeholder="Digite uma linha para testar os grupos…"
            style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
          />
          {testInput && testResult && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
              <Badge tone={testResult.matched ? 'success' : 'danger'} variant="solid">
                {testResult.matched ? 'Casou' : 'Não casou'}
              </Badge>
              {testResult.groups.map(([group, captured]) => (
                <Badge key={`${group}-${captured}`} tone="info" variant="soft">
                  {group}: {captured}
                </Badge>
              ))}
            </div>
          )}
          <span style={{ color: 'var(--ui-text-3)', fontSize: 10 }} id={`${testId}-hint`}>
            O teste é local; o salvamento continua sendo validado pelo backend.
          </span>
        </div>
      )}
    </div>
  );
}
