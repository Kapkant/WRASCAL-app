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
          <div class="text-caption mr-3">{{ searchResult.length }} result(s)</div>
          <v-select
            :items="pageSizeOptions"
            v-model="itemsPerPage"
            label="Rows per page"
            density="compact"
            style="max-width: 160px"
          ></v-select>
        </v-card-actions>
      </v-card>

      <v-row justify="center" class="pt-10">
        <v-col cols="12">
          <v-alert v-if="searchResult.length === 0" type="info" variant="tonal" border="start" class="mb-6">
            No results found. Try a different ligand name or adjust your filters.
          </v-alert>
          <v-data-table
            v-else
            v-model:items-per-page="itemsPerPage"
            v-model:expanded="expandedRows"
            :group-by="groupBy"
            :headers="headers"
            :items="searchResult"
            item-value="name"
            show-expand
            class="elevation-1"
          >
            <template v-slot:group-header="{ item, columns, toggleGroup, isGroupOpen }">
              <tr class="text-left">
                <td :colspan="columns.length">
                  <VBtn
                    size="small"
                    variant="text"
                    :class="`ml-${item.depth * 5}`"
                    :icon="isGroupOpen(item) ? '$expand' : '$next'"
                    @click="toggleGroup(item)"
                  ></VBtn>
                  <span v-html="item.value"></span>
                </td>
              </tr>
            </template>
            <template v-slot:expanded-row="{ columns, item }">
              <tr>
                <td :colspan="columns.length" class="pa-4">
                  <div v-if="loadingConstants[getMetalKey(getItemData(item))]" class="text-center pa-4">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    <div class="mt-2">Loading constants...</div>
                  </div>
                  <div v-else-if="constantsData[getMetalKey(getItemData(item))] && constantsData[getMetalKey(getItemData(item))].length > 0">
                    <div class="text-subtitle-2 mb-3">Constants Data:</div>
                    <v-data-table
                      :headers="constantHeaders"
                      :items="constantsData[getMetalKey(getItemData(item))]"
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
                        @click="goToDetailPage(getItemData(item))"
                      >
                        View Full Details
                      </v-btn>
                    </div>
                  </div>
                  <div v-else-if="constantsData[getMetalKey(getItemData(item))] && constantsData[getMetalKey(getItemData(item))].length === 0" class="text-center pa-4">
                    <v-alert type="info" variant="tonal">
                      No constants data available for this metal-ligand combination.
                    </v-alert>
                    <div class="mt-3">
                      <v-btn
                        color="primary"
                        prepend-icon="mdi-share"
                        @click="goToDetailPage(getItemData(item))"
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
              <v-btn
                rounded="pill"
                color="primary"
                prepend-icon="mdi-share"
                @click="goToDetailPage(getItemData(item))"
              >
                Detail
              </v-btn>
              <v-btn
                class="ml-2"
                rounded="pill"
                color="secondary"
                prepend-icon="mdi-open-in-new"
                @click="openDetailInNewTab(getItemData(item))"
              >
                Open
              </v-btn>
              <v-btn
                class="ml-2"
                rounded="pill"
                color="tertiary"
                prepend-icon="mdi-content-copy"
                @click="copyLink(getItemData(item))"
              >
                Copy Link
              </v-btn>
            </template>
            <template v-slot:[`item.name`]="{ item }">
              <span v-html="highlightMatch(getItemData(item).name)"></span>
            </template>
            <template v-slot:[`item.molecular_formula`]="{ item }">
              <div v-html="getItemData(item).molecular_formula"></div>
            </template>
            <template v-slot:[`item.form`]="{ item }">
              <div class="no-katex-html" v-html="getFormattedProtonationForm(getItemData(item).form)"></div>
            </template>
            <template v-slot:[`item.metal_charge`]="{ item }">
              <v-chip class="ma-1" color="blue" @click="filterByMetal(getItemData(item).central_element)">
                {{ (getItemData(item).metal_charge > 0 ? `+${getItemData(item).metal_charge}` : getItemData(item).metal_charge) }}
              </v-chip>
            </template>
            <template v-slot:[`item.formula_string`]="{ item }">
              <div class="no-katex-html" v-html="getFormattedMetalForm(getItemData(item).formula_string)"></div>
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
      },
      { title: 'Protonation Level', align: 'end', key: 'form' },
      { title: 'Metal Charge', align: 'end', key: 'metal_charge' },
      { title: 'Formula String', align: 'end', key: 'formula_string'}
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
    expandedRows: [] as any[]
  }),
  watch: {
    expandedRows: {
      handler(newVal: any[], oldVal: any[]) {
        console.log('expandedRows changed:', newVal.length, 'rows expanded');
        // When a row is expanded, load constants if not already loaded
        for (const row of newVal) {
          if (row) {
            const itemData = this.getItemData(row);
            if (itemData) {
              const metalKey = this.getMetalKey(itemData);
              console.log('Row expanded, metalKey:', metalKey, 'hasData:', !!this.constantsData[metalKey]);
              if (!this.constantsData[metalKey] && !this.loadingConstants[metalKey]) {
                console.log('Loading constants for', metalKey);
                this.loadConstants(itemData);
              }
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
    getItemData(item: any): LigandSearchResultModel {
      // In grouped tables, item might be the data directly or wrapped in item.raw
      return item?.raw || item;
    },
    getMetalKey(item: LigandSearchResultModel): string {
      return `${item.central_element}_${item.metal_id}_${item.ligand_id}`;
    },
    async loadConstants(item: LigandSearchResultModel) {
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
      store.selectedSearchResult = item
      console.log('Set selectedSearchResult in store:', store.selectedSearchResult);

      this.$router.push('/detail-view')
    },
    openDetailInNewTab(item: LigandSearchResultModel){
      console.log('openDetailInNewTab called with item:', item);
      console.log('item.ligand_id:', item?.ligand_id, 'item.metal_id:', item?.metal_id);
      
      // Validate required fields
      if (!item || !item.ligand_id || !item.metal_id) {
        console.error('Invalid item passed to openDetailInNewTab:', item);
        alert('Error: Missing required data (ligand_id or metal_id). Please try selecting a different result.');
        return;
      }

      const store = searchResultStore()
      store.selectedSearchResult = item as any
      console.log('Set selectedSearchResult in store for new tab:', store.selectedSearchResult);
      
      const url = `${window.location.origin}/#/detail-view`;
      window.open(url, '_blank')
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
    this.groupBy = [{key: 'name'}, {key: 'central_element'}]

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
