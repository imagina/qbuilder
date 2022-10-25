const pages = config('pages') // Get Pages from config

//Blog
export default [
  {
    title: 'ibuilder.cms.sidebar.adminGroup',
    icon: 'fab fa-blogger',
    children: [
      pages.qbuilder.blocks,
      pages.qbuilder.templates
    ]
  },
]
