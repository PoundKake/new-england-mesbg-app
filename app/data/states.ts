export interface StateOption {
  code: string
  name: string
}

/**
 * New England plus nearby states players commonly travel from/to. Used for
 * player `home_state` selection. Codes are USPS two-letter abbreviations.
 */
export const NEW_ENGLAND_STATES: StateOption[] = [
  { code: 'ME', name: 'Maine' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'VT', name: 'Vermont' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'CT', name: 'Connecticut' }
]

export function stateName(code: string): string {
  return NEW_ENGLAND_STATES.find((state) => state.code === code)?.name ?? code
}
