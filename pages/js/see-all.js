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
        'Attributes', 'Global Indexes', 'Items', 'Edit Item'
      ],
      tableItems: {},
      editors: {},
      dialog: false
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
            .filter(i => i.IndexName == index)
            .map(i => i['KeySchema'])
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

    editorAsked: function (t) {
      if (this.tableItems[t]['editor']) {
        console.warn('Editor already created for Table', t)
        return
      }
      var editor = ace.edit(t);
      editor.resize()
      editor.setTheme("ace/theme/monokai");
      editor.session.setMode("ace/mode/json");
      editor.setReadOnly(false)
      this.tableItems[t]['editor'] = editor
      console.info('Editor created for', t)
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

          // Lets initialize editor
          if (!this.editors[table]) {
            // let editor = ace.edit(table);
            // editor.setTheme("ace/theme/monokai");
            // editor.session.setMode("ace/mode/javascript");
            // this.editors[table] = editor
          }

        }).catch((e) => {
          console.error('Error fetching data for table', e)
          throw e
        })

    },

    clickedtab: function (ce) {
      console.log('Clicked', ce)
    }
  },
  mounted: function () {
    console.log('Mounted')
    this.root = this.$el;
    this.tablePromise = listTables()
    this.tablePromise.then((data) => {
      console.log('Tables obtained', data)
      this.tables = data.TableNames
      this.tables.forEach((t) => {
        Vue.set(this.tableData, t, {})
        Vue.set(this.tableItems, t, { 'items': [], 'headers': [], 'index': {} })



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
    `<v-container class="grey lighten-5">

    <v-expansion-panels focusable v-model="panelIndex">
    <v-expansion-panel v-for="n in tables" :key="n">
      <v-expansion-panel-header v-on:click="selected" >
        {{n}}
      </v-expansion-panel-header>
      <v-expansion-panel-content>

   
      <v-toolbar
        color="cyan"
        dark
        flat
      >  
        <template v-slot:extension>
          <v-tabs
            v-model="tab"
            align-with-title
          >
            <v-tabs-slider color="yellow"></v-tabs-slider>
  
            <v-tab
              v-for="item in items"
              :key="item" v-on:click="clickedtab" 
            >
              {{ item }}
            </v-tab>
          </v-tabs>
        </template>
      </v-toolbar>
  
      <v-tabs-items v-model="tab">
        <v-tab-item>

        <v-container class="grey lighten-5">
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
                <v-btn icon color="green" v-on:click="gsiClicked(n, ai.IndexName)">
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
          <v-btn icon color="green" v-on:click="itemsAsked(n)">
            <v-icon>mdi-cached</v-icon>
          </v-btn>
          <template>
            <v-data-table 
              :headers="tableItems[n]['headers']"
              :items="tableItems[n]['items']"
              :items-per-page="25"
              :item-key="key1"
              class="elevation-1">
            </v-data-table>
          </template> 
          
          Total {{tableData[n]['ItemCount']}} items occupying ({{tableData[n]['TableSizeBytes']}} bytes) 
          
        </v-tab-item>

        <v-tab-item>
          <v-btn icon color="green" v-on:click="editorAsked(n)">
            <v-icon>mdi-cached</v-icon>
          </v-btn>
          <div style="position: relative; height: 550px; width: 100%;">
              
            <div v-bind:id="n" class="editor">
            {'a': 10}
          </div>      
            </div>
  
        </v-tab-item>

      </v-tabs-items>
    
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>

      

  </v-container>`
}

