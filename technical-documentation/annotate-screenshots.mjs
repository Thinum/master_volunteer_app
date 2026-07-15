import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from '/Users/manuelv/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/lib/index.js';

const root = path.dirname(new URL(import.meta.url).pathname);
const sourceDir = path.join(root, 'screenshots');
const outputDir = path.join(root, 'screenshots-annotated');

// Coordinates are percentages of the original full-page screenshot.
// Each entry is [x, y, width, height, documentation description].
const annotations = {
  '01-login.jpg': [
    [1.5, 1.2, 97, 5, 'Page header and session action'],
    [11, 20, 38, 67, 'Authentication form'],
    [52, 20, 37, 13, 'Organisation search and filters'],
    [52, 35, 38, 58, 'Public organisation browser']
  ],
  '02-register.jpg': [
    [0.2, 2, 5, 7, 'Session action'],
    [0.2, 17, 4, 49, 'Registration heading and form fields'],
    [0.2, 69, 5, 17, 'Registration navigation and submit actions'],
    [0.1, 12, 6, 76, 'Current collapsed route-container layout']
  ],
  '03-home.jpg': [
    [4.5, 8, 91, 11, 'User summary and key totals'],
    [4.5, 20, 91, 37, 'Latest user highlights'],
    [4.5, 59, 91, 31, 'Recommended activities'],
    [20, 93, 61, 6, 'Primary navigation']
  ],
  '04-organisations.jpg': [
    [5, 7, 90, 10, 'Organisation overview and statistics'],
    [6, 18, 88, 7, 'Search and filter controls'],
    [5, 26, 90, 21, 'Joined organisations'],
    [5, 48, 90, 20, 'Recommended organisations'],
    [5, 69, 90, 24, 'All organisations'],
    [20, 94, 61, 5, 'Primary navigation and create action']
  ],
  '05-organisation-detail.jpg': [
    [5, 6, 90, 25, 'Organisation identity, location and join action'],
    [8, 15, 84, 10, 'Organisation map'],
    [5, 32, 90, 23, 'Community goals'],
    [5, 56, 45, 24, 'Organisation projects'],
    [52, 56, 43, 24, 'Organisation activities'],
    [5, 81, 90, 12, 'Members and friend membership']
  ],
  '06a-community-friends.jpg': [
    [2.5, 5, 95, 5, 'Community section tabs'],
    [4, 10, 88, 18, 'Friends list'],
    [4, 30, 93, 26, 'Activities involving friends'],
    [2.5, 57, 95, 6, 'Relationship and activity graph tabs'],
    [4, 64, 93, 32, 'Relationship graph'],
    [20, 95, 61, 4, 'Primary navigation']
  ],
  '06b-community-forum.jpg': [
    [2.5, 6, 95, 8, 'Community section tabs'],
    [6, 17, 84, 9, 'Forum search'],
    [6, 27, 88, 52, 'Forum topic list'],
    [91, 78, 5, 8, 'Create forum topic action'],
    [20, 92, 61, 6, 'Primary navigation']
  ],
  '06c-community-chat-list.jpg': [
    [2.5, 6, 95, 8, 'Community section tabs'],
    [6, 17, 84, 9, 'Conversation search'],
    [6, 27, 88, 48, 'Conversation list and unread state'],
    [91, 74, 5, 8, 'Start conversation action'],
    [20, 92, 61, 6, 'Primary navigation']
  ],
  '06d-community-activity-graph.jpg': [
    [2.5, 5, 95, 5, 'Community section tabs'],
    [4, 10, 92, 42, 'Friends and shared activities'],
    [2.5, 53, 95, 6, 'Relationship and activity graph tabs'],
    [4, 60, 27, 32, 'Activity selection filters'],
    [32, 60, 64, 32, 'Activity relationship graph'],
    [20, 94, 61, 5, 'Primary navigation']
  ],
  '07-forum-detail.jpg': [
    [3, 10, 30, 6, 'Back navigation'],
    [3, 17, 94, 14, 'Forum topic metadata'],
    [3, 32, 94, 16, 'Reply history'],
    [3, 50, 94, 14, 'Reply composer and submit action'],
    [20, 90, 61, 8, 'Primary navigation']
  ],
  '08-chat-detail.jpg': [
    [3, 11, 30, 6, 'Back navigation'],
    [3, 17, 94, 12, 'Conversation contact and presence'],
    [3, 30, 94, 38, 'Incoming and outgoing messages'],
    [3, 80, 94, 10, 'Message composer and send action'],
    [20, 91, 61, 7, 'Primary navigation']
  ],
  '09-profile.jpg': [
    [7, 8, 86, 7, 'Profile identity and edit action'],
    [7, 15, 86, 17, 'Account details, skills and interests'],
    [8, 32, 84, 20, 'Friends'],
    [8, 53, 84, 19, 'Joined organisations'],
    [8, 73, 84, 19, 'Joined activities'],
    [20, 94, 61, 5, 'Share action and primary navigation']
  ],
  '10-profile-edit.jpg': [
    [7, 8, 86, 9, 'Profile editor heading'],
    [8, 18, 84, 28, 'Identity and contact fields'],
    [8, 47, 84, 20, 'Skills editor'],
    [8, 68, 84, 20, 'Interests editor'],
    [60, 89, 32, 7, 'Cancel and save actions']
  ],
  '11-activities.jpg': [
    [5, 7, 90, 9, 'Activity overview and key totals'],
    [5, 17, 90, 7, 'Search and filter controls'],
    [5, 25, 90, 19, 'Joined activities'],
    [5, 45, 90, 17, 'Recommended activities'],
    [5, 63, 90, 29, 'Complete activity catalogue'],
    [20, 94, 76, 5, 'Primary navigation and create action']
  ],
  '12-activity-detail.jpg': [
    [5, 6, 90, 16, 'Activity identity, status and primary action'],
    [5, 23, 90, 18, 'Schedule and location'],
    [5, 42, 90, 18, 'Description and requirements'],
    [5, 61, 90, 17, 'Participants and capacity'],
    [5, 79, 90, 14, 'Contact and organisation information'],
    [20, 94, 61, 5, 'Primary navigation']
  ],
  '13-project-detail.jpg': [
    [1, 2, 8, 8, 'Session actions'],
    [1, 12, 4, 38, 'Project title and location'],
    [3, 63, 4, 28, 'Project description'],
    [0.5, 10, 8, 86, 'Current collapsed route-container layout']
  ],
  '14-create-activity.jpg': [
    [7, 5, 86, 7, 'Activity creation heading'],
    [8, 13, 84, 20, 'Title, organisation and description'],
    [8, 34, 84, 20, 'Schedule and duration'],
    [8, 55, 84, 14, 'Location and capacity'],
    [8, 70, 84, 18, 'Skills, tags and requirements'],
    [60, 89, 32, 6, 'Cancel and create actions']
  ],
  '15-create-organisation.jpg': [
    [7, 7, 86, 8, 'Organisation creation heading'],
    [8, 16, 84, 25, 'Organisation identity and description'],
    [8, 42, 84, 20, 'Category, tags and location'],
    [8, 63, 84, 18, 'Contacts and administrators'],
    [60, 83, 32, 8, 'Cancel and create actions'],
    [20, 94, 61, 5, 'Primary navigation']
  ],
  '16-notifications.jpg': [
    [1, 11, 8, 74, 'Notification card and progress information'],
    [4, 12, 4, 9, 'Read or dismiss action'],
    [0.5, 9, 10, 79, 'Current collapsed route-container layout']
  ],
  '17-reports.jpg': [
    [4, 5, 92, 6, 'Report filters and volunteer selector'],
    [4, 12, 92, 9, 'Key performance indicators'],
    [4, 22, 92, 27, 'Monthly activity trend'],
    [4, 50, 46, 27, 'Category distribution'],
    [51, 50, 45, 27, 'Volunteer contribution'],
    [4, 78, 92, 17, 'Capacity demand and report summary']
  ],
  '18-community-goals.jpg': [
    [6, 15, 88, 8, 'Goals heading and create action'],
    [8, 24, 84, 25, 'Goal title, tags, progress and edit action'],
    [10, 50, 80, 9, 'Completed activity contributions'],
    [8, 61, 84, 25, 'Additional community goal'],
    [20, 91, 61, 7, 'Primary navigation']
  ]
};

function escapeXml(value) {
  return value.replace(/[<>&"']/g, character => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;'
  })[character]);
}

function overlaySvg(width, height, items) {
  const stroke = Math.max(4, Math.round(width / 260));
  const badgeRadius = Math.max(17, Math.round(width / 65));
  const fontSize = Math.max(18, Math.round(width / 52));

  const elements = items.map((item, index) => {
    const [xp, yp, wp, hp, description] = item;
    const x = Math.round(width * xp / 100);
    const y = Math.round(height * yp / 100);
    const w = Math.max(12, Math.round(width * wp / 100));
    const h = Math.max(12, Math.round(height * hp / 100));
    const badgeX = Math.min(width - badgeRadius - 2, Math.max(badgeRadius + 2, x + 4));
    const badgeY = Math.min(height - badgeRadius - 2, Math.max(badgeRadius + 2, y + 4));
    return `
      <g aria-label="${escapeXml(description)}">
        <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12"
          fill="#e11919" fill-opacity="0.035" stroke="#e11919" stroke-width="${stroke}"/>
        <circle cx="${badgeX}" cy="${badgeY}" r="${badgeRadius}"
          fill="#e11919" stroke="#ffffff" stroke-width="3"/>
        <text x="${badgeX}" y="${badgeY + Math.round(fontSize * 0.35)}"
          text-anchor="middle" font-family="Arial, Helvetica, sans-serif"
          font-size="${fontSize}" font-weight="700" fill="#ffffff">${index + 1}</text>
      </g>`;
  }).join('');

  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      ${elements}
    </svg>`);
}

await fs.mkdir(outputDir, { recursive: true });

const legend = ['# Annotated screenshot legend', '', 'Red numbered boxes identify the main UI regions referenced by the technical documentation.', ''];

for (const [filename, items] of Object.entries(annotations)) {
  const input = path.join(sourceDir, filename);
  const output = path.join(outputDir, filename);
  const image = sharp(input);
  const metadata = await image.metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error(`Could not determine dimensions for ${filename}`);
  }

  await image
    .composite([{ input: overlaySvg(metadata.width, metadata.height, items), top: 0, left: 0 }])
    .jpeg({ quality: 94, chromaSubsampling: '4:4:4' })
    .toFile(output);

  legend.push(`## ${filename}`, '');
  items.forEach(([, , , , description], index) => legend.push(`${index + 1}. ${description}`));
  legend.push('');
}

await fs.writeFile(path.join(outputDir, 'LEGEND.md'), `${legend.join('\n')}\n`);
console.log(`Created ${Object.keys(annotations).length} annotated screenshots in ${outputDir}`);
