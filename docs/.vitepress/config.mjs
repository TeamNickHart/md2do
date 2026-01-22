import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'md2do',
  description:
    'A powerful CLI tool for scanning, filtering, and managing TODO tasks in markdown files',
  base: '/',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'icon', type: 'image/png', href: '/favicon.png' }],
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    [
      'meta',
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black' },
    ],
    [
      'script',
      {
        defer: '',
        'data-domain': 'md2do.com',
        src: 'https://plausible.io/js/script.js',
      },
    ],
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.svg',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'CLI Reference', link: '/cli/overview' },
      { text: 'GitHub', link: 'https://github.com/TeamNickHart/md2do' },
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'What is md2do?', link: '/guide/what-is-md2do' },
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Installation', link: '/guide/installation' },
        ],
      },
      {
        text: 'Guide',
        items: [
          { text: 'Task Format', link: '/guide/task-format' },
          { text: 'Filtering & Sorting', link: '/guide/filtering' },
          { text: 'Configuration', link: '/guide/configuration' },
          { text: 'Examples', link: '/guide/examples' },
        ],
      },
      {
        text: 'CLI Reference',
        items: [
          { text: 'Overview', link: '/cli/overview' },
          { text: 'list', link: '/cli/list' },
          { text: 'stats', link: '/cli/stats' },
          {
            text: 'todoist',
            collapsed: false,
            items: [
              { text: 'Overview', link: '/cli/todoist/overview' },
              { text: 'list', link: '/cli/todoist/list' },
              { text: 'add', link: '/cli/todoist/add' },
              { text: 'import', link: '/cli/todoist/import' },
              { text: 'sync', link: '/cli/todoist/sync' },
            ],
          },
        ],
      },
      {
        text: 'Integrations',
        items: [
          { text: 'Todoist Setup', link: '/integrations/todoist' },
          { text: 'MCP (AI Integration)', link: '/integrations/mcp' },
        ],
      },
      {
        text: 'Development',
        items: [
          { text: 'Contributing', link: '/development/contributing' },
          { text: 'Roadmap', link: '/development/roadmap' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/TeamNickHart/md2do' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 Nick Hart',
    },

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/TeamNickHart/md2do/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
  },
});
