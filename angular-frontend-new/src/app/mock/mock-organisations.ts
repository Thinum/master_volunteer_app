import { Organisation, OrganisationCategory } from '../models/organisation.model';
import { MOCK_USERS } from './mock-users';

// ------------------------------------------------------
// Base mock data for all organisations
// ------------------------------------------------------
export const MOCK_ORGANISATIONS: Organisation[] = [
  {
    id: 1,
    orgName: 'Tech Aid Association',
    location: { lat: 48.2082, lon: 16.3738 },
    profilePicture: 'https://logotypes.dev/Protopie?variant=glyph&version=color',
    createdAt: new Date('2023-06-15'),
    body: 'Helping underprivileged communities learn coding skills.',
    deactivated: false,
    orgContacts: [MOCK_USERS[0], MOCK_USERS[1]],

    category: 'Technology',
    tags: ['coding', 'programming', 'mentorship', 'youth', 'digital skills'],
  },
  {
    id: 2,
    orgName: 'Green Future Org',
    location: { lat: 48.3069, lon: 14.2858 },
    createdAt: new Date('2023-09-20'),
    body: 'Dedicated to sustainability and green innovation.',
    profilePicture: 'https://logotypes.dev/Clearscope?variant=glyph&version=color',
    deactivated: false,
    orgContacts: [MOCK_USERS[2]],

    category: 'Environment',
    tags: ['sustainability', 'climate', 'renewable energy', 'eco projects'],
  },
  {
    id: 3,
    orgName: 'Community Connect',
    location: { lat: 47.0707, lon: 15.4395 },
    createdAt: new Date('2023-10-01'),
    body: 'Connecting volunteers with local social projects.',
    profilePicture: 'https://logotypes.dev/Contentful?variant=glyph&version=color',
    deactivated: false,
    orgContacts: [MOCK_USERS[3]],

    category: 'Community',
    tags: ['volunteering', 'local projects', 'non-profit', 'social impact'],
  },
  {
    id: 4,
    orgName: 'Education for All',
    location: { lat: 47.8095, lon: 13.055 },
    createdAt: new Date('2024-02-10'),
    body: 'Providing access to quality education worldwide.',
    profilePicture: 'https://logotypes.dev/Feedly?variant=glyph&version=color',
    deactivated: false,
    orgContacts: [MOCK_USERS[4]],

    category: 'Education',
    tags: ['schools', 'learning', 'scholarships', 'children', 'global'],
  },
  {
    id: 5,
    orgName: 'HealthFirst Initiative',
    location: { lat: 48.1486, lon: 17.1077 },
    createdAt: new Date('2023-05-11'),
    body: 'Promoting healthy lifestyles and preventive medicine.',
    profilePicture: 'https://logotypes.dev/Googlefonts?variant=glyph&version=color',
    deactivated: false,
    orgContacts: [MOCK_USERS[5]],

    category: 'Health',
    tags: ['wellness', 'fitness', 'nutrition', 'mental health', 'prevention'],
  },
  {
    id: 6,
    orgName: 'Cultural Bridges Foundation',
    location: { lat: 46.0569, lon: 14.5058 },
    createdAt: new Date('2023-07-22'),
    body: 'Encouraging cultural exchange and diversity awareness.',
    profilePicture: 'https://logotypes.dev/Instacart?variant=glyph&version=color',
    deactivated: false,
    orgContacts: [MOCK_USERS[6]],

    category: 'Culture',
    tags: ['diversity', 'exchange programs', 'international', 'inclusion'],
  },
];


// ------------------------------------------------------
// Derived lists (these simulate filtered datasets)
// ------------------------------------------------------

/**
 * Organisations the current user has joined.
 */
export const MOCK_JOINED_ORGANISATIONS: Organisation[] = [
  MOCK_ORGANISATIONS[2], // Community Connect
  MOCK_ORGANISATIONS[3], // Education for All
];

/**
 * Recommended organisations for the current user.
 */
export const MOCK_RECOMMENDED_ORGANISATIONS: Organisation[] = [
  MOCK_ORGANISATIONS[4], // HealthFirst Initiative
  MOCK_ORGANISATIONS[5], // Cultural Bridges Foundation
];

/**
 * Featured or highlighted organisations (e.g., on homepage).
 */
export const MOCK_FEATURED_ORGANISATIONS: Organisation[] = [
  MOCK_ORGANISATIONS[0], // Tech Aid Association
  MOCK_ORGANISATIONS[1], // Green Future Org
];

export function filterByCategory(category: OrganisationCategory) {
  return MOCK_ORGANISATIONS.filter(org => org.category === category);
}

export function filterByTag(tag: string) {
  return MOCK_ORGANISATIONS.filter(org =>
    org.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
  );
}

export function searchOrganisations(query: string) {
  const lowerQuery = query.toLowerCase();

  return MOCK_ORGANISATIONS.filter(org =>
    org.orgName.toLowerCase().includes(lowerQuery) ||
    org.body.toLowerCase().includes(lowerQuery) ||
    org.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}
