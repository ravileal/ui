import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegexField from './RegexField';

describe('RegexField', () => {
  it('renders the label, current value, counter and valid state', () => {
    const onChange = vi.fn();
    render(<RegexField label="Amount pattern" value={'\\d+'} onChange={onChange} />);

    const input = screen.getByRole('textbox', { name: 'Amount pattern' });
    expect(input).toHaveValue('\\d+');
    expect(input).toHaveAttribute('maxlength', '500');
    expect(screen.getByText('3/500')).toBeInTheDocument();
    expect(screen.getByText('Regex válida e compilada')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: '\\d{2}' } });
    expect(onChange).toHaveBeenCalledWith('\\d{2}');
  });

  it('renders the help text and hides the flag switches without onFlagsChange', () => {
    render(
      <RegexField
        label="Amount pattern"
        value={'\\d+'}
        helpText="Use um grupo nomeado para o valor."
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText('Use um grupo nomeado para o valor.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Case-insensitive' })).not.toBeInTheDocument();
  });

  it('reports an invalid pattern', () => {
    render(<RegexField label="Amount pattern" value="(" onChange={vi.fn()} />);
    expect(screen.getByText(/^Regex inválida: /)).toBeInTheDocument();
  });

  it('reports a value above maxLength and counts it', () => {
    render(<RegexField label="Amount pattern" value="abcdef" maxLength={5} onChange={vi.fn()} />);

    expect(screen.getByText('Limite de 5 caracteres excedido (6/5).')).toBeInTheDocument();
    expect(screen.getByText('6/5')).toBeInTheDocument();
  });

  it('reports unsupported flags', () => {
    render(
      <RegexField
        label="Amount pattern"
        value={'\\d+'}
        flags="g"
        onFlagsChange={vi.fn()}
        onChange={vi.fn()}
      />,
    );

    expect(
      screen.getByText('Flags inválidas (g). Permitidas apenas i, m, s, u.'),
    ).toBeInTheDocument();
  });

  it('prefers the external error over local validation', () => {
    render(
      <RegexField
        label="Amount pattern"
        value="("
        error="Expressão rejeitada pelo servidor"
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText('Expressão rejeitada pelo servidor')).toBeInTheDocument();
    expect(screen.queryByText(/Regex inválida/)).not.toBeInTheDocument();
  });

  it('adds and removes flags through the flag buttons', async () => {
    const onFlagsChange = vi.fn();
    const { unmount } = render(
      <RegexField label="Amount pattern" value={'\\d+'} onChange={vi.fn()} />,
    );
    expect(screen.queryByRole('button', { name: 'Multiline' })).not.toBeInTheDocument();
    unmount();

    render(
      <RegexField
        label="Amount pattern"
        value={'\\d+'}
        flags="i"
        onFlagsChange={onFlagsChange}
        onChange={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Case-insensitive' }));
    expect(onFlagsChange).toHaveBeenLastCalledWith('');

    await userEvent.click(screen.getByRole('button', { name: 'Multiline' }));
    expect(onFlagsChange).toHaveBeenLastCalledWith('im');
  });

  it('marks required groups as present or missing', () => {
    render(
      <RegexField
        label="Amount pattern"
        value={'(?<amount>\\d+)'}
        requiredGroups={['amount', 'currency']}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText('✓ ?<amount>').closest('.ui-badge')).toHaveClass('ui-badge--success');
    expect(screen.getByText('! ?<currency>').closest('.ui-badge')).toHaveClass('ui-badge--warning');
  });

  it('applies a preset through the presets dropdown', async () => {
    const onChange = vi.fn();
    render(
      <RegexField
        label="Amount pattern"
        value=""
        onChange={onChange}
        presets={[{ label: 'Valor BR', pattern: '(?<amount>\\d+,\\d{2})', flags: 'i' }]}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Amount pattern presets' }));
    await userEvent.click(screen.getByRole('option', { name: 'Valor BR' }));

    expect(onChange).toHaveBeenCalledWith('(?<amount>\\d+,\\d{2})', 'i');
  });

  it('opens the sample tester, matches groups and reports misses', async () => {
    render(
      <RegexField
        label="Amount pattern"
        value={'(?<amount>\\d+)'}
        sampleText="total 42"
        onChange={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Testar linha' }));

    expect(screen.getByRole('button', { name: 'Fechar teste' })).toBeInTheDocument();
    const sample = screen.getByRole('textbox', { name: 'Amount pattern sample' });
    expect(sample).toHaveValue('total 42');
    expect(screen.getByText('Casou')).toBeInTheDocument();
    expect(screen.getByText('amount: 42')).toBeInTheDocument();
    expect(
      screen.getByText('O teste é local; o salvamento continua sendo validado pelo backend.'),
    ).toBeInTheDocument();

    await userEvent.clear(sample);
    await userEvent.type(sample, 'nada aqui');
    expect(screen.getByText('Não casou')).toBeInTheDocument();
  });

  it('disables the input and the flag buttons', async () => {
    const onChange = vi.fn();
    const onFlagsChange = vi.fn();
    render(
      <RegexField
        label="Amount pattern"
        value={'\\d+'}
        disabled
        onChange={onChange}
        onFlagsChange={onFlagsChange}
      />,
    );

    expect(screen.getByRole('textbox', { name: 'Amount pattern' })).toBeDisabled();
    const flag = screen.getByRole('button', { name: 'Case-insensitive' });
    expect(flag).toBeDisabled();

    await userEvent.click(flag);
    expect(onFlagsChange).not.toHaveBeenCalled();
  });
});
