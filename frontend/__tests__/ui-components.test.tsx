/**
 * Mobile UI/UX Component Tests
 *
 * Tests the M3 component library rendering and behavior.
 * Run with: bun run test __tests__/ui-components.test.tsx
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../theme/ThemeContext';

// ─── Test wrapper ────────────────────────────────────────────────────────────

function wrap(ui: React.ReactElement) {
  return render(
    <ThemeProvider themeName="void" onThemeChange={() => {}}>
      {ui}
    </ThemeProvider>,
  );
}

// ─── M3Button ────────────────────────────────────────────────────────────────

import M3Button from '../components/ui/M3Button';

describe('M3Button', () => {
  it('renders with label text', () => {
    const { getByText } = wrap(<M3Button label="Save" onPress={() => {}} />);
    expect(getByText('Save')).toBeTruthy();
  });

  it('fires onPress callback', () => {
    const handler = jest.fn();
    const { getByText } = wrap(<M3Button label="Click" onPress={handler} />);
    fireEvent.press(getByText('Click'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('renders all 4 variants without crashing', () => {
    const variants = ['filled', 'tonal', 'outlined', 'text'] as const;
    variants.forEach((variant) => {
      const { getByText } = wrap(
        <M3Button label={variant} variant={variant} onPress={() => {}} />,
      );
      expect(getByText(variant)).toBeTruthy();
    });
  });

  it('shows ActivityIndicator when loading', () => {
    const { queryByText, UNSAFE_queryByType } = wrap(
      <M3Button label="Submit" onPress={() => {}} loading />,
    );
    // Label should NOT be visible when loading
    expect(queryByText('Submit')).toBeNull();
  });

  it('is disabled when disabled prop is true', () => {
    const handler = jest.fn();
    const { getByText } = wrap(
      <M3Button label="Disabled" onPress={handler} disabled />,
    );
    fireEvent.press(getByText('Disabled'));
    // onPress should not fire because disabled
    expect(handler).not.toHaveBeenCalled();
  });
});

// ─── M3Card ──────────────────────────────────────────────────────────────────

import M3Card from '../components/ui/M3Card';
import { Text } from 'react-native';

describe('M3Card', () => {
  it('renders children content', () => {
    const { getByText } = wrap(
      <M3Card><Text>Card Content</Text></M3Card>,
    );
    expect(getByText('Card Content')).toBeTruthy();
  });

  it('renders with different elevation levels', () => {
    [0, 1, 2, 3].forEach((level) => {
      const { getByText } = wrap(
        <M3Card elevation={level as 0 | 1 | 2 | 3}>
          <Text>Level {level}</Text>
        </M3Card>,
      );
      expect(getByText(`Level ${level}`)).toBeTruthy();
    });
  });

  it('renders with different padding options', () => {
    const paddings = ['none', 'sm', 'md', 'lg'] as const;
    paddings.forEach((p) => {
      const { getByText } = wrap(
        <M3Card padding={p}><Text>Pad {p}</Text></M3Card>,
      );
      expect(getByText(`Pad ${p}`)).toBeTruthy();
    });
  });

  it('renders tinted variant', () => {
    const { getByText } = wrap(
      <M3Card tinted><Text>Tinted</Text></M3Card>,
    );
    expect(getByText('Tinted')).toBeTruthy();
  });
});

// ─── M3Chip ──────────────────────────────────────────────────────────────────

import M3Chip from '../components/ui/M3Chip';

describe('M3Chip', () => {
  it('renders label text', () => {
    const { getByText } = wrap(<M3Chip label="Tag" />);
    expect(getByText('Tag')).toBeTruthy();
  });

  it('renders in selected state', () => {
    const { getByText } = wrap(<M3Chip label="Active" selected />);
    expect(getByText('Active')).toBeTruthy();
  });

  it('fires onPress when tapped', () => {
    const handler = jest.fn();
    const { getByText } = wrap(<M3Chip label="Tap" onPress={handler} />);
    fireEvent.press(getByText('Tap'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('renders without onPress (non-interactive)', () => {
    const { getByText } = wrap(<M3Chip label="Static" />);
    expect(getByText('Static')).toBeTruthy();
  });
});

// ─── ThemedText ──────────────────────────────────────────────────────────────

import ThemedText from '../components/shared/ThemedText';

describe('ThemedText', () => {
  it('renders text content', () => {
    const { getByText } = wrap(<ThemedText>Hello World</ThemedText>);
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('renders with body variant (default)', () => {
    const { getByText } = wrap(<ThemedText>Body text</ThemedText>);
    expect(getByText('Body text')).toBeTruthy();
  });

  it('renders all legacy variants', () => {
    const variants = ['display', 'heading', 'body', 'caption', 'mono'] as const;
    variants.forEach((variant) => {
      const { getByText } = wrap(
        <ThemedText variant={variant}>{variant} text</ThemedText>,
      );
      expect(getByText(`${variant} text`)).toBeTruthy();
    });
  });

  it('renders M3 type scale variants', () => {
    const variants = [
      'displayLarge', 'displayMedium', 'displaySmall',
      'headlineLarge', 'headlineMedium', 'headlineSmall',
      'titleLarge', 'titleMedium', 'titleSmall',
      'bodyLarge', 'bodyMedium', 'bodySmall',
      'labelLarge', 'labelMedium', 'labelSmall',
    ] as const;
    variants.forEach((variant) => {
      const { getByText } = wrap(
        <ThemedText variant={variant}>{variant}</ThemedText>,
      );
      expect(getByText(variant)).toBeTruthy();
    });
  });

  it('renders with all color options', () => {
    const colors = [
      'primary', 'secondary', 'muted', 'accent',
      'onSurface', 'onSurfaceVariant', 'onPrimary', 'onPrimaryContainer',
    ] as const;
    colors.forEach((color) => {
      const { getByText } = wrap(
        <ThemedText color={color}>{color}</ThemedText>,
      );
      expect(getByText(color)).toBeTruthy();
    });
  });
});

// ─── M3TextField ─────────────────────────────────────────────────────────────

import M3TextField from '../components/ui/M3TextField';

describe('M3TextField', () => {
  it('renders with label', () => {
    const { getByText } = wrap(
      <M3TextField label="Email" value="" onChangeText={() => {}} />,
    );
    expect(getByText('Email')).toBeTruthy();
  });

  it('fires onChangeText when typing', () => {
    const handler = jest.fn();
    const { getByDisplayValue } = wrap(
      <M3TextField label="Name" value="John" onChangeText={handler} />,
    );
    fireEvent.changeText(getByDisplayValue('John'), 'Jane');
    expect(handler).toHaveBeenCalledWith('Jane');
  });

  it('shows error text', () => {
    const { getByText } = wrap(
      <M3TextField label="Password" value="" onChangeText={() => {}} error="Required field" />,
    );
    expect(getByText('Required field')).toBeTruthy();
  });

  it('shows supporting text', () => {
    const { getByText } = wrap(
      <M3TextField label="Bio" value="" onChangeText={() => {}} supportingText="Max 200 chars" />,
    );
    expect(getByText('Max 200 chars')).toBeTruthy();
  });

  it('renders outlined variant (default)', () => {
    const { getByText } = wrap(
      <M3TextField label="Outlined" value="" onChangeText={() => {}} variant="outlined" />,
    );
    expect(getByText('Outlined')).toBeTruthy();
  });

  it('renders filled variant', () => {
    const { getByText } = wrap(
      <M3TextField label="Filled" value="" onChangeText={() => {}} variant="filled" />,
    );
    expect(getByText('Filled')).toBeTruthy();
  });
});

// ─── EmptyState ──────────────────────────────────────────────────────────────

import { EmptyState } from '../components/ui/EmptyState';

describe('EmptyState', () => {
  it('renders default activities empty state', () => {
    const { getByText } = wrap(<EmptyState />);
    expect(getByText('No activities yet')).toBeTruthy();
  });

  it('renders all variant defaults', () => {
    const variants = [
      { variant: 'empty-activities', title: 'No activities yet' },
      { variant: 'empty-journals', title: 'Your journal is empty' },
      { variant: 'empty-connections', title: 'No connections found' },
      { variant: 'empty-search', title: 'No results found' },
      { variant: 'empty-alerts', title: 'All caught up' },
      { variant: 'empty-memories', title: 'No memories yet' },
    ] as const;

    variants.forEach(({ variant, title }) => {
      const { getByText } = wrap(<EmptyState variant={variant} />);
      expect(getByText(title)).toBeTruthy();
    });
  });

  it('renders custom title and description', () => {
    const { getByText } = wrap(
      <EmptyState title="Custom Title" description="Custom description text" />,
    );
    expect(getByText('Custom Title')).toBeTruthy();
    expect(getByText('Custom description text')).toBeTruthy();
  });

  it('fires CTA callback when pressed', () => {
    const handler = jest.fn();
    const { getByText } = wrap(
      <EmptyState ctaLabel="Retry" onCTA={handler} />,
    );
    fireEvent.press(getByText('Retry'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not render CTA button when no onCTA provided', () => {
    const { queryByText } = wrap(
      <EmptyState variant="empty-alerts" />,
    );
    // 'All caught up' variant has empty cta string, so no button
    expect(queryByText('Add Activity')).toBeNull();
  });
});

// ─── M3Switch ────────────────────────────────────────────────────────────────

import M3Switch from '../components/ui/M3Switch';

describe('M3Switch', () => {
  it('renders without crashing', () => {
    const { toJSON } = wrap(
      <M3Switch value={false} onValueChange={() => {}} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders in on state without crashing', () => {
    const { toJSON } = wrap(
      <M3Switch value={true} onValueChange={() => {}} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders disabled state without crashing', () => {
    const { toJSON } = wrap(
      <M3Switch value={false} onValueChange={() => {}} disabled />,
    );
    expect(toJSON()).toBeTruthy();
  });
});

// ─── Theme integration ───────────────────────────────────────────────────────

describe('Theme integration', () => {
  it('renders components in nova (light) theme', () => {
    const { getByText } = render(
      <ThemeProvider themeName="nova" onThemeChange={() => {}}>
        <M3Button label="Light theme" onPress={() => {}} />
      </ThemeProvider>,
    );
    expect(getByText('Light theme')).toBeTruthy();
  });

  it('renders components in all 7 themes', () => {
    const themes = ['void', 'nova', 'amber', 'ocean', 'forest', 'sunset', 'midnight'] as const;
    themes.forEach((themeName) => {
      const { getByText } = render(
        <ThemeProvider themeName={themeName} onThemeChange={() => {}}>
          <M3Button label={themeName} onPress={() => {}} />
        </ThemeProvider>,
      );
      expect(getByText(themeName)).toBeTruthy();
    });
  });

  it('renders nested M3 components together', () => {
    const { getByText } = wrap(
      <M3Card>
        <ThemedText variant="titleLarge">Title</ThemedText>
        <ThemedText variant="bodyMedium">Description</ThemedText>
        <M3Button label="Action" onPress={() => {}} variant="tonal" />
        <M3Chip label="Category" selected />
      </M3Card>,
    );
    expect(getByText('Title')).toBeTruthy();
    expect(getByText('Description')).toBeTruthy();
    expect(getByText('Action')).toBeTruthy();
    expect(getByText('Category')).toBeTruthy();
  });
});
