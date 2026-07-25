/**
 * MESBG legions/factions for the result-entry and photo-upload forms.
 *
 * This is a starting list, not an authoritative one — Games Workshop adds
 * and renames legions over time, and this list is deliberately a plain TS
 * array (not a database enum) so a new legion can be added by editing this
 * file and redeploying, without a migration. Whoever maintains this site
 * should review/extend it against the current army list book.
 */
export const MESBG_FACTIONS: string[] = [
  // Good
  'The Fellowship',
  'Rivendell',
  'Lothlórien',
  'The Grey Havens',
  'The Kingdom of Rohan',
  'The Kingdom of Gondor',
  'Arnor',
  'The Dead',
  'The Ents',
  'The Dwarves of Erebor',
  'The Iron Hills',
  'The White Council',
  'Thranduil’s Halls',
  'Radagast’s Alliance',
  // Evil
  'Mordor',
  'Isengard',
  'The Easterlings',
  'Variags of Khand',
  'Half-Trolls of Far Harad',
  'Corsairs of Umbar',
  'The Serpent Horde',
  'Angmar',
  'Moria',
  'Azog’s Hunters',
  'Goblin-town',
  'The Dunlendings',
  // Fallback for anything not yet in this list.
  'Other / Mixed'
]
