import {computed, reactive, ref, onMounted, toRefs, getCurrentInstance, watch} from "vue";
import service from "@imagina/qbuilder/_components/layoutPanel/services";
import store from "@imagina/qbuilder/_pages/admin/editor/store";

export default function layoutController(props: any, emit: any) {
    const proxy = getCurrentInstance()!.proxy
    // Refs
    const refs = {
        // key: ref(defaultValue)
    }

    // States
    const state = reactive({
        layoutSelected: null,
        loading: false,
        layouts: []
    })

    // Computed
    const computeds = {
        mapLayouts: computed(() => methods.orderedItems())
        // key: computed(() => {})
    }

    // Methods
    const methods = {
        getLayouts() {
            state.loading = true
            //Request
            service.getLayouts(true).then(response => {
                state.layouts = response.data
                state.loading = false
            }).catch(error => state.loading = false)
        },
        setLayoutSelected(itemSelected) {
            const item = proxy.$clone(itemSelected)
            emit('selected', {
                item, select: (val) => {
                    state.itemSelected = val
                }
            })
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
                                response.push({
                                    title: `${module.entity.label} (${type.label})`,
                                    action: () => {},
                                    children: layoutFiltered.map(item => ({...item,
                                        activated: true,
                                        action: (val) => {
                                            state.layoutSelected = state.layouts.find(i => i.id === val.id)
                                        },
                                        isSelected: false,
                                        icon: 'fa-light fa-arrow-right'
                                    }))
                                })
                            }
                        }
                        const layoutFilteredNull = filterByEntityType.filter((lay) => lay.type == null)
                        if (layoutFilteredNull.length) {
                            response.push({
                                title: `${module.entity.label} (Default)`,
                                children: layoutFilteredNull.map(item => ({...item,
                                    activated: true,
                                    action: (val) => {
                                      state.layoutSelected = state.layouts.find(i => i.id === val.id)
                                    },
                                    icon: 'fa-light fa-arrow-right',
                                    isSelected: false
                                })),
                                action: () => {
                                },
                            })
                        }
                    }
                }
            })

            return response
        }
    }

    watch(() => state.layoutSelected, () => {
        console.log(state.layoutSelected)
    })

    // Mounted
    onMounted(() => {
        methods.getLayouts()
    })

    return {...refs, ...(toRefs(state)), ...computeds, ...methods}
}
