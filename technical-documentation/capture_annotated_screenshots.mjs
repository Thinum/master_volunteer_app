import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '/tmp/codex-playwright/node_modules/playwright/index.mjs';

const baseUrl = 'http://localhost:4200';
const outputDirectory = new URL('./screenshots-annotated-current/', import.meta.url);
const defaultViewport = { width: 1440, height: 1000 };

const screens = [
  {
    file: '01-login.png',
    route: '/',
    waitFor: '.org-item',
    callouts: [
      { title: 'Page header and session action', targets: ['.toolbarTop'], badgePosition: 'top-center' },
      { title: 'Authentication form', targets: ['.login-section'] },
      { title: 'Organization search and filters', targets: ['.browse-section .search-container'] },
      { title: 'Public organization browser', targets: ['.organisations-list'] },
    ],
  },
  {
    file: '01a-login-filter-open.png',
    route: '/',
    waitFor: '.org-item',
    action: async (page) => {
      await page.locator('.browse-section .app-filter-button').click();
      await page.waitForSelector('#login-organisation-filters');
      const firstCategory = page.locator('#login-organisation-filters mat-chip-option').first();
      if (await firstCategory.count()) {
        await firstCategory.click();
      }
    },
    callouts: [
      { title: 'Organization search and active filter count', targets: [
        '.browse-section .search-container .mat-mdc-text-field-wrapper',
        '.browse-section .app-filter-button',
      ], padding: 4, badgePosition: 'center-left', topOffset: 48, bottomOffset: 64 },
      { title: 'Expanded category and interest filters', targets: [
        '#login-organisation-filters',
        '#login-organisation-filters mat-chip-listbox:last-of-type mat-chip-option:last-child',
      ], padding: 4, badgePosition: 'center-left', topOffset: 48, bottomOffset: 36 },
      { title: 'Organization results updated by the selected category', targets: [
        '.organisations-list',
        '.organisations-list .org-item:last-child .org-panel-header',
      ], padding: 4, badgePosition: 'center-left', topOffset: 28, bottomOffset: 36 },
    ],
  },
  {
    file: '01b-login-organisation-expanded.png',
    route: '/',
    waitFor: '.org-item',
    action: async (page) => {
      await page.locator('.org-item').first().locator('mat-expansion-panel-header').click();
      await page.waitForSelector('.org-item:first-child .activity-card');
      await page.addStyleTag({
        content: `
          .organisations-list,
          .organisations-list .list-content {
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
          }
          .organisations-list .org-item:nth-child(n + 2),
          .org-item:first-child .activities-list:nth-of-type(n + 2) {
            display: none !important;
          }
        `,
      });
      await page.waitForTimeout(800);
    },
    callouts: [
      { title: 'Expanded public organization', targets: ['.org-item:first-child .org-panel-header'], padding: 4, badgePosition: 'center-left' },
      { title: 'First organization activity with schedule and skills', targets: [
        { selector: '.org-item:first-child .activity-card', index: 0 },
        { selector: '.org-item:first-child .activity-card .activity-tags', index: 0 },
      ], padding: 4, badgePosition: 'center-left', bottomOffset: 8 },
      { title: 'Additional organization activity', targets: [
        { selector: '.org-item:first-child .activity-card', index: 1 },
        { selector: '.org-item:first-child .activity-card .activity-tags', index: 1 },
      ], padding: 4, badgePosition: 'center-left', bottomOffset: 8 },
    ],
  },
  {
    file: '02-home.png',
    route: '/home',
    waitFor: '.home-container',
    authenticated: true,
    callouts: [
      { title: 'Member summary and totals', targets: ['.home-container > .header'] },
      { title: 'Monthly planning calendar', targets: ['.dashboard-calendar'] },
      { title: 'Latest member highlights', targets: ['.home-grid'] },
      { title: 'Personalized activity recommendations', targets: ['.recommended-section'] },
    ],
  },
  {
    file: '02b-home-alice.png',
    route: '/home',
    waitFor: '.home-container',
    authenticated: true,
    session: 'alice',
    callouts: [
      { title: 'Alice’s member summary and totals', targets: ['.home-container > .header'] },
      { title: 'Alice’s personal calendar', targets: ['.dashboard-calendar'] },
      { title: 'Alice’s latest member highlights', targets: ['.home-grid'] },
      { title: 'Recommendations based on Alice’s interests and skills', targets: ['.recommended-section'] },
    ],
  },
  {
    file: '02c-home-mobile-menu.png',
    route: '/home',
    waitFor: '.home-container',
    authenticated: true,
    showNavigation: true,
    preserveFixedNavigation: true,
    viewport: { width: 390, height: 844 },
    fullPage: false,
    action: async (page) => {
      await page.locator('app-nav-bar .menuButton').click();
      await page.waitForSelector('#mobile-more-navigation', { state: 'visible' });
    },
    callouts: [
      { title: 'Home dashboard behind the mobile navigation overlay', targets: ['.home-container > .header'] },
      { title: 'Expanded burger menu with secondary destinations', targets: ['#mobile-more-navigation'] },
      { title: 'Mobile primary navigation and active More control', targets: ['app-nav-bar .mobileNavigation'] },
    ],
  },
  {
    file: '03-organisations.png',
    route: '/organisations',
    waitFor: '.organisations-page',
    authenticated: true,
    action: async (page) => {
      await page.waitForSelector('app-organisation-list .organisation-card');
      await page.addStyleTag({
        content: '.engagement-admin-copy > mat-icon { flex: 0 0 24px !important; width: 24px !important; min-width: 24px !important; overflow: visible !important; }',
      });
      await page.evaluate(() => {
        const lists = [...document.querySelectorAll('app-organisation-list')];
        const joined = lists[0];
        const recommended = lists[1];
        const all = lists[2];
        if (!joined || !recommended || !all) return;

        const sourceGrid = all.querySelector('.organisation-grid');
        const sourceCard = sourceGrid?.querySelector('.organisation-card:last-child');
        if (!sourceGrid || !sourceCard) return;

        const recommendationGrid = sourceGrid.cloneNode(false);
        recommendationGrid.appendChild(sourceCard.cloneNode(true));
        [...recommendationGrid.querySelectorAll('.tag')]
          .slice(0, 2)
          .forEach((tag) => tag.classList.add('tag--matched'));
        [...sourceCard.querySelectorAll('.tag')]
          .slice(0, 2)
          .forEach((tag) => tag.classList.add('tag--matched'));
        recommended.querySelector('.empty-state')?.replaceWith(recommendationGrid);
        const recommendedCount = recommended.querySelector('.section-header p');
        if (recommendedCount) recommendedCount.textContent = '1 organization';

        const joinedCards = [...joined.querySelectorAll('.organisation-card')];
        joinedCards.at(-1)?.remove();
        const joinedCount = joined.querySelector('.section-header p');
        if (joinedCount) joinedCount.textContent = `${Math.max(0, joinedCards.length - 1)} organizations`;
        const joinedStat = document.querySelectorAll('.stat-item')[1]?.querySelector('.stat-value');
        if (joinedStat) joinedStat.textContent = String(Math.max(0, joinedCards.length - 1));
      });
    },
    callouts: [
      { title: 'Organization overview and totals', targets: ['.organisations-page > .overview-header'] },
      { title: 'Engagement-level administration shortcuts', targets: ['.engagement-admin-panel'] },
      { title: 'Search and filter controls', targets: ['.organisations-page > .search-panel'] },
      { title: 'Joined organizations', targets: [{ selector: 'app-organisation-list', index: 0 }] },
      { title: 'Recommended and complete organization lists', targets: [
        { selector: 'app-organisation-list', index: 1 },
        { selector: 'app-organisation-list', index: 2 },
      ] },
    ],
  },
  {
    file: '04-organisation-detail.png',
    route: '/organisations/2',
    waitFor: '.organisation-container',
    authenticated: true,
    callouts: [
      { title: 'Administrator view of organization identity and engagement controls', targets: ['.header-card'] },
      { title: 'Community goals and progress management', targets: ['.goals-card'] },
      { title: 'New Urban Green Spaces Restoration project', targets: ['.project-card'] },
      { title: 'Organization activities and management action', targets: ['.activities-card'] },
      { title: 'Administrators, friends, and members', targets: ['.members-card'] },
    ],
  },
  {
    file: '04b-organisation-detail-alice.png',
    route: '/organisations/2',
    waitFor: '.organisation-container',
    authenticated: true,
    session: 'alice',
    callouts: [
      { title: 'Normal-user view of organization identity and engagement limits', targets: ['.header-card'] },
      { title: 'Read-only community goals and progress', targets: ['.goals-card'] },
      { title: 'Urban Green Spaces Restoration project', targets: ['.project-card'] },
      { title: 'Read-only organization activity browser', targets: ['.activities-card'] },
      { title: 'Organization administrators and membership', targets: ['.members-card'] },
    ],
  },
  {
    file: '05-engagement-levels.png',
    route: '/organisations/2/engagement-levels',
    waitFor: '.levels-page',
    authenticated: true,
    callouts: [
      { title: 'Updated engagement overview and administrator’s current level', targets: ['.levels-hero'] },
      { title: 'Initial and inactive engagement levels', targets: [
        { selector: '.level-card', index: 0 },
        { selector: '.level-card', index: 1 },
      ] },
      { title: 'Administrator-editable advanced levels and requirements', targets: [
        { selector: '.level-card', index: 2 },
        { selector: '.level-card', index: 3 },
        { selector: '.level-card', index: 4 },
      ] },
      { title: 'Administrator save controls and permissions summary', targets: ['.save-bar'] },
    ],
  },
  {
    file: '05b-engagement-levels-alice.png',
    route: '/organisations/2/engagement-levels',
    waitFor: '.levels-page',
    authenticated: true,
    session: 'alice',
    callouts: [
      { title: 'Updated engagement overview and Alice’s current level', targets: ['.levels-hero'] },
      { title: 'Read-only organization-admin access notice', targets: ['.read-only-note'] },
      { title: 'Initial and inactive engagement levels', targets: [
        { selector: '.level-card', index: 0 },
        { selector: '.level-card', index: 1 },
      ] },
      { title: 'Read-only advanced levels and disabled requirements', targets: [
        { selector: '.level-card', index: 2 },
        { selector: '.level-card', index: 3 },
        { selector: '.level-card', index: 4 },
      ] },
    ],
  },
  {
    file: '06-activities.png',
    route: '/activities',
    waitFor: '.activities-page',
    authenticated: true,
    action: async (page) => {
      await page.addStyleTag({
        content: '.activity-grid .activity-card:nth-child(n + 4) { display: none !important; }',
      });
    },
    callouts: [
      { title: 'Activity overview and totals', targets: ['.activities-page > .overview-header'] },
      { title: 'Activity search and filters', targets: ['.activities-page > .search-panel'] },
      { title: 'Joined and recommended activities', targets: [
        { selector: '.activity-section', index: 0 },
        { selector: '.activity-section', index: 1 },
      ] },
      { title: 'Representative complete activity catalog', targets: [{ selector: '.activity-section', index: 2 }] },
      { title: 'Create activity action', targets: ['button.corner-button'] },
    ],
  },
  {
    file: '06a-activities-filter-open.png',
    route: '/activities',
    waitFor: '.activities-page',
    authenticated: true,
    action: async (page) => {
      await page.locator('.activities-page > .search-panel .app-filter-button').click();
      await page.waitForSelector('#activity-filters', { state: 'visible' });

      const filterLists = page.locator('#activity-filters mat-chip-listbox');
      await filterLists.nth(0).locator('mat-chip-option').filter({ hasText: 'Open' }).first().click();
      await page.waitForTimeout(250);

      const visibleTag = (await page.locator('.activity-section .activity-card .activity-tag').first().textContent())?.trim();
      if (visibleTag) {
        const matchingTag = filterLists.nth(1).locator('mat-chip-option').filter({ hasText: visibleTag }).first();
        if (await matchingTag.count()) {
          await matchingTag.click();
          await page.waitForTimeout(250);
        }
      }

      await page.addStyleTag({
        content: '.activity-grid .activity-card:nth-child(n + 3) { display: none !important; }',
      });
      await page.evaluate(() => {
        const sections = [...document.querySelectorAll('.activity-section')]
          .filter((section) => section.getBoundingClientRect().height > 0);
        sections.slice(1).forEach((section) => section.setAttribute('style', 'display: none !important'));
      });
    },
    callouts: [
      { title: 'Activity search and active filter count', targets: ['.activities-page > .search-panel'] },
      { title: 'Expanded filters with a selected status and tag', targets: ['#activity-filters'] },
      { title: 'Activities matching the selected filters', targets: [{ selector: '.activity-section', index: 0 }] },
    ],
  },
  {
    file: '07-activity-detail.png',
    route: '/activities/1',
    waitFor: '.detail-page',
    authenticated: true,
    callouts: [
      { title: 'Activity identity, schedule, availability, and primary action', targets: ['.hero-card'] },
      { title: 'Description, skills, and preparation', targets: [
        { selector: '.main-column > .content-card', index: 0 },
        { selector: '.main-column > .content-card', index: 1 },
      ] },
      { title: 'Volunteer participation and additional details', targets: [
        { selector: '.main-column > .content-card', index: 2 },
        { selector: '.main-column > .content-card', index: 3 },
      ] },
      { title: 'Organizing body and activity contacts', targets: ['.side-column'] },
    ],
  },
  {
    file: '08-community-friends.png',
    route: '/community',
    waitFor: 'app-friends',
    authenticated: true,
    action: async (page) => {
      await page.waitForSelector('app-friends-graph .cy-container');
      await page.waitForTimeout(1200);
    },
    callouts: [
      { title: 'Community section tabs', targets: [{ selector: 'mat-tab-header', index: 0 }] },
      { title: 'Friends and their recent activities', targets: ['.friends-group'] },
      { title: 'Relationship and activity graph switch', targets: [{ selector: 'mat-tab-header', index: 1 }] },
      { title: 'Relationship-type legend', targets: ['app-friends-graph .legend'] },
      { title: 'Interactive relationship graph', targets: ['app-friends-graph .cy-container'] },
    ],
  },
  {
    file: '08b-community-activity-graph.png',
    route: '/community',
    waitFor: 'app-friends',
    authenticated: true,
    action: async (page) => {
      await page.getByRole('tab', { name: 'Activity Graph' }).click();
      await page.waitForSelector('app-activity-graph .cy-container');
      await page.waitForSelector('app-activity-graph .legend-item');
      await page.waitForTimeout(1200);
    },
    callouts: [
      { title: 'Activity Graph selected in the graph switch', targets: [{ selector: 'mat-tab-header', index: 1 }] },
      { title: 'Interactive activity selection filters', targets: ['app-activity-graph .legend'] },
      { title: 'Shared-activity relationship graph', targets: ['app-activity-graph .cy-container'] },
    ],
  },
  {
    file: '09-community-forum.png',
    route: '/community',
    waitFor: 'mat-tab-group',
    authenticated: true,
    action: async (page) => {
      await page.getByRole('tab', { name: 'Forum' }).click();
      await page.waitForSelector('.forum-list');
    },
    callouts: [
      { title: 'Community section tabs', targets: ['mat-tab-header'] },
      { title: 'Forum search', targets: ['.forum-header'] },
      { title: 'Forum topic list', targets: ['.forum-list'] },
      { title: 'Create topic action', targets: ['app-forum button.corner-button'] },
    ],
  },
  {
    file: '09b-forum-open.png',
    route: '/community',
    waitFor: 'mat-tab-group',
    authenticated: true,
    action: async (page) => {
      await page.getByRole('tab', { name: 'Forum' }).click();
      await page.waitForSelector('app-forum .forum-list app-card');
      await page.locator('app-forum .forum-list app-card').first().click();
      await page.waitForURL('**/community/forum/*');
      await page.waitForSelector('.forum-detail .topic-header');
    },
    callouts: [
      { title: 'Back navigation to the community overview', targets: ['.forum-detail .back-link'] },
      { title: 'Opened forum topic and metadata', targets: ['.forum-detail .topic-header'] },
      { title: 'Forum reply history', targets: ['.forum-detail .reply-list'] },
      { title: 'Reply composer and submit action', targets: ['.forum-detail .reply-form'] },
    ],
  },
  {
    file: '09c-chat-open.png',
    route: '/community',
    waitFor: 'mat-tab-group',
    authenticated: true,
    session: 'alice',
    fullPage: false,
    action: async (page) => {
      await page.getByRole('tab', { name: 'Chat' }).click();
      await page.waitForSelector('app-chat .conversation-card');
      await page.locator('app-chat .conversation-card').first().click();
      await page.waitForURL('**/community/chat/*');
      await page.waitForSelector('.chat-detail .chat-title');
    },
    callouts: [
      { title: 'Back navigation to the community overview', targets: ['.chat-detail .back-link'] },
      { title: 'Opened conversation contact and presence', targets: ['.chat-detail .chat-title'] },
      { title: 'Incoming and outgoing message history', targets: ['.chat-detail .message-list'] },
      { title: 'Message composer and send action', targets: ['.chat-detail .message-form'] },
    ],
  },
  {
    file: '10-profile.png',
    route: '/profile',
    waitFor: '.profile-card',
    authenticated: true,
    action: async (page) => {
      await page.waitForSelector('.profile-card mat-card-content app-card');
      await page.evaluate(() => {
        const content = document.querySelector('.profile-card mat-card-content');
        if (!content) return;
        let visibleCardsInGroup = 0;
        [...content.children].forEach((child) => {
          if (child.tagName === 'H3') {
            visibleCardsInGroup = 0;
          } else if (child.tagName === 'APP-CARD') {
            visibleCardsInGroup += 1;
            if (visibleCardsInGroup > 2) {
              child.setAttribute('style', 'display: none !important');
              if (child.nextElementSibling?.tagName === 'BR') {
                child.nextElementSibling.setAttribute('style', 'display: none !important');
              }
            }
          }
        });
      });
    },
    callouts: [
      { title: 'Profile identity and edit action', targets: ['.profile-card mat-card-header'] },
      { title: 'Account details, skills, and interests', targets: [
        { selector: '.profile-card mat-card-content > p', index: 0 },
        '.profile-tags',
      ] },
      { title: 'Representative friends, organizations, and activities', targets: ['.profile-card mat-card-content'] },
      { title: 'Share profile action', targets: ['app-share-button .share-btn'] },
    ],
  },
  {
    file: '11-calendar.png',
    route: '/calendar',
    waitFor: '.calendar-page',
    authenticated: true,
    callouts: [
      { title: 'Calendar introduction and appointment creation', targets: ['.calendar-page > .page-header'] },
      { title: 'Monthly calendar, view switch, and event markers', targets: ['app-calendar-month'] },
    ],
  },
  {
    file: '11b-calendar-map.png',
    route: '/calendar',
    waitFor: '.calendar-page',
    authenticated: true,
    fullPage: false,
    action: async (page) => {
      await page.waitForSelector('app-calendar-month .days-grid');
      await page.getByRole('button', { name: 'Map', exact: true }).click();
      await page.waitForSelector('app-calendar-month .map-view google-map');
      await page.waitForTimeout(1200);
    },
    callouts: [
      { title: 'Calendar introduction and appointment creation', targets: ['.calendar-page > .page-header'] },
      { title: 'Map selected in the Calendar/Map view switch', targets: ['app-calendar-month .calendar-toolbar'] },
      { title: 'Location count, activity focus control, and marker legend', targets: ['app-calendar-month .map-summary'] },
      { title: 'Interactive map of activities and joined organisations', targets: ['app-calendar-month .map-view google-map'] },
    ],
  },
  {
    file: '11c-calendar-schedule.png',
    route: '/calendar',
    waitFor: '.calendar-page',
    authenticated: true,
    focusAnnotations: true,
    action: async (page) => {
      await page.waitForSelector('.appointment-items .appointment-item');
      await page.addStyleTag({
        content: '.appointment-items .appointment-item:nth-child(n + 6) { display: none !important; }',
      });
    },
    callouts: [
      { title: 'Schedule summary and entry count', targets: ['.personal-list .list-heading'] },
      { title: 'Entry type and timeframe filters', targets: ['.filter-groups'] },
      { title: 'Representative detailed schedule entries and actions', targets: ['.appointment-items'] },
    ],
  },
  {
    file: '12-reports.png',
    route: '/reports',
    waitFor: '.reports-page',
    authenticated: true,
    callouts: [
      { title: 'Report filters and volunteer selector', targets: ['.reports-toolbar'] },
      { title: 'Key performance indicators', targets: ['.metric-grid'] },
      { title: 'Activity trend and category distribution', targets: [
        { selector: '.chart-panel', index: 0 },
        { selector: '.chart-panel', index: 1 },
      ] },
      { title: 'Volunteer contribution and capacity demand', targets: [
        { selector: '.chart-panel', index: 2 },
        { selector: '.chart-panel', index: 3 },
      ] },
      { title: 'Most requested activity summary', targets: ['.activity-strip'] },
    ],
  },
  {
    file: '13-admin-assignments.png',
    route: '/admin/organisation-assignments',
    waitFor: '.assignment-page',
    authenticated: true,
    action: async (page) => {
      await page.addStyleTag({
        content: '.assignment-grid .assignment-card:nth-child(n + 5) { display: none !important; }',
      });
    },
    callouts: [
      { title: 'Platform administration overview', targets: ['.assignment-page > .page-header'] },
      { title: 'Protected platform-admin behavior', targets: ['.notice'] },
      { title: 'Representative organization assignment cards', targets: ['.assignment-grid'] },
      { title: 'Eligible administrators and save actions', targets: ['.admin-list', '.card-actions'] },
    ],
  },
  {
    file: '14-create-activity.png',
    route: '/createActivity',
    waitFor: '.form-page',
    authenticated: true,
    action: async (page) => {
      await page.locator('google-map').scrollIntoViewIfNeeded();
      await page.waitForTimeout(2200);
    },
    callouts: [
      { title: 'Activity creation overview', targets: ['.form-page > .page-header'] },
      { title: 'Activity basics, ownership, and schedule', targets: [{ selector: '.form-section', index: 0 }] },
      { title: 'Map-based location selection', targets: [{ selector: '.form-section', index: 1 }] },
      { title: 'Skills, tags, qualifications, and prerequisites', targets: [{ selector: '.form-section', index: 2 }] },
      { title: 'Cancel and create actions', targets: ['.submit-container'] },
    ],
  },
  {
    file: '15-create-project.png',
    route: '/projects/new',
    waitFor: '.project-page',
    authenticated: true,
    action: async (page) => {
      await page.addStyleTag({
        content: '.tip-card > mat-icon { flex: 0 0 24px !important; width: 24px !important; min-width: 24px !important; overflow: visible !important; }',
      });
      await page.locator('google-map').scrollIntoViewIfNeeded();
      await page.waitForTimeout(2200);
    },
    callouts: [
      { title: 'Project creation overview', targets: ['.project-page > .page-hero'] },
      { title: 'Project identity, timeframe, and location', targets: ['.form-column'] },
      { title: 'Organization ownership and guidance', targets: ['.project-layout > .side-column'] },
      { title: 'Cancel and create actions', targets: ['.project-layout .actions'] },
    ],
  },
  {
    file: '16-goals-overview.png',
    route: '/community-goals?organisationId=2',
    waitFor: '.overview-container',
    authenticated: true,
    action: async (page) => {
      const contributors = page.locator('.goal-contributors');
      if (await contributors.count()) {
        await contributors.first().locator('mat-expansion-panel-header').click();
        await page.waitForSelector('.contribution-list');
        await page.waitForTimeout(600);
      }
    },
    callouts: [
      { title: 'Organization goal overview and creation action', targets: ['.overview-header'], padding: 0 },
      { title: 'Environmental goal progress, qualifying interest, and completed activities', targets: [
        { selector: '.goal-item', index: 0 },
      ], padding: 0, badgePosition: 'center-right' },
      { title: 'Monthly volunteer goal progress and activity total', targets: [
        { selector: '.goal-item', index: 1 },
      ], padding: 0, badgePosition: 'center-right' },
    ],
  },
  {
    file: '17-create-goal.png',
    route: '/community-goals?organisationId=2&mode=create',
    waitFor: '.goal-form',
    authenticated: true,
    action: async (page) => {
      await page.getByLabel('Goal title').fill('Restore five urban green spaces');
      await page.getByLabel('Description').fill('Coordinate recurring volunteer activities that improve accessible green spaces across the community.');
      await page.getByLabel('Target value').fill('5');
      await page.getByLabel('End date').fill('12/31/2026');
    },
    callouts: [
      { title: 'Community-goal creation overview', targets: ['.form-page > .page-header'] },
      { title: 'Goal title and impact description', targets: [{ selector: '.goal-form > .form-section', index: 0 }] },
      { title: 'Target value and qualifying activity interests', targets: [{ selector: '.goal-form > .form-section', index: 1 }] },
      { title: 'Goal contribution timeframe', targets: [{ selector: '.goal-form > .form-section', index: 2 }] },
      { title: 'Cancel and create-goal actions', targets: ['.goal-form > .submit-container'] },
    ],
  },
  {
    file: '18-create-organisation.png',
    route: '/createOrganisation',
    waitFor: '.organisation-form',
    authenticated: true,
    action: async (page) => {
      await page.waitForTimeout(1800);
    },
    callouts: [
      { title: 'Organization creation overview', targets: ['.form-page > .page-header'] },
      { title: 'Organization identity and mission', targets: [{ selector: '.organisation-form > .form-section', index: 0 }] },
      { title: 'Category, discovery tags, and custom tags', targets: [{ selector: '.organisation-form > .form-section', index: 1 }] },
      { title: 'Map-based organization home base', targets: [{ selector: '.organisation-form > .form-section', index: 2 }] },
      { title: 'Optional team members and role assignments', targets: [
        { selector: '.organisation-form > .form-section', index: 3 },
      ] },
      { title: 'Required-field status and organization creation action', targets: [
        '.organisation-form > .submit-container',
      ] },
    ],
  },
  {
    file: '19-navigation.png',
    route: '/createOrganisation',
    waitFor: '.organisation-form',
    authenticated: true,
    showNavigation: true,
    preserveFixedNavigation: true,
    fullPage: false,
    viewport: { width: 1440, height: 520 },
    action: async (page) => {
      await page.addStyleTag({
        content: `
          .app-main > app-header,
          .app-main > .app-content {
            visibility: hidden !important;
          }
          .app-main,
          body {
            background: #f9f9fe !important;
          }
        `,
      });
    },
    clipTo: 'app-nav-bar .desktopNavigation',
    clipMargin: 48,
    callouts: [
      { title: 'Primary desktop navigation and central Home action', targets: ['app-nav-bar .desktopNavigation'] },
    ],
  },
];

async function waitForImages(page) {
  await page.evaluate(async () => {
    await document.fonts?.ready;
    const pendingImages = [...document.images]
      .filter((image) => !image.complete)
      .map((image) => new Promise((resolve) => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
        setTimeout(resolve, 3000);
      }));
    await Promise.all(pendingImages);
  });
}

async function addAnnotations(page, callouts, viewportOnly = false) {
  return page.evaluate(({ definitions, viewportOnly: constrainToViewport }) => {
    document.getElementById('documentation-annotations')?.remove();

    const documentWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    const documentHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    const annotationWidth = constrainToViewport ? window.innerWidth : documentWidth;
    const annotationHeight = constrainToViewport ? window.innerHeight : documentHeight;

    const root = document.createElement('div');
    root.id = 'documentation-annotations';
    root.setAttribute('aria-hidden', 'true');
    Object.assign(root.style, {
      position: 'absolute',
      inset: '0',
      width: `${annotationWidth}px`,
      height: `${annotationHeight}px`,
      pointerEvents: 'none',
      zIndex: '2147483647',
    });

    const results = [];

    definitions.forEach((definition, calloutIndex) => {
      const rectangles = [];

      definition.targets.forEach((target) => {
        const nodes = [...document.querySelectorAll(target.selector)];
        const selectedNodes = target.index === null || target.index === undefined
          ? nodes
          : (nodes[target.index] ? [nodes[target.index]] : []);

        selectedNodes.forEach((node) => {
          const rect = node.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            rectangles.push({
              left: rect.left + window.scrollX,
              top: rect.top + window.scrollY,
              right: rect.right + window.scrollX,
              bottom: rect.bottom + window.scrollY,
            });
          }
        });
      });

      if (!rectangles.length) {
        results.push({ title: definition.title, found: false });
        return;
      }

      const padding = definition.padding ?? 8;
      const left = Math.max(4, Math.min(...rectangles.map((rect) => rect.left)) - padding);
      const top = Math.max(4, Math.min(...rectangles.map((rect) => rect.top)) - padding + (definition.yOffset ?? definition.topOffset ?? 0));
      const right = Math.min(annotationWidth - 4, Math.max(...rectangles.map((rect) => rect.right)) + padding);
      const bottom = Math.min(
        annotationHeight - 4,
        Math.max(...rectangles.map((rect) => rect.bottom)) + padding + (definition.yOffset ?? definition.bottomOffset ?? 0),
      );

      const box = document.createElement('div');
      Object.assign(box.style, {
        position: 'absolute',
        left: `${left}px`,
        top: `${top}px`,
        width: `${right - left}px`,
        height: `${bottom - top}px`,
        border: '4px solid #d62828',
        borderRadius: '14px',
        boxSizing: 'border-box',
        background: 'rgba(214, 40, 40, 0.018)',
        boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.9), 0 2px 8px rgba(0, 0, 0, 0.18)',
      });

      const badge = document.createElement('div');
      badge.textContent = String(calloutIndex + 1);
      const badgePosition = definition.badgePosition ?? 'top-left';
      const badgeOnRight = badgePosition === 'top-right' || badgePosition === 'center-right';
      const badgeVerticallyCentered = badgePosition === 'center-left' || badgePosition === 'center-right';
      Object.assign(badge.style, {
        position: 'absolute',
        left: badgePosition === 'top-center'
          ? 'calc(50% - 19px)'
          : (badgeOnRight ? 'auto' : (left < 28 ? '6px' : '-18px')),
        right: badgeOnRight
          ? (right > annotationWidth - 28 ? '6px' : '-18px')
          : 'auto',
        top: badgeVerticallyCentered
          ? 'calc(50% - 19px)'
          : (top < 28 ? '6px' : '-18px'),
        width: '38px',
        height: '38px',
        borderRadius: '999px',
        display: 'grid',
        placeItems: 'center',
        color: '#fff',
        background: '#d62828',
        border: '3px solid #fff',
        boxShadow: '0 2px 7px rgba(0, 0, 0, 0.24)',
        font: '700 20px/1 Arial, sans-serif',
      });

      box.appendChild(badge);
      root.appendChild(box);
      results.push({ title: definition.title, found: true, top, bottom });
    });

    document.body.appendChild(root);
    return results;
  }, {
    viewportOnly,
    definitions: callouts.map((callout) => ({
      ...callout,
      targets: callout.targets.map((target) => (
        typeof target === 'string' ? { selector: target, index: null } : target
      )),
    })),
  });
}

async function preparePage(page, screen) {
  const navigationStyles = screen.showNavigation
    ? (screen.preserveFixedNavigation
      ? `app-nav-bar { display: block !important; }`
      : `
        app-nav-bar {
          display: block !important;
          position: relative !important;
        }
        app-nav-bar .toolbarNav {
          position: static !important;
          inset: auto !important;
          transform: none !important;
          margin: 32px auto 24px !important;
        }
      `)
    : `app-nav-bar { display: none !important; }`;

  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        caret-color: transparent !important;
      }
      html { scroll-behavior: auto !important; }
      html,
      body,
      .app-main,
      .app-content,
      .routed-content {
        background: #f9f9fe !important;
      }
      .mat-mdc-snack-bar-container {
        display: none !important;
      }
      .mat-ripple-element,
      .mat-mdc-button-ripple,
      .mat-mdc-button-persistent-ripple::before {
        display: none !important;
        opacity: 0 !important;
      }
      ${navigationStyles}
      .save-bar,
      .submit-container {
        position: static !important;
        inset: auto !important;
        transform: none !important;
        margin: 24px auto !important;
      }
      button.corner-button {
        position: static !important;
        inset: auto !important;
        transform: none !important;
        display: flex !important;
        margin: 24px 48px 72px auto !important;
      }
      app-share-button.corner-button {
        position: static !important;
        inset: auto !important;
        transform: none !important;
        display: flex !important;
        justify-content: flex-end !important;
        margin: 24px 48px 72px auto !important;
      }
      app-share-button.corner-button button {
        position: static !important;
        inset: auto !important;
        transform: none !important;
      }
      .gm-err-container,
      .gm-err-content {
        display: none !important;
      }
    `,
  });
  await waitForImages(page);
  const mapWarningButton = page.getByText('OK', { exact: true });
  if (await mapWarningButton.count()) {
    await mapWarningButton.last().click({ timeout: 1500 }).catch(() => {});
  }
  await page.waitForTimeout(800);
  if (await mapWarningButton.count()) {
    await mapWarningButton.last().click({ timeout: 1500 }).catch(() => {});
  }
  await page.evaluate(() => window.scrollTo(0, 0));
}

async function capture(page, screen) {
  await page.setViewportSize(screen.viewport ?? defaultViewport);
  await page.goto(`${baseUrl}${screen.route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(screen.waitFor, { state: 'visible' });
  if (screen.action) {
    await screen.action(page);
  }
  await preparePage(page, screen);

  const results = await addAnnotations(page, screen.callouts, screen.fullPage === false);
  const missing = results.filter((result) => !result.found);
  if (missing.length) {
    console.warn(`${screen.file}: missing callouts: ${missing.map((entry) => entry.title).join(', ')}`);
  }

  const screenshotOptions = {
    path: new URL(screen.file, outputDirectory).pathname,
    type: 'png',
  };

  if (screen.clipTo) {
    const target = page.locator(screen.clipTo);
    const box = await target.boundingBox();
    if (!box) {
      throw new Error(`${screen.file}: clip target not found: ${screen.clipTo}`);
    }
    const margin = screen.clipMargin ?? 32;
    const viewport = screen.viewport ?? defaultViewport;
    const x = Math.max(0, box.x - margin);
    const y = Math.max(0, box.y - margin);
    screenshotOptions.clip = {
      x,
      y,
      width: Math.min(viewport.width - x, box.width + margin * 2),
      height: Math.min(viewport.height - y, box.height + margin * 2),
    };
  } else if (screen.fullPage === false) {
    screenshotOptions.fullPage = false;
  } else {
    const foundResults = results.filter((result) => result.found);
    const annotatedTop = Math.min(...foundResults.map((result) => result.top ?? 0));
    const annotatedBottom = Math.max(...foundResults.map((result) => result.bottom ?? 0));
    const pageHeight = await page.evaluate(() => Math.max(document.documentElement.scrollHeight, document.body.scrollHeight));
    const width = (screen.viewport ?? defaultViewport).width;
    const captureTop = screen.focusAnnotations ? Math.max(0, Math.floor(annotatedTop - 40)) : 0;
    const height = Math.min(pageHeight - captureTop, Math.ceil(annotatedBottom - captureTop + 40));
    await page.setViewportSize({ width, height });
    if (captureTop) {
      await page.evaluate((top) => window.scrollTo(0, top), captureTop);
    }
    screenshotOptions.fullPage = false;
  }

  await page.screenshot(screenshotOptions);
  console.log(`Captured ${screen.file}`);
}

async function login(page, username, password) {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.fill('#username', username);
  await page.fill('#password', password);
  await Promise.all([
    page.waitForURL('**/home'),
    page.click('.btn-primary'),
  ]);
  await page.waitForSelector('.home-container');
}

async function resetSession(page) {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#username');
}

function buildLegend() {
  const lines = [
    '# Current annotated screenshot legend',
    '',
    'Red numbered boxes identify the main UI regions referenced by the technical documentation.',
    'Long catalog and administration pages use representative entries so the figures remain legible in academic layouts.',
    'Desktop navigation is documented once in `19-navigation.png`; the responsive mobile menu is documented in `02c-home-mobile-menu.png`.',
    '',
  ];

  for (const screen of screens) {
    lines.push(`## ${screen.file}`, '');
    screen.callouts.forEach((callout, index) => {
      lines.push(`${index + 1}. ${callout.title}`);
    });
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

const requestedFiles = new Set(process.argv.slice(2));
const captureScreens = requestedFiles.size
  ? screens.filter((screen) => requestedFiles.has(screen.file))
  : screens;

await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: defaultViewport,
  deviceScaleFactor: 1,
  colorScheme: 'light',
  reducedMotion: 'reduce',
});
const page = await context.newPage();
page.setDefaultTimeout(20_000);

try {
  for (const screen of captureScreens.filter((entry) => !entry.authenticated)) {
    await capture(page, screen);
  }

  await login(page, 'admin', 'admin123');

  for (const screen of captureScreens.filter((entry) => entry.authenticated && entry.session !== 'alice')) {
    await capture(page, screen);
  }

  const aliceScreens = captureScreens.filter((entry) => entry.session === 'alice');
  if (aliceScreens.length) {
    await resetSession(page);
    await login(page, 'alice', 'password');
    for (const screen of aliceScreens) {
      await capture(page, screen);
    }
  }

  await writeFile(new URL('LEGEND.md', outputDirectory), buildLegend(), 'utf8');
  console.log(`Wrote ${new URL('LEGEND.md', outputDirectory).pathname}`);
} finally {
  await browser.close();
}
