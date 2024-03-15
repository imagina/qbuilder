import { reactive, onMounted, toRefs } from 'vue';
import service from 'src/modules/qbuilder/_components/layoutList/services';
import store from 'src/modules/qbuilder/_pages/admin/editor/store';
import recursiveStore from 'src/modules/qsite/_components/v3/recursiveItem/store';
import { Layout } from 'src/modules/qbuilder/_components/layoutList/interface';
import { i18n, clone, store as globalStore, alert } from 'src/plugins/utils';

//Map the object as needed by the recursiveItem
interface MapLayout {
  label: string,
  action?: () => void,
  children: MapLayoutChildren[],
  headerClass?: string,
  customClass?: string
}

interface MapLayoutChildren {
  id: number,
  type: string,
  label: string,
  activated: Boolean,
  subLabel?: string,
  action?: (value: MapLayoutChildren) => Promise<Boolean>,
  icon: string
}

//State Props Interface
interface StateProps {
  layouts: Layout[],
  mapLayouts: MapLayout[]
  loading: Boolean,
}

export default function layoutController(props: any, emit: any) {
  // Refs
  const refs = {
    // key: ref(defaultValue)
  };

  // States
  const state = reactive<StateProps>({
    layouts: [],
    mapLayouts: [],
    loading: false
  });

  // Computed
  const computeds = {};

  // Methods
  const methods = {
    //Get Layouts
    getLayouts(): Promise<boolean> {
      state.loading = true;
      return new Promise(resolve => {
        const params = {
          filter: { allTranslations: true },
          include: 'blocks.fields'
        };
        //Request
        service.getLayouts(true, params).then(response => {
          state.layouts = response.data;
          //Every time the service is called, the layouts will be remapped
          state.mapLayouts = methods.orderedItems();
          state.loading = false;
          resolve(false);
        }).catch(error => {
          state.loading = false;
          resolve(false);
        });
      });
    },
    //Refresh layout petition
    async refreshLayouts({ crudAction = '', emitSelected = true }) {
      emit('refresh', true);
      //Update layout
      await methods.getLayouts();

      //If the action is create, assign the first layout to the editor and recursiveItem stores
      if (crudAction == 'created') {
        const firstLayout = state.layouts[0];
        recursiveStore.itemSelected = firstLayout;
        store.layoutSelected = firstLayout;
        emit('selected', clone(firstLayout));
      } else if (store.layoutSelected && store.layoutSelected.id) {
        const layoutSelected = state.layouts.find(layout => layout.id === store.layoutSelected?.id);

        if (emitSelected && !!layoutSelected) {
          store.layoutSelected = clone(layoutSelected);
          emit('selected', clone(layoutSelected));
        }
      }

      emit('refresh', false);
    },
    //Get the configs from builder.layout
    builderConfig() {
      let config = globalStore.getters['qsiteApp/getConfigApp']('builder.layout', true);
      let response = {};

      //Filter only items with values
      Object.keys(config).forEach(moduleName => {
        if (config[moduleName]) response[moduleName] = config[moduleName];
      });
      return response;
    },
    //Order the layouts to send to recursiveItem
    orderedItems() {
      const config = methods.builderConfig();
      const response: MapLayout[] = [];

      // loop each module config
      Object.keys(config).forEach(moduleName => {
        // loop each module entity config
        config[moduleName].forEach(moduleEntityConfig => {
          // Get entity Layouts
          const entityLayouts = state.layouts.filter(layout => {
            return layout.entityType == moduleEntityConfig.entity.value;
          });
          // Map the layouts
          const entityLayoutsChildren: MapLayoutChildren[] = entityLayouts.map(layout => ({
            ...layout,
            type: layout.type ?? 'General',
            label: `${layout.id} | ${layout.title} ${layout.default ? '(Default)' : ''}`,
            subLabel: `${layout.type ?? 'General'}`,
            activated: true,
            icon: 'fa-light fa-arrow-right',
            action: methods.selectLayout
          }));
          // Include to response the layout by entities
          response.push({
            label: `${moduleEntityConfig.entity.label} (${moduleName})`,
            headerClass: 'expansion-header',
            customClass: 'expansion-border',
            children: entityLayoutsChildren.sort((a, b) => a.type.localeCompare(b.type))
          });
        });
      });

      // Response
      return response;
    },
    //Define the action that will have coda children in recursiveItem
    selectLayout(layoutSelected: MapLayoutChildren): Promise<Boolean> {
      return new Promise(resolve => {
        // internal method to select the layout
        const setLayout = () => {
          const layout = state.layouts.find(i => i.id === layoutSelected.id);
          if (!layout) return resolve(true);
          store.layoutSelected = clone(layout);
          emit('selected', clone(layout));
          resolve(true);
        };

        if (!store.layoutSelected) setLayout(); // Set layoutSelected by firt time
        else if (store.layoutSelected.id !== layoutSelected.id) { // Change the layout selected
          alert.warning({
            mode: 'modal',
            title: i18n.tr('ibuilder.cms.label.sureChangeLayout'),
            message: i18n.tr('ibuilder.cms.label.descriptionSureChangeLayout'),
            actions: [
              { label: i18n.tr('isite.cms.label.cancel'), color: 'grey-8', handler: () => resolve(false) },
              {
                label: i18n.tr('isite.cms.label.accept'),
                color: 'green',
                handler: setLayout
              }
            ]
          });
        }
      });
    },
    //Warning to Refresh Layout
    handleRefresh() {
      if (store.layoutSelected) {
        alert.warning({
          mode: 'modal',
          title: i18n.tr('ibuilder.cms.label.sureRefreshLayout'),
          message: i18n.tr('ibuilder.cms.label.descriptionSureRefreshLayout'),
          actions: [
            { label: i18n.tr('isite.cms.label.cancel'), color: 'grey-8' },
            {
              label: i18n.tr('isite.cms.label.accept'),
              color: 'green',
              handler: () => methods.refreshLayouts({})
            }
          ]
        });
      } else methods.refreshLayouts({});

    }
  };

  // Mounted
  onMounted(() => {
    methods.getLayouts();
  });

  return { ...refs, ...(toRefs(state)), ...computeds, ...methods };
}
