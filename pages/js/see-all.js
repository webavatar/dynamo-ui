var SeeAll = {

  data: function () {
    return {
      root: null,
      tables: [],
      tableData: {},
      panelIndex: -1,
      gsiIndex: -1,
      key1: '',
      tab: null,
      items: [
        'Manage', 'Attributes', 'Global Indexes', 'Items'
      ],
      tableItems: {},
      editors: {},
      dialog: false,
      errorMessage: '',
      successMessage: '',
      successMessageShow: false,
      errorMessageShow: false,
      confirmDeletion: false
    }
  },
  methods: {
    selected: function (event) {

    },

    gsiClicked: function (table, index) {
      console.log('Index fetch requested for', table, index)
      ///
      scanIndex(table, index)
        .then((data) => {

          //let mainAttrs = new Set()

          let keyAttrs = []

          this.tableData[table]['GlobalSecondaryIndexes']
            .filter(i => {
              return i.IndexName == index
            })
            .map(i => {
              return i['KeySchema']
            })
            .flat()
            .forEach((i) => {
              keyAttrs.push(i.AttributeName)
            })

          let { dd, hh } = dynamoItemsToTable(data, keyAttrs, 'key1')

          console.log('Table Items obtained', dd, hh)

          Vue.set(this.tableItems[table]['index'][index], 'items', dd)
          Vue.set(this.tableItems[table]['index'][index], 'headers', hh)

        }).catch((e) => {
          console.error('Error fetching data for table', e)
          throw e
        })
      ///
    },

    rowSelected: function (table, item) {
      this.successMessage = ''
      this.errorMessage = ''
      console.log('Item selected', item)

      delete item['key1']

      if (this.tableItems[table]['editor']) {
        console.warn('Editor already created for Table', table)

        this.tableItems[table]['editor'].setValue(JSON.stringify(item, null, '\t'), -1)
        this.tableItems[table]['visible'] = false

        this.tableItems[table]['selected'] = item
        return
      }
      var editor = ace.edit(table);
      editor.resize()
      editor.setTheme("ace/theme/monokai");
      editor.session.setMode("ace/mode/json");
      editor.setReadOnly(false)
      editor.setFontSize(14)
      editor.setValue(JSON.stringify(item, null, '\t'), -1)
      this.tableItems[table]['editor'] = editor
      this.tableItems[table]['selected'] = item

      editor.session.on('change', function (delta) {
        console.log('Editor text changed...')
        //this.tableItems[table]['selected'] = JSON.parse(editor.getValue())
      });

      console.info('Editor created for', table)

      this.tableItems[table]['visible'] = false

    },

    confirmDeleteItem: function (table, item) {
      this.tableItems[table]['selected'] = item
      this.confirmDeletion = true
    },

    // Saves last edited row
    removeItem: function () {


      let table = this.tables[this.panelIndex]

      let item = this.tableItems[table]['selected']

      let key = {}

      this.tableData[table]['KeySchema'].forEach((i) => {

        Object.keys(item).forEach((k) => {
          if (i.AttributeName == k) {
            key[k] = item[k]
          }
        })
      })

      console.log('Deleting Item', key)
      deleteTableItem(table, key)
        .then((data) => {
          console.info('Item deleted successfully', data)
          this.successMessageShow = true
          this.errorMessageShow = false
          this.successMessage = 'success'
          this.errorMessage = ''
          this.confirmDeletion = false
        })
        .catch((e) => {
          console.error('Error deleting item', e)
          this.successMessage = ''
          this.errorMessage = e.message
          this.errorMessageShow = true
          this.successMessageShow = false
          this.confirmDeletion = false
        })
    },

    // Saves last edited row
    saveItem: function (table) {
      if (!this.tableItems[table]['selected']) {
        console.warn('No item selected for', table);
        return
      }
      this.tableItems[table]['selected'] = JSON.parse(this.tableItems[table]['editor'].getValue())
      console.log('New Item', this.tableItems[table]['selected'])
      saveTableItem(table, this.tableItems[table]['selected'])
        .then((data) => {
          console.info('Item saved successfully', data)
          this.successMessageShow = true
          this.errorMessageShow = false
          this.successMessage = 'success'
          this.errorMessage = ''
        })
        .catch((e) => {
          console.error('Error saving item', e)
          this.successMessage = ''
          this.errorMessage = e.message
          this.errorMessageShow = true
          this.successMessageShow = false
        })
    },

    itemsAsked: function (table) {
      scan(table)
        .then((data) => {

          let keyAttrs = []

          this.tableData[table]['KeySchema'].forEach((i) => {
            keyAttrs.push(i.AttributeName)
          })

          let { dd, hh } = dynamoItemsToTable(data, keyAttrs, 'key1')

          console.debug('Table Items obtained', dd, hh)

          Vue.set(this.tableItems[table], 'items', dd)
          Vue.set(this.tableItems[table], 'headers', hh)

        }).catch((e) => {
          console.error('Error fetching data for table', e)
          throw e
        })

    },

    addNewAsked: function (table) {
      this.successMessage = ''
      this.errorMessage = ''

      let item = {
      }

      // Populate the key fields
      this.tableData[table]['KeySchema'].forEach((i) => {

        this.tableData[table]['AttributeDefinitions'].forEach((a) => {

          if (a['AttributeName'] == i['AttributeName']) {
            if (a['AttributeType'] == "N") {
              item[i.AttributeName] = 0
            } else if (a['AttributeType'] == "S") {
              item[i.AttributeName] = ""
            }
          }
        })
      })



      if (this.tableItems[table]['editor']) {
        console.warn('Editor already created for Table', table)

        this.tableItems[table]['editor'].setValue(JSON.stringify(item, null, '\t'), -1)
        this.tableItems[table]['visible'] = false

        this.tableItems[table]['selected'] = item
        return
      }
      var editor = ace.edit(table);
      editor.resize()
      editor.setTheme("ace/theme/monokai");
      editor.session.setMode("ace/mode/json");
      editor.setReadOnly(false)
      editor.setFontSize(14)
      editor.setValue(JSON.stringify(item, null, '\t'), -1)
      this.tableItems[table]['editor'] = editor
      this.tableItems[table]['selected'] = item

      editor.session.on('change', function (delta) {
        console.log('Editor text changed...')
        //this.tableItems[table]['selected'] = JSON.parse(editor.getValue())
      });

      console.info('Editor created for', table)

      this.tableItems[table]['visible'] = false

    },

    clickedtab: function (ce) {
      console.log('Clicked', ce)
    },

    readCookie() {
      let name = 'endpoint'
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    }
  },
  mounted: function () {
    console.log('Mounted')
    this.root = this.$el;

    let ep = this.readCookie()

    console.log('Endpoint has been configured as', ep)

    init({
      accessKeyId: "fake",
      secretAccessKey: "fake",
      sessionToken: "fake",
      endpoint: ep ? ep : "http://localhost:8000",
      region: 'ap-south-1'
    });

    this.tablePromise = listTables()
    this.tablePromise.then((data) => {
      console.log('Tables obtained', data)
      this.tables = data.TableNames
      this.tables.forEach((t) => {
        Vue.set(this.tableData, t, {})
        Vue.set(this.tableItems, t, { 'items': [], 'headers': [], 'selected': {}, visible: true, 'index': {} })
      })
    })
  },
  created: function () {
    console.log('Created...');
  },
  watch: {
    gsiIndex: function () {
      console.log("watch gsiIndex id: " + this.gsiIndex)
      //      Vue.set(this.tableItems[this.tables[this.panelIndex]]['index']['name-prefix'], 'headers', hh)

    },
    panelIndex: function () {
      console.log("watch panelIndex id: " + this.panelIndex)
      //if this panelIndex matches this component's index.. do stuff since we're selected

      console.info('Table selected', this.panelIndex, this.tables[this.panelIndex])

      this.tableDataPromise = fetchTableDetails(this.tables[this.panelIndex])
      this.tableDataPromise
        .then((data) => {

          Vue.set(this.tableData, data['Table']['TableName'], data['Table'])

          data['Table']['GlobalSecondaryIndexes'].forEach((i) => {
            Vue.set(this.tableItems[this.tables[this.panelIndex]]['index'], i.IndexName, { headers: [], items: [], selected: -1 })
          })

          console.log('Table Data obtained', data)
        }).catch((e) => {
          console.error('Error fetching data for table', e)
          throw e
        })
    },
    tab: function () {
      console.log('Changed Tab', this.tab, 'for', this.tables[this.panelIndex])
      if (this.tab == 2) {

      } else if (this.tab == 1) {

      }

    }
  },
  template:
    `<v-container >

      <h2 v-if="!tables || tables.length == 0">No Tables found</h2>

    <v-expansion-panels focusable v-model="panelIndex">
    <v-expansion-panel v-for="n in tables" :key="n">
      <v-expansion-panel-header v-on:click="selected" >
        {{n}}
      </v-expansion-panel-header>
      <v-expansion-panel-content>

      <v-tabs v-model="tab" align-with-title>
        <v-tabs-slider color="yellow"></v-tabs-slider>

        <v-tab v-for="item in items" :key="item" v-on:click="clickedtab">
          {{ item }}
        </v-tab>
      </v-tabs>
  
      <v-tabs-items v-model="tab">

      <v-tab-item>
        <v-btn color="green" v-on:click="" disabled title="Remove" >
          Remove table {{n}}
        </v-btn>
      </v-tab-item>
        <v-tab-item>
        <v-container >
        <v-row no-gutters>
          <v-col cols="1" sm="4">
            <v-card class="mx-auto" max-width="300" tile>
                <v-card-title>Attributes</v-card-title>
                <v-list-item v-for="ai in tableData[n]['AttributeDefinitions']" :key="ai.AttributeName">
                  <v-list-item-content>
                    <v-list-item-title>{{ai.AttributeName}}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>    
            </v-card>    
               
          </v-col>
          <v-col cols="1" sm="4">            
            <v-card class="mx-auto" max-width="300" tile>
              <v-card-title>Keys</v-card-title>
              <v-list-item v-for="ai in tableData[n]['KeySchema']" :key="ai.AttributeName">
                <v-list-item-content>
                  <v-list-item-title>{{ai.AttributeName}}({{ai.KeyType}})</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-card>
          </v-col>
        </v-row>
    </v-container>


        </v-tab-item>

        <v-tab-item>

          <v-expansion-panels focusable v-model="gsiIndex">
            <v-expansion-panel v-for="ai in tableData[n]['GlobalSecondaryIndexes']" :key="ai.IndexName">
              <v-expansion-panel-header >
                {{ai.IndexName}}
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-btn icon color="green" v-on:click="gsiClicked(n, ai.IndexName)" title="Load Index">
                  <v-icon>mdi-cached</v-icon>
                </v-btn>
                <template>
                  <v-data-table 
                    :headers="tableItems[n]['index'][ai.IndexName]['headers']"
                    :items="tableItems[n]['index'][ai.IndexName]['items']"
                    :items-per-page="25"
                    :item-key="key1"
                    class="elevation-1">
                  </v-data-table>
                </template>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>          
        </v-tab-item>

        <v-tab-item>
          <v-btn icon color="green" v-on:click="itemsAsked(n)" title="Load Items" v-show="tableItems[n]['visible']">
            <v-icon>mdi-cached</v-icon>
          </v-btn>

          <v-btn color="green" v-on:click="addNewAsked(n)" title="Add a new item" v-show="tableItems[n]['visible']">
            Add New
          </v-btn>

          <v-alert type="success" dismissible  v-model="successMessageShow">
              Updated Successfully !
          </v-alert>

          <v-alert type="error" dismissible v-model="errorMessageShow">
            Failed to update -{{errorMessage}}
          </v-alert>


          <template>
            <v-data-table 
              :headers="tableItems[n]['headers']"
              :items="tableItems[n]['items']"
              :items-per-page="25"
              :item-key="key1" v-show="tableItems[n]['visible']"
              class="elevation-1">
              <template v-slot:item.key1="{item}">


                <v-container>
                    <v-row>
                      <v-col cols="2" sm="2">

                      <v-btn
                         small title="edit"
                        color="success" v-on:click="rowSelected(n,item)"
                      >
                        <v-icon left>
                          mdi-pencil
                        </v-icon>
                      </v-btn>

                      <v-btn
                         small title="delete"
                        color="warning" v-on:click="confirmDeleteItem(n,item)">
                        <v-icon left>
                          mdi-delete
                        </v-icon>
                      </v-btn>
                     
                    </v-col>
        
                  </v-row>
                </v-container>
              </template>
            </v-data-table>
          </template> 

          <v-card tile v-show="!tableItems[n]['visible']">
              <v-btn tile color="success" v-on:click="saveItem(n)">
                  Save
                </v-btn>
              <v-btn tile color="success" v-on:click="tableItems[n]['visible'] = true">
                  Cancel
                </v-btn>
              <div style="position: relative; height: 550px; width: 100%;">
              
                <div v-bind:id="n" class="editor">
                  {'a': 10}
                </div>      
              </div>
    
          </v-card>
          
          Total {{tableData[n]['ItemCount']}} items occupying ({{tableData[n]['TableSizeBytes']}} bytes) 
          
        </v-tab-item>

      </v-tabs-items>
    
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>

  
    <v-dialog
        transition="dialog-top-transition"
        v-model="confirmDeletion" v-if="confirmDeletion"
        max-width="300" light>
          <v-card>
            <v-toolbar
              color="primary"
              dark>Confirmation</v-toolbar>
              Are you sure to remove {{tableItems[tables[panelIndex]]['selected'].id}} from table {{tables[panelIndex]}}?
             
            <v-card-actions class="justify-end">
              <v-btn
                  @click="removeItem()"
                >Yes</v-btn>
              <v-btn
                text
                @click="confirmDeletion=false"
              >Cancel</v-btn>
            </v-card-actions>
          </v-card>
    </v-dialog>

  </v-container>`
}

