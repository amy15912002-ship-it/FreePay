export type EntryMode = 'new' | 'addOn' | 'modify' | 'redeem';

export interface FlowContext {
  mode: EntryMode;
  fundId: string;
  contractFpNo?: string;
}

export function isEntryMode(value: string | null): value is EntryMode {
  return value === 'new' || value === 'addOn' || value === 'modify' || value === 'redeem';
}
