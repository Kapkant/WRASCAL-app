<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex text-center fill-height">
      <v-card
        class="mx-auto"
        variant="outlined"
      >
        <v-card-item>
          <div>
            <div class="d-flex text-overline mb-1">
              OVERVIEW
            </div>
            <div class="d-flex text-h6 mb-1">
              Search Result
            </div>
            <div class="d-flex text-caption text-left">
              Here you can view the current search results and click on one of the entries to go to the details page for that compound.
              Clicking on the title in the table header will sort the items in ascending/descending order by that column.
              Click on the drop-down boxes and buttons at the bottom to control the content displayed on each page and switch between pages.
            </div>
          </div>
        </v-card-item>

        <v-card-actions>
          <v-btn variant="outlined" prepend-icon="mdi-arrow-left" @click="returnToSearchPage">
            Return To Search Page
          </v-btn>
          <v-spacer></v-spacer>
          <div class="text-caption mr-3">
            {{ filteredSearchResult.length }} of {{ searchResult.length }} result(s)
          </div>
          <v-menu v-if="filteredSearchResult.length > 0">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                color="primary"
                variant="outlined"
                prepend-icon="mdi-download"
                class="mr-2"
              >
                Export
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="exportToCSV">
                <v-list-item-title>
                  <v-icon class="mr-2">mdi-file-excel</v-icon>
                  Export to CSV
                </v-list-item-title>
              </v-list-item>
              <v-list-item @click="exportToJSON">
                <v-list-item-title>
                  <v-icon class="mr-2">mdi-code-json</v-icon>
                  Export to JSON
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-select
            :items="pageSizeOptions"
            v-model="itemsPerPage"
            label="Rows per page"
            density="compact"
            style="max-width: 160px"
          ></v-select>
        </v-card-actions>
      </v-card>

      <!-- Search Filters -->
      <v-card v-if="searchResult.length > 0" class="mt-6 mb-4" variant="outlined">
        <v-card-title class="text-subtitle-1">Filter Results</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="3">
              <v-select
                v-model="filterConstantKind"
                :items="constantKindOptions"
                label="Constant Kind"
                clearable
                density="compact"
                variant="outlined"
              ></v-select>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model.number="filterMinTemperature"
                label="Min Temperature (°C)"
                type="number"
                density="compact"
                variant="outlined"
                clearable
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model.number="filterMaxTemperature"
                label="Max Temperature (°C)"
                type="number"
                density="compact"
                variant="outlined"
                clearable
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model.number="filterMaxIonicStrength"
                label="Max Ionic Strength (M)"
                type="number"
                step="0.1"
                density="compact"
                variant="outlined"
                clearable
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="filterMetalCharge"
                label="Metal Charge"
                density="compact"
                variant="outlined"
                clearable
                hint="e.g., +1, +2, -1"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="filterLigandName"
                label="Ligand Name Contains"
                density="compact"
                variant="outlined"
                clearable
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6" class="d-flex align-center">
              <v-btn
                color="primary"
                variant="elevated"
                @click="applyFilters"
                class="mr-2"
                prepend-icon="mdi-filter"
              >
                Apply Filters
              </v-btn>
              <v-btn
                color="secondary"
                variant="outlined"
                @click="clearFilters"
                class="mr-2"
              >
                Clear Filters
              </v-btn>
              <span class="text-caption text-grey ml-2">
                Showing {{ filteredSearchResult.length }} of {{ searchResult.length }} results
              </span>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-row justify="center" class="pt-10">
        <v-col cols="12">
          <v-alert v-if="filteredSearchResult.length === 0 && searchResult.length > 0" type="info" variant="tonal" border="start" class="mb-6">
            No results match your filters. Try adjusting your filter criteria.
          </v-alert>
          <v-alert v-else-if="searchResult.length === 0" type="info" variant="tonal" border="start" class="mb-6">
            No results found. Try a different ligand name or adjust your filters.
          </v-alert>
          <v-data-table
            v-if="filteredSearchResult.length > 0"
            v-model:items-per-page="itemsPerPage"
            v-model:expanded="expandedRows"
            :headers="headers"
            :items="sortedFilteredSearchResult"
            item-value="name"
            show-expand
            class="elevation-1"
          >
            <template v-slot:expanded-row="{ columns, item }">
              <tr>
                <td :colspan="columns.length" class="pa-4">
                  <div v-if="getItemData(item.raw || item) && loadingConstants[getMetalKey(getItemData(item.raw || item)!)]" class="text-center pa-4">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    <div class="mt-2">Loading constants...</div>
                  </div>
                  <div v-else-if="getItemData(item.raw || item) && constantsData[getMetalKey(getItemData(item.raw || item)!)] && constantsData[getMetalKey(getItemData(item.raw || item)!)].length > 0">
                    <div class="text-subtitle-2 mb-3">Constants Data:</div>
                    <v-data-table
                      :headers="constantHeaders"
                      :items="constantsData[getMetalKey(getItemData(item.raw || item)!)]"
                      :items-per-page="20"
                      class="elevation-1"
                    >
                      <template v-slot:[`item.expression_string`]="{ item }">
                        <div v-html="item.expression_string || '-'"></div>
                      </template>
                      <template v-slot:[`item.constant_kind`]="{ item }">
                        {{ item.constant_kind || '-' }}
                      </template>
                      <template v-slot:[`item.temperature`]="{ item }">
                        {{ item.temperature !== undefined ? item.temperature + (item.temperature_varies ? ' (varies)' : '') : '-' }}
                      </template>
                      <template v-slot:[`item.ionic_strength`]="{ item }">
                        {{ item.ionic_strength !== undefined ? item.ionic_strength : '-' }}
                      </template>
                      <template v-slot:[`item.value`]="{ item }">
                        {{ item.value !== undefined ? formatValue(item.value, item.significant_figures) : '-' }}
                      </template>
                    </v-data-table>
                    <div class="mt-3">
                      <v-btn
                        color="primary"
                        prepend-icon="mdi-share"
                        @click="goToDetailPage(getItemData(item.raw || item)!)"
                      >
                        View Full Details
                      </v-btn>
                    </div>
                  </div>
                  <div v-else-if="getItemData(item.raw || item) && constantsData[getMetalKey(getItemData(item.raw || item)!)] && constantsData[getMetalKey(getItemData(item.raw || item)!)].length === 0" class="text-center pa-4">
                    <v-alert type="info" variant="tonal">
                      No constants data available for this metal-ligand combination.
                    </v-alert>
                    <div class="mt-3">
                      <v-btn
                        color="primary"
                        prepend-icon="mdi-share"
                        @click="goToDetailPage(getItemData(item.raw || item)!)"
                      >
                        View Detail Page
                      </v-btn>
                    </div>
                  </div>
                  <div v-else class="text-center pa-4">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    <div class="mt-2">Loading constants...</div>
                  </div>
                </td>
              </tr>
            </template>
            <template v-slot:[`item.actions`]="{ item }">
              <template v-if="!getItemData(item)">
                <span class="text-caption text-grey">-</span>
              </template>
              <template v-else>
                <v-btn
                  rounded="pill"
                  color="primary"
                  prepend-icon="mdi-share"
                  @click="goToDetailPage(getItemData(item)!)"
                >
                  Detail
                </v-btn>
                <v-btn
                  class="ml-2"
                  rounded="pill"
                  color="tertiary"
                  prepend-icon="mdi-content-copy"
                  @click="copyLink(getItemData(item)!)"
                >
                  Copy Link
                </v-btn>
              </template>
            </template>
            <template v-slot:[`item.name`]="{ item }">
              <template v-if="!getItemData(item)">-</template>
              <template v-else>
                <span v-html="highlightMatch(getItemData(item)!.name)"></span>
              </template>
            </template>
            <template v-slot:[`item.molecular_formula`]="{ item }">
              <template v-if="!getItemData(item)">-</template>
              <template v-else>
                <div v-html="(getItemData(item) as any).molecular_formula || '-'"></div>
              </template>
            </template>
            <template v-slot:[`item.form`]="{ item }">
              <template v-if="!getItemData(item)">-</template>
              <template v-else>
                <div class="no-katex-html" v-html="getFormattedProtonationForm(getItemData(item)!.form)"></div>
              </template>
            </template>
            <template v-slot:[`item.metal_charge`]="{ item }">
              <template v-if="!getItemData(item)">-</template>
              <template v-else>
                <v-chip class="ma-1" color="blue" @click="filterByMetal(getItemData(item)!.central_element)">
                  {{ getItemData(item)!.metal_charge }}
                </v-chip>
              </template>
            </template>
            <template v-slot:[`item.formula_string`]="{ item }">
              <template v-if="!getItemData(item)">-</template>
              <template v-else>
                <div class="no-katex-html" v-html="getFormattedMetalForm(getItemData(item)!.formula_string)"></div>
              </template>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-responsive>
  </v-container>
</template>

<style>
.no-katex-html .katex-html{
  display: none;
}
.mark {
  background: #fff3cd;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue'
import {searchResultStore} from "@/stores/searchResultStore";
import {useMeta} from "vue-meta";
import katex from "katex";
import MetalDisplayUtils from "@/utils/MetalDisplayUtils";
import ProtonationDisplayUtil from "@/utils/ProtonationDisplayUtil";
import GroupByModel from "@/models/Group/GroupByModel";
import GroupKeyModel from "@/models/Group/GroupKeyModel";
import {LigandSearchResultModel} from "@/models/LigandSearchResultModel";
import {getConstants} from "@/axiosClient";
import {ConstantResultModel} from "@/models/ConstantResultModel";

const filterKeyMapping: Record<string, string> = {
  'name': 'Name',
  'form': 'Protonation Level',
  'central_element': 'Metal',
  'metal_charge': 'Metal Charge',
  'formula_string': 'Formula String'
}

export default defineComponent({
  name: "SearchResult",
  setup: () => {
    useMeta({
      title: 'Search Results'
    })
  },
  data: () => ({
    itemsPerPage: 50,
    pageSizeOptions: [10, 25, 50, 100],
    headers: [
      { title: 'Actions', key: 'actions', sortable: false },
      {
        title: 'Name',
        align: 'start',
        key: 'name',
        sortable: true,
      },
      { title: 'Protonation Level', align: 'end', key: 'form', sortable: true },
      { title: 'Metal Charge', align: 'end', key: 'metal_charge', sortable: true },
      { title: 'Formula String', align: 'end', key: 'formula_string', sortable: true }
    ],
    searchResult: [] as LigandSearchResultModel[],
    groupBy: [] as GroupByModel[],
    groupKeys: [] as GroupKeyModel[],
    lastQuery: '',
    activeMetalFilter: '',
    constantsData: {} as Record<string, ConstantResultModel[]>,
    loadingConstants: {} as Record<string, boolean>,
    constantHeaders: [
      {
        title: "Expression",
        align: "start",
        key: "expression_string",
      },
      { title: "Constant Kind", align: "end", key: "constant_kind" },
      { title: "Temp (°C)", align: "end", key: "temperature" },
      { title: "Ionic Strength (M)", align: "center", key: "ionic_strength" },
      { title: "Value", align: "start", key: "value" },
    ],
    expandedRows: [] as any[],
    
    // Filter state
    filterConstantKind: null as string | null,
    filterMinTemperature: null as number | null,
    filterMaxTemperature: null as number | null,
    filterMaxIonicStrength: null as number | null,
    filterMetalCharge: null as string | null,
    filterLigandName: null as string | null,
    
    // Active filters (applied filters)
    activeFilterConstantKind: null as string | null,
    activeFilterMinTemperature: null as number | null,
    activeFilterMaxTemperature: null as number | null,
    activeFilterMaxIonicStrength: null as number | null,
    activeFilterMetalCharge: null as string | null,
    activeFilterLigandName: null as string | null,
    
    // Constant kind options
    constantKindOptions: [
      'Equilibrium',
      'Enthalpy',
      'Entropy',
      'Gibbs Free Energy'
    ] as string[]
  }),
  computed: {
    filteredSearchResult(): LigandSearchResultModel[] {
      // Use active filters (applied filters) instead of current filter values
      // First apply filters based on search result properties
      let filtered = this.searchResult.filter((item) => {
        // Filter by ligand name
        if (this.activeFilterLigandName && !item.name.toLowerCase().includes(this.activeFilterLigandName.toLowerCase())) {
          return false;
        }
        
        // Filter by metal charge
        if (this.activeFilterMetalCharge) {
          const chargeStr = item.metal_charge?.toString() || '';
          if (!chargeStr.includes(this.activeFilterMetalCharge)) {
            return false;
          }
        }
        
        return true;
      });
      
      // Then filter by constants data if available
      if (this.activeFilterConstantKind || this.activeFilterMinTemperature !== null || 
          this.activeFilterMaxTemperature !== null || this.activeFilterMaxIonicStrength !== null) {
        filtered = filtered.filter((item) => {
          const metalKey = this.getMetalKey(item);
          const constants = this.constantsData[metalKey];
          
          if (!constants || constants.length === 0) {
            // If no constants loaded yet, include it (will be filtered when constants load)
            // But we can try to load constants for visible items
            return true;
          }
          
          // Check if any constant matches the filters
          return constants.some((constant) => {
            // Filter by constant kind
            if (this.activeFilterConstantKind && constant.constant_kind !== this.activeFilterConstantKind) {
              return false;
            }
            
            // Filter by temperature range
            if (this.activeFilterMinTemperature !== null && 
                (constant.temperature === undefined || constant.temperature < this.activeFilterMinTemperature)) {
              return false;
            }
            if (this.activeFilterMaxTemperature !== null && 
                (constant.temperature === undefined || constant.temperature > this.activeFilterMaxTemperature)) {
              return false;
            }
            
            // Filter by ionic strength
            if (this.activeFilterMaxIonicStrength !== null && 
                (constant.ionic_strength === undefined || constant.ionic_strength > this.activeFilterMaxIonicStrength)) {
              return false;
            }
            
            return true;
          });
        });
      }
      
      return filtered;
    },
    sortedFilteredSearchResult(): LigandSearchResultModel[] {
      // Sort the filtered results
      if (this.groupBy.length === 0) {
        return this.filteredSearchResult;
      }

      // Sort by the selected fields in order
      const sorted = [...this.filteredSearchResult].sort((a, b) => {
        for (const group of this.groupBy) {
          const key = group.key as keyof LigandSearchResultModel;
          const aVal = (a as any)[key];
          const bVal = (b as any)[key];
          
          // Handle undefined/null values
          if (aVal === undefined || aVal === null) {
            if (bVal === undefined || bVal === null) continue;
            return 1; // undefined goes to end
          }
          if (bVal === undefined || bVal === null) return -1;
          
          // Compare values (handle strings and numbers)
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            const cmp = aVal.localeCompare(bVal);
            if (cmp !== 0) return cmp;
          } else {
            if (aVal < bVal) return -1;
            if (aVal > bVal) return 1;
          }
        }
        return 0;
      });

      return sorted;
    },
    sortedSearchResult(): LigandSearchResultModel[] {
      // Instead of grouping (which hides columns), sort by selected fields
      // This keeps all columns visible while organizing data
      if (this.groupBy.length === 0) {
        return this.searchResult;
      }

      // Sort by the selected fields in order
      const sorted = [...this.searchResult].sort((a, b) => {
        for (const group of this.groupBy) {
          const key = group.key as keyof LigandSearchResultModel;
          const aVal = (a as any)[key];
          const bVal = (b as any)[key];
          
          // Handle undefined/null values
          if (aVal === undefined || aVal === null) {
            if (bVal === undefined || bVal === null) continue;
            return 1; // undefined goes to end
          }
          if (bVal === undefined || bVal === null) return -1;
          
          // Compare values (handle strings and numbers)
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            const cmp = aVal.localeCompare(bVal);
            if (cmp !== 0) return cmp;
          } else {
            if (aVal < bVal) return -1;
            if (aVal > bVal) return 1;
          }
        }
        return 0;
      });

      return sorted;
    }
  },
  watch: {
    expandedRows: {
      handler(newVal: any[], oldVal: any[]) {
        console.log('expandedRows changed:', newVal.length, 'rows expanded');
        // When a row is expanded, load constants if not already loaded
        for (const row of newVal) {
          if (row) {
            // Try to extract data from the row - it might be the item directly or wrapped
            const itemData = this.getItemData(row);
            if (itemData && itemData.ligand_id !== undefined && itemData.metal_id !== undefined) {
              const metalKey = this.getMetalKey(itemData);
              console.log('Row expanded, metalKey:', metalKey, 'hasData:', !!this.constantsData[metalKey]);
              if (!this.constantsData[metalKey] && !this.loadingConstants[metalKey]) {
                console.log('Loading constants for', metalKey);
                this.loadConstants(itemData);
              }
            } else if (itemData) {
              console.log('Row expanded but item missing required IDs. itemData:', itemData, 'row:', row, 'row keys:', row ? Object.keys(row) : 'null');
            }
          }
        }
      },
      deep: true
    }
  },
  methods: {
    returnToSearchPage(){
      this.$router.go(-1)
    },
    regroup(){
      const temp = []

      for(const state of this.groupKeys){
        if(!state.isChecked) continue
        temp.push({key: state.key})
      }

      this.groupBy = temp
    },
    getItemData(item: any): LigandSearchResultModel | null {
      // Extract data from item - could be in item, item.raw, or item.item
      if (!item) {
        return null;
      }
      
      // Try different ways to extract the data
      let data = item;
      if (item.raw && typeof item.raw === 'object') {
        data = item.raw;
      } else if (item.item && typeof item.item === 'object') {
        data = item.item;
      }
      
      // If data is still the item itself, check if it has the properties we need
      if (data && typeof data === 'object') {
        // Check if it has the required fields
        if (data.ligand_id !== undefined && data.metal_id !== undefined) {
          return data;
        }
      }
      
      return null;
    },
    getMetalKey(item: LigandSearchResultModel): string {
      return `${item.central_element}_${item.metal_id}_${item.ligand_id}`;
    },
    async loadConstants(item: LigandSearchResultModel) {
      // Validate that item has required IDs
      if (!item || item.ligand_id === undefined || item.ligand_id === null || 
          item.metal_id === undefined || item.metal_id === null) {
        console.error('loadConstants called with invalid item:', item);
        return;
      }

      const metalKey = this.getMetalKey(item);
      console.log('loadConstants called for', metalKey, 'item:', item);
      
      if (this.constantsData[metalKey]) {
        console.log('Constants already loaded for', metalKey);
        return; // Already loaded
      }

      this.loadingConstants[metalKey] = true;
      console.log('Starting to load constants for', metalKey);
      
      try {
        const constants = await getConstants(item.ligand_id, item.metal_id);
        console.log('Constants loaded for', metalKey, 'count:', constants?.length || 0);
        if (constants) {
          this.constantsData[metalKey] = constants;
        } else {
          this.constantsData[metalKey] = [];
        }
      } catch (error) {
        console.error('Error loading constants for', metalKey, ':', error);
        this.constantsData[metalKey] = [];
      } finally {
        this.loadingConstants[metalKey] = false;
        console.log('Finished loading constants for', metalKey);
      }
    },
    formatValue(value: number, significantFigures?: number): string {
      if (significantFigures !== undefined) {
        return value.toPrecision(significantFigures);
      }
      return value.toString();
    },
    goToDetailPage(item: LigandSearchResultModel){
      console.log('goToDetailPage called with item:', item);
      console.log('item.ligand_id:', item?.ligand_id, 'item.metal_id:', item?.metal_id);
      
      // Validate required fields
      if (!item || !item.ligand_id || !item.metal_id) {
        console.error('Invalid item passed to goToDetailPage:', item);
        alert('Error: Missing required data (ligand_id or metal_id). Please try selecting a different result.');
        return;
      }

      const store = searchResultStore()
      store.selectedSearchResult = item as any
      console.log('Set selectedSearchResult in store:', store.selectedSearchResult);

      this.$router.push('/detail-view')
    },
    async copyLink(item: LigandSearchResultModel){
      const url = `${window.location.origin}/#/detail-view`
      try { await navigator.clipboard.writeText(url) } catch {}
    },
    getFormattedMetalForm(form?: string){
      if(!form) return '-'

      const latexStr = MetalDisplayUtils.formatMetalFormulaString(form)

      return katex.renderToString(latexStr, { displayMode: true, throwOnError: false })
    },
    getFormattedProtonationForm(pro?: string){
      if(!pro) return '-'

      const latexStr = ProtonationDisplayUtil.formatProtonationString(pro)

      return katex.renderToString(latexStr, { displayMode: true, throwOnError: false })
    },
    highlightMatch(text: string){
      if(!this.lastQuery) return text
      const re = new RegExp(`(${this.lastQuery})`, 'ig')
      return text.replace(re, '<span class="mark">$1</span>')
    },
    filterByMetal(metal: string){
      this.activeMetalFilter = metal
      const store = searchResultStore()
      // naive filter: filter current results in-memory
      this.searchResult = store.searchResult.filter(r => r.central_element === metal)
    },
    applyFilters() {
      // Copy current filter values to active filters
      this.activeFilterConstantKind = this.filterConstantKind;
      this.activeFilterMinTemperature = this.filterMinTemperature;
      this.activeFilterMaxTemperature = this.filterMaxTemperature;
      this.activeFilterMaxIonicStrength = this.filterMaxIonicStrength;
      this.activeFilterMetalCharge = this.filterMetalCharge;
      this.activeFilterLigandName = this.filterLigandName;
      
      // Load constants for filtered items if they need constants-based filtering
      if (this.activeFilterConstantKind || this.activeFilterMinTemperature !== null || 
          this.activeFilterMaxTemperature !== null || this.activeFilterMaxIonicStrength !== null) {
        // Load constants for items that don't have them yet
        this.filteredSearchResult.forEach((item) => {
          const metalKey = this.getMetalKey(item);
          if (!this.constantsData[metalKey] && !this.loadingConstants[metalKey]) {
            this.loadConstants(item);
          }
        });
      }
    },
    clearFilters() {
      // Clear both current and active filters
      this.filterConstantKind = null;
      this.filterMinTemperature = null;
      this.filterMaxTemperature = null;
      this.filterMaxIonicStrength = null;
      this.filterMetalCharge = null;
      this.filterLigandName = null;
      
      this.activeFilterConstantKind = null;
      this.activeFilterMinTemperature = null;
      this.activeFilterMaxTemperature = null;
      this.activeFilterMaxIonicStrength = null;
      this.activeFilterMetalCharge = null;
      this.activeFilterLigandName = null;
    },
    exportToCSV() {
      const data = this.filteredSearchResult;
      if (data.length === 0) {
        alert('No data to export');
        return;
      }

      // Get all unique keys from all items
      const allKeys = new Set<string>();
      data.forEach(item => {
        Object.keys(item).forEach(key => allKeys.add(key));
      });

      // Create CSV header
      const headers = Array.from(allKeys).filter(key => 
        !['molecular_formula', 'categories'].includes(key)
      );
      const csvHeaders = ['Name', 'Ligand Charge', 'Metal Charge', 'Central Element', 
                          'Ligand ID', 'Metal ID', 'Form', 'Formula String'];
      
      // Create CSV rows
      const csvRows = data.map(item => {
        return [
          this.escapeCSV(item.name || ''),
          item.ligand_charge || '',
          item.metal_charge || '',
          item.central_element || '',
          item.ligand_id || '',
          item.metal_id || '',
          item.form || '',
          item.formula_string || ''
        ].join(',');
      });

      // Combine header and rows
      const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `wrascal_search_results_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    exportToJSON() {
      const data = this.filteredSearchResult;
      if (data.length === 0) {
        alert('No data to export');
        return;
      }

      // Convert to plain objects for JSON export
      const jsonData = data.map(item => ({
        name: item.name,
        ligand_charge: item.ligand_charge,
        metal_charge: item.metal_charge,
        central_element: item.central_element,
        ligand_id: item.ligand_id,
        metal_id: item.metal_id,
        form: item.form,
        formula_string: item.formula_string
      }));

      const jsonContent = JSON.stringify(jsonData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `wrascal_search_results_${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    escapeCSV(value: any): string {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }
  },
  mounted() {
    const store = searchResultStore()

    console.log('SearchResult mounted - store.searchResult:', store.searchResult);
    console.log('First result sample:', store.searchResult[0]);
    if (store.searchResult[0]) {
      console.log('First result has ligand_id:', store.searchResult[0].ligand_id, 'metal_id:', store.searchResult[0].metal_id);
    }

    this.searchResult = store.searchResult
    // Start with NO grouping - show flat table so all columns are visible
    this.groupBy = []

    this.groupKeys = []
    for(const key of store.getKeys){
      if(filterKeyMapping[key] === undefined) continue

      this.groupKeys.push({
        key: key,
        name: filterKeyMapping[key],
        isChecked: (key === "name" || key === "central_element")
      })
    }

    // use last query from store for highlight
    this.lastQuery = store.lastQuery
  }
})
</script>
