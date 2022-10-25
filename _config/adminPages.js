export default {
  //Blocks
  blocks: {
    permission: 'ibuilder.blocks.manage',
    activated: true,
    path: '/builder/blocks',
    name: 'qbuilder.admin.blocks.index',
    crud: import('@imagina/qbuilder/_crud/blocks'),
    page: () => import('@imagina/qcrud/_pages/admin/crudPage'),
    layout: () => import('@imagina/qbuilder/_layouts/master.vue'),
    title: 'ibuilder.cms.sidebar.adminBlocks',
    icon: 'fa-light fa-square-pen',
    authenticated: true,
    subHeader: {
      refresh: true
    }
  },
  templates: {
    permission: 'ibuilder.templates.manage',
    activated: true,
    path: '/builder/templates',
    name: 'qbuilder.admin.templates.index',
    crud: import('@imagina/qbuilder/_crud/templates'),
    page: () => import('@imagina/qcrud/_pages/admin/crudPage'),
    layout: () => import('@imagina/qbuilder/_layouts/master.vue'),
    title: 'ibuilder.cms.sidebar.adminTemplates',
    icon: 'fa-light fa-square-pen',
    authenticated: true,
    subHeader: {
      refresh: true
    }
  },
  formConfigBlock: {
    permission: 'ibuilder.blocks.create',
    activated: true,
    path: '/builder/blocks/create',
    name: 'qbuilder.admin.blocks.create',
    page: () => import('@imagina/qbuilder/_pages/admin/blocks/form'),
    layout: () => import('@imagina/qbuilder/_layouts/master.vue'),
    title: 'ibuilder.cms.newBlock',
    icon: 'fa-light fa-square-pen',
    authenticated: true,
    subHeader: {
      refresh: true,
      breadcrumb: ['qbuilder.blocks']
    }
  },
  formUpdateBlock: {
    permission: 'ibuilder.blocks.create',
    activated: true,
    path: '/builder/blocks/:id',
    name: 'qbuilder.admin.blocks.update',
    page: () => import('@imagina/qbuilder/_pages/admin/blocks/form'),
    layout: () => import('@imagina/qbuilder/_layouts/master.vue'),
    title: 'ibuilder.cms.updateBlock',
    icon: 'fa-light fa-square-pen',
    authenticated: true,
    subHeader: {
      refresh: true,
      breadcrumb: ['qbuilder.blocks']
    }
  },
}
