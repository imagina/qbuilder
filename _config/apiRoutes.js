const moduleName = 'ibuilder';
const moduleVersion = 'v1';
const urlBase = `/${moduleName}/${moduleVersion}`


export default {
  urlBase: urlBase,
  version: moduleVersion,
  layouts: `${urlBase}/layouts`,
  blocks: `${urlBase}/blocks`,
  editor: `${urlBase}/editor`,
  layoutBlocks: `${urlBase}/layout-blocks`,
}
