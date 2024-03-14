const moduleName = 'ibuilder';
const moduleVersion = 'v1';
const urlBase = `/${moduleName}/${moduleVersion}`


export default {
  urlBase: urlBase,
  version: moduleVersion,
  blocks: `${urlBase}/blocks`,
  editor: `${urlBase}/editor`,
  layouts: `${urlBase}/layouts`,
  layoutBlocks: `${urlBase}/layout-blocks`,
}
