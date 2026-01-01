import type { Meta, StoryObj } from '@storybook/react';
import { PersonaCard } from '../src/components/PersonaCard';

const meta: Meta<typeof PersonaCard> = {
  title: 'Components/PersonaCard',
  component: PersonaCard
};

export default meta;
type Story = StoryObj<typeof PersonaCard>;

export const Idle: Story = {
  args: {
    name: 'Analyst Persona',
    description: 'Handles reporting and summaries',
    status: 'idle'
  }
};

export const Running: Story = {
  args: {
    name: 'Analyst Persona',
    description: 'Handles reporting and summaries',
    status: 'running'
  }
};

export const Failed: Story = {
  args: {
    name: 'Analyst Persona',
    description: 'Handles reporting and summaries',
    status: 'failed'
  }
};
