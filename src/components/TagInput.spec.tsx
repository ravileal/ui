import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TagInput from './TagInput';

function ControlledTagInput({ initial = [] as string[], onChange = vi.fn() }) {
  const [tags, setTags] = useState(initial);
  return (
    <TagInput
      label="Patterns"
      value={tags}
      onChange={(next) => {
        setTags(next);
        onChange(next);
      }}
    />
  );
}

describe('TagInput', () => {
  it('adds a trimmed tag on Enter and clears the field', async () => {
    const onChange = vi.fn();
    render(<ControlledTagInput onChange={onChange} />);

    const input = screen.getByLabelText('Add tag');
    await userEvent.type(input, '  Grocery  {Enter}');

    expect(onChange).toHaveBeenCalledWith(['Grocery']);
    expect(screen.getByText('Grocery')).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('removes a tag through its remove button', async () => {
    const onChange = vi.fn();
    render(<ControlledTagInput initial={['A', 'B']} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Remove A' }));

    expect(onChange).toHaveBeenCalledWith(['B']);
    expect(screen.queryByText('A')).not.toBeInTheDocument();
  });

  it('ignores duplicates and empty values', async () => {
    const onChange = vi.fn();
    render(<ControlledTagInput initial={['A']} onChange={onChange} />);

    const input = screen.getByLabelText('Add tag');
    await userEvent.type(input, 'A{Enter}');
    expect(onChange).not.toHaveBeenCalled();

    await userEvent.type(input, '   {Enter}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows the empty hint and disables adding at the limit', () => {
    render(<TagInput value={[]} onChange={vi.fn()} emptyLabel="Nothing yet" maxTags={0} />);
    expect(screen.getByText('Nothing yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
    expect(screen.getByLabelText('Add tag')).toBeDisabled();
  });
});
