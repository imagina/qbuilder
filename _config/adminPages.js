export default {
  blocks: {
    permission: 'ibuilder.blocks.manage',
    activated: true,
    path: '/builder/blocks',
    name: 'qbuilder.admin.blocks.index',
    crud: import('@imagina/qbuilder/_crud/blocks'),
    page: () => import('@imagina/qcrud/_pages/admin/crudPage'),
    layout: () => import('@imagina/qsite/_layouts/master.vue'),
    title: 'ibuilder.cms.sidebar.adminBlocks',
    icon: 'fa-light fa-puzzle-piece',
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
    page: () => import('@imagina/qbuilder/_pages/admin/formBlock'),
    layout: () => import('@imagina/qsite/_layouts/master.vue'),
    title: 'ibuilder.cms.newBlock',
    icon: 'fa-light fa-square-pen',
    authenticated: true,
    subHeader: {
      refresh: true,
      breadcrumb: ['qbuilder.blocks']
    }
  },
  formUpdateBlock: {
    permission: 'ibuilder.blocks.edit',
    activated: true,
    path: '/builder/blocks/:id',
    name: 'qbuilder.admin.blocks.update',
    page: () => import('@imagina/qbuilder/_pages/admin/formBlock'),
    layout: () => import('@imagina/qsite/_layouts/master.vue'),
    title: 'ibuilder.cms.updateBlock',
    icon: 'fa-light fa-square-pen',
    authenticated: true,
    subHeader: {
      refresh: true,
      breadcrumb: ['qbuilder.blocks']
    }
  },
  formUpdateBlockTemplate: {
    permission: 'ibuilder.blocks.edit',
    activated: true,
    path: '/builder/blocks/template/id',
    name: 'qbuilder.admin.blocks.update.template',
    page: () => import('@imagina/qbuilder/_pages/admin/formBlock'),
    layout: () => import('@imagina/qsite/_layouts/master.vue'),
    title: 'ibuilder.cms.updateBlock',
    icon: 'fa-light fa-square-pen',
    authenticated: true,
    subHeader: {
      refresh: true
    }
  },
}
