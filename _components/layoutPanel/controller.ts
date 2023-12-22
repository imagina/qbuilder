import {computed, reactive, ref, onMounted, toRefs, getCurrentInstance, watch} from "vue";
import service from "@imagina/qbuilder/_components/layoutPanel/services";
import store from "@imagina/qbuilder/_pages/admin/editor/store";
import recursiveStore from "@imagina/qsite/_components/v3/recursiveItem/store";

export default function layoutController(props: any, emit: any) {
    const proxy = getCurrentInstance()!.proxy
    // Refs
    const refs = {
        // key: ref(defaultValue)
    }

    // States
    const state = reactive({
        loading: false,
        layouts: [],
        mapLayouts: []
    })

    // Computed
    const computeds = {}

    // Methods
    const methods = {
        getLayouts(crudAction = '') {
            state.loading = true
            //Request
            service.getLayouts(true).then(response => {
                state.layouts = response.data

                if(crudAction == 'created') {
                    const firstLayout = state.layouts[0]
                    recursiveStore.itemSelected = firstLayout;
                    store.layoutSelected = firstLayout
                } else if (crudAction == 'updated') {
                    const layout = state.layouts.find(i => i.id == store.layoutSelected.id)

                    if(layout) {
                        store.layoutSelected = layout
                    }
                }

                state.mapLayouts = methods.orderedItems()
                state.loading = false
            }).catch(error => state.loading = false)
        },
        createItem() {
            emit('create')
        },
        builderConfig() {
            let config = proxy.$store.getters['qsiteApp/getConfigApp']('builder.layout', true)
            let response = {}

            //Filter only items with values
            Object.keys(config).forEach(moduleName => {
                if (config[moduleName]) response[moduleName] = config[moduleName]
            })
            return response
        },
        orderedItems() {
            const config = methods.builderConfig();
            const response = [];


            Object.keys(config).forEach(key => {
                for (const module of config[key]) {
                    const filterByEntityType = state.layouts.filter((lay) => lay.entityType == module.entity.value)

                    if (filterByEntityType.length) {
                        for (const type of module.types) {
                            const layoutFiltered = filterByEntityType.filter((lay) => lay.type == type.value)
                            if (layoutFiltered.length) {
                                response.push(methods.setObjToSendRecursive(module.entity.label, type.label, layoutFiltered))
                            }
                        }
                        const layoutFilteredNull = filterByEntityType.filter((lay) => lay.type == null)
                        if (layoutFilteredNull.length) {
                            response.push(methods.setObjToSendRecursive(module.entity.label, 'Default', layoutFilteredNull))
                        }
                    }
                }
            })

            return response
        },
        setObjToSendRecursive(moduleName, typeName, layoutsFiltered) {
            return {
                title: `${moduleName} (${typeName})`,
                action: () => {},
                children: layoutsFiltered.map(item => ({...item,
                    activated: true,
                    action: methods.actionToGetLayout,
                    icon: 'fa-light fa-arrow-right'
                }))
            }
        },
        actionToGetLayout(value) {
            const item = value
            if (store.layoutSelected && store.layoutSelected.id !== item.id) {
                return new Promise(resolve => {
                    proxy.$alert.warning({
                        mode: 'modal',
                        title: proxy.$tr('ibuilder.cms.label.sureChangeLayout'),
                        message: proxy.$tr('ibuilder.cms.label.descriptionSureChangeLayout'),
                        actions: [
                            {label: proxy.$tr('isite.cms.label.cancel'), color: 'grey-8', handler: () => resolve(false)},
                            {
                                label: proxy.$tr('isite.cms.label.accept'),
                                color: 'green',
                                handler: () => {
                                    const layout = state.layouts.find(i => i.id === item.id)
                                    store.layoutSelected = layout
                                    emit('selected', layout);
                                    resolve(true)
                                }
                            },
                        ]
                    })
                })
            } else {
                const layout = state.layouts.find(i => i.id === item.id)
                store.layoutSelected = layout
                emit('selected', layout);
                return Promise.resolve(true)
            }
        }
    }

    // Mounted
    onMounted(() => {
        methods.getLayouts()
    })

    return {...refs, ...(toRefs(state)), ...computeds, ...methods}
}
