import pages from 'src/setup/pages' // Get Pages from config

//Blog
export default [
  {
    title: 'ibuilder.cms.sidebar.adminGroup',
    icon: 'fa-light fa-puzzle',
    children: [
      pages.qbuilder.blocks,
      pages.qbuilder.editor,
    ]
  },
]
