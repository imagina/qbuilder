import {computed, reactive, ref, onMounted, toRefs, watch, getCurrentInstance} from "vue";
import storeEditor from '@imagina/qbuilder/_pages/admin/editor/store'

export default function controller(props: any, emit: any) {
  const proxy = getCurrentInstance()!.proxy

  // Refs
  const refs = {
    // refKey: ref(defaultValue)
  }

  // States
  const state = reactive({
    formBlock: null,
    configBlock: {},
    languageOptions: proxy.$store.getters['qsiteApp/getSelectedLocalesSelect'],
  })

  // Computed
  const computeds = {
    formFields: computed(() => {
      const fields = state.configBlock?.contentFields ?? {}
      const blockContentFields = !Object.keys(fields).length ? [] : Object.values(fields)

      return {
        block: [
          {
            name: "main",
            fields: {
              helpText: {
                type: "banner",
                colClass: "col-12",
                props: {
                  message: "Selecciona un 'Nombre de Sistema' unico que identifique el bloque y luego el componente que quieres perzonalizar..."
                }
              },
              internalTitle: {
                isTranslatable: true,
                type: "input",
                required: true,
                colClass: "col-12",
                props: {
                  label: proxy.$tr("isite.cms.form.title") + "*",
                  rules: [
                    val => !!val || proxy.$tr('isite.cms.message.fieldRequired')
                  ],
                }
              },
              systemName: {
                type: "input",
                required: true,
                colClass: "col-12",
                props: {
                  label: proxy.$tr("isite.cms.form.systemName") + "*"
                }
              },
              componentName: {
                type: "input",
                required: true,
                colClass: "col-12",
                props: {
                  label: proxy.$tr("isite.cms.label.block") + "*",
                  readonly: true
                }
              }
            }
          },
          {
            title: proxy.$tr("isite.cms.label.content"),
            fields: [
              {
                type: "banner",
                colClass: "col-12",
                props: {
                  message: "Configura aquí el contenido del componente..."
                }
              },
              {
                name: 'blockTitle',
                type: 'input',
                colClass: 'col-12',
                isTranslatable: true,
                props : {
                  label : proxy.$tr('isite.cms.form.title')
                }
              },
              {
                name: 'blockSubtitle',
                type: 'input',
                colClass: 'col-12',
                isTranslatable: true,
                props : {
                  label : proxy.$tr('isite.cms.label.subtitle')
                }
              },
              ...blockContentFields.map((field, keyField) => ({
                ...field, name: (field.name || keyField)
              })),
              //block bg image
              {
                name: 'mediasSingle',
                value: {},
                type: 'media',
                colClass: 'col-12',
                fieldItemId: props.block.id,
                props: {
                  label: proxy.$tr('isite.cms.label.backgroundImage'),
                  zone: 'blockbgimage',
                  entity: "Modules\\Ibuilder\\Entities\\Block",
                  entityId: null
                }
              },
            ]
          }
        ]
      }
    }),
  }

  // Methods
  const methods = {
    orderBlockSelect: () => {
      const blockSelected = props.block
      return {
        ...blockSelected,
        componentName: blockSelected.component.systemName
      }
    }
  }

  // Mounted
  onMounted(() => {
    state.formBlock = methods.orderBlockSelect()
    state.configBlock = storeEditor.blockConfigs?.find(block => block.systemName === props.block.component.systemName) ?? {}
  })

  // Watch
  // watch(key, (newField, oldField): void => {
  //
  // }, {deep: true})

  return {...refs, ...(toRefs(state)), ...computeds, ...methods}
}
