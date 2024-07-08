import pages from 'src/setup/pages' // Get Pages from config

//Builder
export default [
  {
    title: 'ibuilder.cms.sidebar.adminGroup',
    icon: 'fa-light fa-object-group',
    children: [
      pages.qbuilder.blocks,
      pages.qbuilder.editor,
    ]
  }
]
