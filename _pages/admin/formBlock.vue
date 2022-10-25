<template>
  <div id="pageId">
    <!--Page Actions-->
    <div class="box box-auto-height q-mb-md">
      <page-actions :title="useLegacyStructure ? $tr($route.meta.title) : $route.meta.title"/>
    </div>
    <!--Content-->
    <div class="relative-position">
      <div class="row q-col-gutter-md">
        <div class="col" v-if="selectedBlock">
          <iframe
              :src="iframePreviewUrl"
              frameborder="0"
              class="box"
              width="100%"
              height="600px"
          />
        </div>
        <div class="col">
          <!--Choose block-->
          <dynamic-form v-model="form" :blocks="formFields.systemName" ref="mainForm" formType="grid"
                        @submit="submitData" no-actions/>
          <!--Config the attributes of the block-->
          <div v-if="selectedBlock">
            <!--Elements-->
            <div class="box box-auto-height q-mb-md">
              <!--Title-->
              <div class="box-title text-center q-mb-md text-primary">
                {{ $trp("isite.cms.label.item") }}
              </div>
              <!--Actions-->
              <q-btn-toggle
                  v-model="elementSelected"
                  unelevated
                  spread
                  color="grey-3"
                  toggle-color="primary"
                  text-color="primary"
                  :options="selectedBlock.elementsOptions"
              />
            </div>
            <!--Form attributes-->
            <div v-if="elementSelected" class="q-mb-md">
              <q-tab-panels v-model="elementSelected" animated>
                <q-tab-panel v-for="(element, indexFA) in selectedBlock.block.elements" :key="indexFA"
                             :name="element.systemName" class="q-pa-none">
                  <dynamic-form v-model="attributes[element.name]" :blocks="element.sections"
                                formType="collapsible"/>
                </q-tab-panel>
              </q-tab-panels>
            </div>
            <!--Actions-->
            <div class="box box-auto-height text-right">
              <q-btn unelevated rounded no-caps @click="submitData" type="button" :label="$tr('isite.cms.label.save')"
                     color="primary"/>
            </div>
          </div>
        </div>
      </div>
      <!--Inner loading-->
      <inner-loading :visible="loading"/>
    </div>
  </div>
</template>
<script>
export default {
  beforeDestroy() {
    this.$root.$off('page.data.refresh')
  },
  props: {},
  components: {},
  watch: {
    'form.systemName'() {
      //Reset Values
      this.attributes = {}
      this.elementSelected = null
    }
  },
  mounted() {
    this.$nextTick(function () {
      this.init()
    })
  },
  data() {
    return {
      loading: false,
      blockId: this.$route.params.id,
      configData: {},
      elementSelected: null,
      form: {},
      attributes: {}
    }
  },
  computed: {
    // Validate the setting about the use the legacy structure of the CMS
    useLegacyStructure() {
      return parseInt(this.$store.getters['qsiteApp/getSettingValueByName']('isite::legacyStructureCMS') || 0)
    },
    //Main fields
    formFields() {
      return {
        systemName: [{
          name: "main",
          fields: {
            helpText: {
              type: "banner",
              colClass: "col-12",
              props: {
                message: "Here you can choose the blocks used in your web site and has the avility of the customise it..."
              }
            },
            title: {
              isTranslatable: true,
              type: "input",
              required: true,
              props: {
                label: this.$tr("isite.cms.form.title")
              }
            },
            systemName: {
              type: "select",
              required: true,
              props: {
                label: this.$tr("isite.cms.label.block"),
                options: Object.values(this.blocks).map(item => {
                  return {label: item.title, value: item.systemName}
                }),
                readonly: this.blockId ? true : false
              }
            }
          }
        }]
      }
    },
    //Blocks
    blocks() {
      var response = {}
      //Validate if the module has blocks and map it
      Object.values(this.configData).filter(item => item).forEach(mBlocks => {
        if (!Array.isArray(mBlocks)) Object.keys(mBlocks).forEach(blockName => {
          //Map sections
          var sectionsAsblockstoForm = []
          sectionsAsblockstoForm = Object.values(mBlocks[blockName].sections).map((item, index) => {
            return {...item, name: index}
          })
          //Replace values of the block
          response[blockName] = {
            ...mBlocks[blockName],
            sections: sectionsAsblockstoForm
          }
        })
      })
      //Config the childBlocks
      Object.values(response).forEach(block => {
        //instance the block elements
        var blockElements = {
          mainAttributes: {
            name: "mainAttributes",
            systemName: block.systemName,
            title: block.title,
            sections: block.sections
          }
        }
        //Obtain the data of the child elements
        if (block.childBlocks) {
          Object.keys(block.childBlocks).forEach(childName => {
            var childBlock = Object.values(response).find(item => item.systemName == block.childBlocks[childName])
            if (childBlock) blockElements[childName] = {
              name: childName,
              systemName: block.childBlocks[childName],
              title: childBlock.title,
              sections: childBlock.sections
            }
          })
        }
        //Set elements of the component
        block.elements = this.$clone(blockElements)
      })

      //response
      return response
    },
    //Selected block
    selectedBlock() {
      //Find the block
      const block = Object.values(this.blocks).find(block => block.systemName == this.form.systemName)
      var response = null
      //order response
      if (block) {
        response = {
          block,
          elementsOptions: Object.values(block.elements).map(element => ({
            label: element.title,
            value: element.systemName
          }))
        }
        //set defaule element id
        setTimeout(() => this.elementSelected = Object.values(block.elements)[0].systemName, 100)
      }
      //response
      return response
    },
    //Url to iframe preview
    iframePreviewUrl() {
      var baseUrl = this.$store.state.qsiteApp.baseUrl
      var attributes = encodeURIComponent(JSON.stringify(this.attributes))
      return `${baseUrl}/blocks/preview?systemName=${this.elementSelected}&attributes=${attributes}`
    }
  },
  methods: {
    init() {
      this.getData()
      this.$root.$on('page.data.refresh', () => this.getData())//Listen refresh event
    },
    //Get data
    async getData() {
      this.loading = true
      await this.getModuleBlocks()
      await this.getBlockData()
      this.loading = false
    },
    //Get module blocks
    getModuleBlocks() {
      return new Promise((resolve, reject) => {
        //Params
        let requestParams = {
          refresh: true,
          params: {
            filter: {allTranslations: true, configNameByModule: 'blocks'}
          }
        }
        //Request
        this.$crud.index('apiRoutes.qsite.configs', requestParams).then(response => {
          this.configData = response.data
          resolve(response.data)
        }).catch(error => {
          resolve(null)
        })
      })
    },
    //get block data
    getBlockData() {
      return new Promise((resolve, reject) => {
        if (!this.blockId) return resolve(null)
        //Params
        let requestParams = {
          refresh: true,
          params: {
            filter: {allTranslations: true}
          }
        }
        //Request
        this.$crud.show('apiRoutes.qbuilder.blocks', this.blockId, requestParams).then(response => {
          this.form = response.data
          setTimeout(() => {
            var attributes = {}
            Object.keys(response.data.attributes).forEach(elementName => {
              var elmntName = this.$helper.snakeToCamelCase(elementName)
              attributes[elmntName] = {}
              Object.keys(response.data.attributes[elementName]).forEach(attributeName => {
                attributes[elmntName][this.$helper.snakeToCamelCase(attributeName)] = response.data.attributes[elementName][attributeName]
              })
            })
            this.attributes = attributes
          }, 1000)
          resolve(response.data)
        }).catch(error => {
          resolve(null)
        })
      })
    },
    //Save data
    submitData() {
      //Instance the request data
      const requestData = {
        ...this.form,
        attributes: this.attributes
      }
      //Request
      this.blockId ? this.updateBlock(requestData) : this.createBlock(requestData)
    },
    //Create Block
    createBlock(data) {
      return new Promise(resolve => {
        this.loading = true
        //request
        this.$crud.create("apiRoutes.qbuilder.blocks", data).then(response => {
          this.$router.push({name: "qsite.admin.blocks.index"})
          this.loading = false
        }).catch(error => {
          this.loading = false
        })
      })
    },
    //Update Block
    updateBlock(data) {
      return new Promise(resolve => {
        this.loading = true
        //request
        this.$crud.update("apiRoutes.qbuilder.blocks", this.blockId, data).then(response => {
          this.$router.push({name: "qsite.admin.blocks.index"})
          this.loading = false
        }).catch(error => {
          this.loading = false
        })
      })
    }
  }
}
</script>
<style lang="stylus">
</style>
