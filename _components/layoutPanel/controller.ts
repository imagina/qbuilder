import {computed, reactive, ref, onMounted, toRefs, getCurrentInstance, watch} from "vue";
import service from "@imagina/qbuilder/_components/layoutPanel/services";
import store from "@imagina/qbuilder/_pages/admin/editor/store";
import recursiveStore from "@imagina/qsite/_components/v3/recursiveItem/store";
import {Layout} from '@imagina/qbuilder/_components/layoutPanel/interface'

//Map the object as needed by the recursiveItem
interface MapLayout {
    title: string,
    action: () => void,
    children: MapLayoutChildren[]
}

interface MapLayoutChildren extends Layout {
    activated: Boolean,
    action: (value: MapLayoutChildren) => Promise<Boolean>,
    icon: string
}

export default function layoutController(props: any, emit: any) {
    const proxy = getCurrentInstance()!.proxy
    // Refs
    const refs = {
        // key: ref(defaultValue)
    }

    //State Props Interface
    interface StateProps {
        loading: Boolean,
        layouts: Layout[],
        mapLayouts: MapLayout[]
    }

    // States
    const state = reactive<StateProps>({
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

                //If the action is create, assign the first layout to the editor and recursiveItem stores
                if(crudAction == 'created') {
                    const firstLayout = state.layouts[0]
                    recursiveStore.itemSelected = firstLayout;
                    store.layoutSelected = firstLayout
                } else if (crudAction == 'updated') {
                    //If an update is made, find the layout
                    const layout = state.layouts.find(i => i.id == store.layoutSelected?.id)

                    //Reload the layout that was updated
                    if(layout) {
                        store.layoutSelected = layout
                    }
                }

                //Every time the service is called, the layouts will be remapped
                state.mapLayouts = methods.orderedItems()
                state.loading = false
            }).catch(error => state.loading = false)
        },
        createItem() {
            emit('create')
        },
        //Get the configs from builder.layout
        builderConfig() {
            let config = proxy.$store.getters['qsiteApp/getConfigApp']('builder.layout', true)
            let response = {}

            //Filter only items with values
            Object.keys(config).forEach(moduleName => {
                if (config[moduleName]) response[moduleName] = config[moduleName]
            })
            return response
        },
        //Order the layouts to send to recursiveItem
        orderedItems() {
            const config = methods.builderConfig();
            const response: MapLayout[] = [];

            //Loop all config modules
            Object.keys(config).forEach(key => {
                //Loop each module property
                for (const module of config[key]) {
                    //Filter by entityType
                    const filterByEntityType = state.layouts.filter((lay) => lay.entityType == module.entity.value)

                    if (filterByEntityType.length) {
                        //Loop the types of each property
                        for (const type of module.types) {
                            //Filter by module types
                            const layoutFiltered = filterByEntityType.filter((lay) => lay.type == type.value)
                            if (layoutFiltered.length) {
                                //Map the object as needed by the recursiveItem
                                response.push(methods.setObjToSendRecursive(module.entity.label, type.label, layoutFiltered))
                            }
                        }
                        //Check for nulls to say it is Default
                        const layoutFilteredNull = filterByEntityType.filter((lay) => lay.type == null)
                        if (layoutFilteredNull.length) {
                            //Map the object as needed by the recursiveItem
                            response.push(methods.setObjToSendRecursive(module.entity.label, 'Default', layoutFilteredNull))
                        }
                    }
                }
            })

            return response
        },
        //Map information for the recursiveItem
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
        //Define the action that will have coda children in recursiveItem
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
                                    const layout= state.layouts.find(i => i.id === item.id)
                                    if(layout) {
                                        store.layoutSelected = layout
                                        emit('selected', layout);
                                        resolve(true)
                                    } else {
                                        resolve(false)
                                    }
                                }
                            },
                        ]
                    })
                })
            } else {
                const layout = state.layouts.find(i => i.id === item.id)
                if(layout) {
                    store.layoutSelected = layout
                    emit('selected', layout);
                    return Promise.resolve(true)
                } else {
                    return Promise.resolve(false)
                }
            }
        }
    }

    // Mounted
    onMounted(() => {
        methods.getLayouts()
    })

    return {...refs, ...(toRefs(state)), ...computeds, ...methods}
}
