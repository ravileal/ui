import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorPicker } from './ColorPicker';

const PRESETS = ['#00c9a7', '#4f7cff', '#f59e0b'];

function setup(value = '#00c9a7') {
  const onChange = vi.fn();
  render(
    <ColorPicker value={value} onChange={onChange} presets={PRESETS} ariaLabel="Test colour" />,
  );
  return onChange;
}

describe('ColorPicker', () => {
  it('shows the current colour and opens the full picker', async () => {
    setup('#00c9a7');
    expect(screen.getByLabelText('Test colour')).toHaveTextContent('#00C9A7');

    await userEvent.click(screen.getByLabelText('Test colour'));

    expect(screen.getByRole('dialog', { name: 'Test colour picker' })).toBeInTheDocument();
    expect(screen.getByLabelText('Saturation and brightness')).toBeInTheDocument();
    expect(screen.getByLabelText('Hue')).toBeInTheDocument();
    expect(screen.getByLabelText('Hex colour')).toBeInTheDocument();
    expect(screen.getByLabelText('Red')).toBeInTheDocument();
    expect(screen.getByLabelText('Green')).toBeInTheDocument();
    expect(screen.getByLabelText('Blue')).toBeInTheDocument();
  });

  it('applies a preset swatch', async () => {
    const onChange = setup('#00c9a7');
    await userEvent.click(screen.getByLabelText('Test colour'));

    await userEvent.click(screen.getByRole('button', { name: 'Colour #4f7cff' }));

    expect(onChange).toHaveBeenCalledWith('#4f7cff');
  });

  it('applies a typed hex value', async () => {
    const onChange = setup();
    await userEvent.click(screen.getByLabelText('Test colour'));

    const input = screen.getByLabelText('Hex colour');
    await userEvent.clear(input);
    await userEvent.type(input, '#123456');

    expect(onChange).toHaveBeenLastCalledWith('#123456');
  });

  it('applies an RGB channel change', async () => {
    const onChange = setup('#000000');
    await userEvent.click(screen.getByLabelText('Test colour'));

    const red = screen.getByLabelText('Red');
    await userEvent.clear(red);
    await userEvent.type(red, '255');

    expect(onChange).toHaveBeenLastCalledWith('#ff0000');
  });

  it('ignores an invalid hex until it is complete', async () => {
    const onChange = setup('#00c9a7');
    await userEvent.click(screen.getByLabelText('Test colour'));

    const input = screen.getByLabelText('Hex colour');
    await userEvent.clear(input);
    await userEvent.type(input, '#12');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('closes on Done', async () => {
    setup();
    await userEvent.click(screen.getByLabelText('Test colour'));
    await userEvent.click(screen.getByRole('button', { name: 'Done' }));

    expect(screen.queryByRole('dialog', { name: 'Test colour picker' })).not.toBeInTheDocument();
  });

  it('reverts the colour on Cancel', async () => {
    const onChange = setup('#00c9a7');
    await userEvent.click(screen.getByLabelText('Test colour'));
    await userEvent.click(screen.getByRole('button', { name: 'Colour #4f7cff' }));

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onChange).toHaveBeenLastCalledWith('#00c9a7');
    expect(screen.queryByRole('dialog', { name: 'Test colour picker' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Test colour'));
    expect(screen.getByLabelText('Hex colour')).toHaveValue('#00C9A7');
  });

  it('reverts the colour when clicking outside', async () => {
    const onChange = setup('#00c9a7');
    await userEvent.click(screen.getByLabelText('Test colour'));
    await userEvent.click(screen.getByRole('button', { name: 'Colour #4f7cff' }));

    await userEvent.click(document.body);

    expect(onChange).toHaveBeenLastCalledWith('#00c9a7');
    expect(screen.queryByRole('dialog', { name: 'Test colour picker' })).not.toBeInTheDocument();
  });

  it('reverts the colour on Escape', async () => {
    const onChange = setup('#00c9a7');
    await userEvent.click(screen.getByLabelText('Test colour'));
    await userEvent.click(screen.getByRole('button', { name: 'Colour #4f7cff' }));

    await userEvent.keyboard('{Escape}');

    expect(onChange).toHaveBeenLastCalledWith('#00c9a7');
    expect(screen.queryByRole('dialog', { name: 'Test colour picker' })).not.toBeInTheDocument();
  });

  it('offers the screen eyedropper when the browser supports it', async () => {
    const EyeDropper = class {
      open = () => Promise.resolve({ sRGBHex: '#abcdef' });
    };
    Object.defineProperty(window, 'EyeDropper', { configurable: true, value: EyeDropper });
    try {
      const onChange = setup();
      await userEvent.click(screen.getByLabelText('Test colour'));
      await userEvent.click(screen.getByRole('button', { name: 'Pick colour from screen' }));

      expect(onChange).toHaveBeenCalledWith('#abcdef');
    } finally {
      delete (window as unknown as { EyeDropper?: unknown }).EyeDropper;
    }
  });

  it('accepts localized labels', async () => {
    render(
      <ColorPicker
        value="#00c9a7"
        onChange={vi.fn()}
        presets={PRESETS}
        ariaLabel="Cor"
        labels={{
          picker: 'Seletor de cor',
          saturationAndBrightness: 'Saturação e brilho',
          hue: 'Matiz',
          hexColor: 'Cor hexadecimal',
          presetColors: 'Cores predefinidas',
          presetColor: (hex) => `Cor ${hex}`,
          red: 'Vermelho',
          green: 'Verde',
          blue: 'Azul',
          cancel: 'Cancelar',
          done: 'Concluir',
        }}
      />,
    );
    await userEvent.click(screen.getByLabelText('Cor'));

    expect(screen.getByRole('dialog', { name: 'Seletor de cor' })).toBeInTheDocument();
    expect(screen.getByLabelText('Saturação e brilho')).toBeInTheDocument();
    expect(screen.getByLabelText('Matiz')).toBeInTheDocument();
    expect(screen.getByLabelText('Cor hexadecimal')).toBeInTheDocument();
    expect(screen.getByLabelText('Vermelho')).toBeInTheDocument();
    expect(screen.getByLabelText('Cores predefinidas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Concluir' })).toBeInTheDocument();
  });

  it('prefers the native eyedropper over asking to share the screen', async () => {
    const EyeDropper = class {
      open = () => Promise.resolve({ sRGBHex: '#abcdef' });
    };
    const getDisplayMedia = vi.fn();
    const originalMediaDevices = Object.getOwnPropertyDescriptor(navigator, 'mediaDevices');
    Object.defineProperty(window, 'EyeDropper', { configurable: true, value: EyeDropper });
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getDisplayMedia },
    });
    try {
      const onChange = setup();
      await userEvent.click(screen.getByLabelText('Test colour'));
      await userEvent.click(screen.getByRole('button', { name: 'Pick colour from screen' }));

      expect(getDisplayMedia).not.toHaveBeenCalled();
      expect(onChange).toHaveBeenCalledWith('#abcdef');
    } finally {
      delete (window as unknown as { EyeDropper?: unknown }).EyeDropper;
      if (originalMediaDevices) {
        Object.defineProperty(navigator, 'mediaDevices', originalMediaDevices);
      } else {
        delete (navigator as unknown as { mediaDevices?: unknown }).mediaDevices;
      }
    }
  });
});
