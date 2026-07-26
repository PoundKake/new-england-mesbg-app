export interface CommunityLink {
  label: string
  url: string
  description: string
}

/**
 * TODO(site-owner): replace these with your real Discord invite / Facebook
 * group links before launch. Left as clearly-marked placeholders rather
 * than invented URLs.
 */
export const COMMUNITY_LINKS: CommunityLink[] = [
  {
    label: 'Discord',
    url: 'https://discord.gg/KWrUnT8dVu',
    description: 'Join our Discord community!'
  },
  {
    label: 'Facebook Group',
    url: 'https://www.facebook.com/share/g/18DnRN3zab/?mibextid=wwXIfr',
    description: 'Join the Facebook group!'
  }
]
