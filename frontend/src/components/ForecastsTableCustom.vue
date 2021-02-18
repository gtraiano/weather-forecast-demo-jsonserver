<!--
  Copyright (c) 2019

  Forecasts overview table, with multiple fields sorting and actions for each city

  @author Georgios Traianos <gtraiano@gmail.com>
  @version 1.0
 -->

<template>
<b-table
    striped hover borderless sticky-header
    small head-variant="light"
    no-local-sorting
    :style="tableStyle"
    :items="rows"
    :fields="addActionsField()"
    @click.native.right.prevent
    id="table"
    class="text-nowrap"
>	
  <!-- table header -->
  <template v-slot:head()="data"><!-- header custom rendering-->
  		<!-- on sortable field, clear sorting on right clicking sorted field header -->
      <div 
          v-if="data.field.sortable"
          @click.left="addSortField(data.field.key)"
          @click.right.prevent="removeSortField(data.field.key)"
      >
          <div class="w-100" style="display: inline-block; position: relative;">{{ data.label }}</div>
          <div class="w-5" style="display: inline-block; position: relative; left: -5%;"><!-- custom sort icon -->
              <b-icon-chevron-up v-if="sortFields[data.field.key]" />
              <b-icon-chevron-down v-else-if="sortFields[data.field.key] === false" />  
          </div>
          
      </div>
		<!-- on regular field, disable right click context menu -->
    	<div
          v-else
          @click.right.prevent
      >
    		  {{ data.label }}
    	</div>
    </template>

    <template v-slot:cell(index)="data">
        {{data.index + 1}}
    </template>
    
    <!-- city name column -->
    <template v-slot:cell(city)="data">
        <!-- clickable city name to load plot -->
        <a
            href="" 
        	  v-on:click.prevent="selectedRowUpdate(data.index, data.value.coords); $emit('showDetailedForecast');"
            v-b-tooltip.hover.bottom.ds500
            :title="`lat: ${data.value.coords.lat} lon: ${data.value.coords.lon}`"
        >
            <!-- no city selected, render all without formatting -->
            <span v-if="selectedRow === -1">
                {{ data.value.name }}
            </span>
            <!-- city selected, make selected city name bold -->
            <strong v-else-if="data.value.name === forecastData[selectedRow].name[$i18n.locale]">
                {{ data.value.name }}
            </strong>
            <!-- city selected, render not selected city names without formatting -->
            <span v-else>
                {{ data.value.name }}
            </span>
        </a>
    </template>
    
    <!-- actions column -->
    <template v-slot:cell(actions)="data">
        <!-- plot icon -->
        <a
            class="ml-1 mr-1"
            href=""
            @click.prevent="plotCity(data.index, data.item['city'])"
            style="color: unset"
            v-b-tooltip.hover.bottom.ds500
            :title="$t('plot')"
        >
          <b-icon-graph-up/>
        </a>
        <!-- refresh forecast data icon -->
      	<a
            class="ml-1 mr-1"
      		  href=""
      		  @click.prevent="singleAction = data.index; updateCityForecast(data.item['city']);"
      		  style="color: unset"
            v-b-tooltip.hover.bottom.ds500
            :title="$t('refresh forecast data')"
      	>
      		  <b-icon-arrow-clockwise :animation="$store.getters['allCityData/getFetching'] && singleAction == data.index ? 'spin' : ''" />
      	</a>
        <!-- remove city icon -->
      	<a
            class="ml-1 mr-1"
      		  href=""
      		  @click.prevent="removeCity(data.item['city'])"
      		  style="color: unset"
            v-b-tooltip.hover.bottom.ds500
            :title="$t('delete')"
      	>
      		  <b-icon-trash/>
      	</a>
    </template>
    
    <!-- forecast values column -->
    <template v-slot:cell()="data">
        <span v-if="!['city', 'actions'].includes(data.field) && data.value == ''">&mdash;</span><!-- em dash on empty cells -->
        <span v-else>{{data.value}}</span>
    </template>
</b-table>
</template>

<script>
import { BIconTrash, BIconArrowClockwise, BIconGraphUp, BIconChevronUp, BIconChevronDown } from 'bootstrap-vue';

export default {
  	name: 'ForecastsTableCustom',
  	
  	components: {
  		  BIconTrash,
  		  BIconArrowClockwise,
        BIconGraphUp,
        BIconChevronDown,
        BIconChevronUp
  	},

  	props: {
    		forecastData: {
    			 type: Array,
    			 required: true
    		},

    		tableItems: { // table rows
    			 type: Array,
    			 required: true
    		},

    		tableFields: { // table fields
    			 type: Array,
    			 required: true
    		},

    		selectedRow: {
    			 type: Number,
    			 required: false,
    			 default: -1
    		},

    		tableStyle: { // css styling for table
    			 type: Object,
    			 required: false,
    			 default: function() {
    				  return { height: '70vh' };
    			 }
    		},

        tableFilter: {
            type: String,
            required: false,
            default: null
        }
  	},

    data() {
        return {
            rows: [], // local copy of table items
            sortFields: {}, // sortable fields order (true: asc, false: desc, null: none)
            filteredRows: [],
            sortSum: 0,
            singleAction: -1
        }
    },

    created() {
        this.rows = [...this.tableItems];
        this.tableFields.filter(field => field.sortable === true).forEach(field => {
            this.sortFields[field.key] = null;
        });
    },

  	methods: {
    		selectedRowUpdate(index, coords) {
    		    this.$emit('selectedRowUpdate', { index: index, coords: coords });
    		},

        sortingChanged() {
            const sortSum = Object.values(this.sortFields).reduce((acc, curr) => curr !== null ? curr ? acc + 2 : acc + 1 : acc, 0); // sum sort order fields (null -> 0, true -> 2, false -> 1)
            this.sortSum = sortSum;
            this.$emit('sortingChanged', sortSum);
        },

    		scrollToRow(index) {
            this.$nextTick(() => { // ensure DOM has been updated
                let table = this.$el.querySelector("#table");
                table = table.parentElement.children[0]; // get the actual table from DOM
                if(table.rows.length > 1) {// header + 1 row at least
                    table.parentElement.scrollTop = table.rows[0].scrollHeight + table.rows[index + 1].offsetTop < table.parentElement.clientHeight // sticky header + next row offset (i.e. bottom of row[index])
                        ? 0 // do not scroll from 1st "page" if not necessary
                        : table.rows[index].offsetTop;
                }
                else {
                    table.parentElement.scrollTop = 0;
                }
            })
            setTimeout(() => this.hideTooltips(), 250);
      	},

      	addActionsField() {
      		  return [
                { key: 'actions', label: this.$t('actions'), sortable: false },
                { key: 'index', label: '#', sortable: false },
                ...this.tableFields.map( field => ( field.sortable ? { ...field, thStyle: {'background-image': 'none'} } : field ) ) // remove standard sort icon from sortable fields
            ];
      	},

      	async removeCity(city) {
      		  await this.$store.dispatch('action/delete', city);
      		  this.$emit('selectedRowUpdate', -1, {});
      	},

      	async updateCityForecast(city) {
      		  await this.$store.dispatch('allCityData/updateCityForecastDataAsync', city);
      	},

        plotCity(index, city) {
            this.selectedRowUpdate(index, city.coords);
            this.$emit('showPlot');
        },

        addSortField(key) {
            this.sortFields = { ...this.sortFields, [key]: !this.sortFields[key] };
        },

        removeSortField(key) {
            this.sortFields = { ...this.sortFields, [key]: null };
        },

        sortCompareString(a, b, key, asc) {
        // key: sort key
        // asc: sort order, true if ascending
            return key !== 'city' // city needs to be sorted by city.name
                ? b[key].localeCompare(a[key], this.$i18n.locale, { sensitivity: 'base', ignorePunctuation: true } ) * (asc ? -1 : 1)
                : b.city.name.localeCompare(a.city.name, this.$i18n.locale, { sensitivity: 'base', ignorePunctuation: true } ) * (asc ? -1 : 1)
        },

        sortCompareNumber(a, b, key, asc) {
        // key: sort key
        // asc: sort order, true if ascending
            return (b[key] - a[key]) * (asc ? -1 : 1)
        },

        sortedTable(rows = this.tableItems) {
        // returns a copy of rows (or tableItems if rows is not provided) sorted according to criteria set in sortFields
            let table = [...rows];
            Object.entries(this.sortFields).forEach(([key, order]) => {
                let type = typeof table[0][key];
                if(order !== null)
                    type && type === 'number' ? table.sort((a,b) => this.sortCompareNumber(a, b, key, order)) : table.sort((a,b) => this.sortCompareString(a, b, key, order));
            });
            return table;
        },

        filterTable() {
            function toString(value) {
                if (value === null || typeof value === 'undefined') {
                    return ''
                }
                else if (value instanceof Object) {
                    return Object.keys(value)
                      .sort()
                      .map(key => toString(value[key]))
                      .join(' ')
                }
                else {
                    return String(value)
                }
            }

            this.filteredRows = this.rows.filter(row => toString(row).toLowerCase().includes(this.tableFilter.toLowerCase()));
             //this.filteredRows = this.tableItems.filter(row => toString(row).toLowerCase().includes(this.tableFilter.toLowerCase()));
        },

        emitEvents() {
            if(this.selectedRow !== -1) { // updated selected city sorted index
                const index = this.rows.findIndex(row => row.city.coords.lon === this.forecastData[this.selectedRow].coords.lon && row.city.coords.lat === this.forecastData[this.selectedRow].coords.lat)
                
                if(index !== -1) {
                    this.selectedRowUpdate(index, this.forecastData[this.selectedRow].coords);
                }
                else {
                    this.selectedRowUpdate(-1, {});
                }
            }
        },

        hideTooltips() {
        // hides all open tooltips
            this.$root.$emit('bv::hide::tooltip');
        }
    },

    watch: {
        sortFields() {
            this.sortingChanged(); // emit sorting changed
            if(this.sortSum) { // sort local rows copy or filtered rows copy
                this.rows = this.sortedTable(this.tableFilter ? this.rows : this.tableItems);
            }
            else {
                this.rows = this.tableFilter ? this.filteredRows : this.tableItems;
            }
            this.emitEvents();
        },

        tableItems() {
            this.rows = this.sortedTable();
            this.emitEvents();
        },

        tableFilter(newValue, oldValue) {
            this.$nextTick(() => {
                this.rows = this.sortedTable(); // restore original table on filter change
                if(newValue) {
                    this.filteredRows = [];
                    this.filterTable();
                    this.rows = this.filteredRows;
                }
                this.emitEvents();    
            })
            
        }
    }
}
</script>

<style scoped>
*:focus {
  outline: none;
}

/* make bootstrap tooltip width fit text */
>>> .tooltip-inner {
  max-width: max-content;
  min-width: max-content;
}
</style>