import { render, fireEvent } from '@testing-library/vue';
import SpastaTaskDialog from './spastaTaskDialog.vue';
import { describe, it, expect} from 'vitest';

const mockCategory = {
  id: 'cat1',
  name: 'Sample Category',
  flows: [{ id: 'flow1', name: 'To Do' }, { id: 'flow2', name: 'Done' }],
};

describe('SpastaTaskDialog.vue', () => {
  it('renders form with default values', async () => {
    const { getByPlaceholderText, getByLabelText } = render(SpastaTaskDialog, {
      props: {
        isOpen: true,
        category: mockCategory,
      },
    });

    expect(getByPlaceholderText('Enter task title')).toBeTruthy();
    expect(getByPlaceholderText('Describe the task...')).toBeTruthy();
  });

  it('emits "save" with correct task on submit', async () => {
    const { getByText, getByPlaceholderText, emitted } = render(SpastaTaskDialog, {
      props: {
        isOpen: true,
        category: mockCategory,
      },
    });

    await fireEvent.update(getByPlaceholderText('Enter task title'), 'Test Task');
    await fireEvent.update(getByPlaceholderText('Describe the task...'), 'Testing the dialog');
    await fireEvent.click(getByText('Create Task'));

    const saveEvent = emitted().save?.[0][0];
    expect(saveEvent.title).toBe('Test Task');
    expect(saveEvent.description).toBe('Testing the dialog');
    expect(saveEvent.startDate).toBeInstanceOf(Date);
  });

  it('renders and handles recurring task logic', async () => {
    const { getByLabelText, getByDisplayValue } = render(SpastaTaskDialog, {
      props: {
        isOpen: true,
        category: mockCategory,
      },
    });

    const checkbox = getByLabelText('Recurring Task');
    await fireEvent.click(checkbox);

    const option = getByDisplayValue('Weekly');
    expect(option).toBeTruthy();
  });
});