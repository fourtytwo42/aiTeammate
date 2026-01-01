export type MswScenario = 'happy' | 'empty' | 'rate_limited' | 'error_500' | 'slow';

export const defaultScenario: MswScenario = 'happy';
