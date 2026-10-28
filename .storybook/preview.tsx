/* eslint-disable react-refresh/only-export-components */
import { useEffect, type ReactNode } from 'react';
import type { Preview } from '@storybook/react';
import '@fontsource-variable/inter';
import '../src/styles.css';

function ThemeDecorator({ theme, children }: { theme: 'dark' | 'light'; children: ReactNode }) {
  useEffect(() => {
    document.documentElement.dataset.uiTheme = theme;
    return () => {
      delete document.documentElement.dataset.uiTheme;
    };
  }, [theme]);

  return <div style={{ fontFamily: 'Inter Variable, Inter, sans-serif' }}>{children}</div>;
}

const preview: Preview = {
  parameters: {
    backgrounds: { disable: true },
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Color theme',
      defaultValue: 'dark',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'dark', title: 'Dark' },
          { value: 'light', title: 'Light' },
        ],
      },
    },
  },
  decorators: [
    (Story, context) => (
      <ThemeDecorator theme={context.globals.theme as 'dark' | 'light'}>
        <Story />
      </ThemeDecorator>
    ),
  ],
};

export default preview;
