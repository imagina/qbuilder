const pages = config('pages') // Get Pages from config

//Builder
export default [
  {
    title: 'ibuilder.cms.sidebar.adminGroup',
    icon: 'fa-light fa-puzzle',
    children: [
      pages.qbuilder.blocks,
      pages.qbuilder.editor,
    ]
  }
]

