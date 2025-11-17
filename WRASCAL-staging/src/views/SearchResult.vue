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
              Here you can view the current search results organized by ligand and metal. Expand each accordion to see the available data tables.
            </div>
          </div>
        </v-card-item>

        <v-card-actions>
          <v-btn variant="outlined" prepend-icon="mdi-arrow-left" @click="returnToSearchPage">
            Return To Search Page
          </v-btn>
          <v-spacer></v-spacer>
          <div class="text-caption mr-3">{{ searchResult.length }} result(s)</div>
        </v-card-actions>
      </v-card>

      <v-row justify="center" class="pt-10">
        <v-col cols="12">
          <v-alert v-if="searchResult.length === 0" type="info" variant="tonal" border="start" class="mb-6">
            No results found. Try a different ligand name or adjust your filters.
          </v-alert>
          <v-expansion-panels v-else variant="accordion" multiple>
            <v-expansion-panel
              v-for="(ligandGroup, ligandName) in groupedByLigand"
              :key="ligandName"
            >
              <v-expansion-panel-title>
                <div class="d-flex align-center">
                  <span v-html="highlightMatch(ligandName)" class="text-h6 mr-3"></span>
                  <v-chip size="small" color="primary" class="mr-2">
                    {{ ligandGroup.length }} metal(s)
                  </v-chip>
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div class="pa-2">
                  <v-list>
                    <template v-for="(metalGroup, metalKey) in groupMetalsByLigand(ligandGroup)" :key="metalKey">
                      <v-list-item>
                        <template v-slot:prepend>
                          <v-btn
                            icon
                            variant="text"
                            size="small"
                            @click="toggleMetalPanel(metalKey)"
                          >
                            <v-icon>{{ openedMetalKeys.includes(metalKey) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                          </v-btn>
                        </template>
                        <v-list-item-title>
                          <div class="d-flex align-center">
                            <span class="text-subtitle-1 mr-3">
                              {{ metalGroup[0].central_element }}<sup v-html="formatCharge(metalGroup[0].metal_charge)"></sup>
                            </span>
                            <v-chip size="small" color="secondary" class="mr-2">
                              {{ metalGroup.length }} entry/entries
                            </v-chip>
                            <v-chip size="small" color="info" v-if="metalGroup[0].formula_string">
                              <div class="no-katex-html" v-html="getFormattedMetalForm(metalGroup[0].formula_string)"></div>
                            </v-chip>
                          </div>
                        </v-list-item-title>
                      </v-list-item>
                      <v-expand-transition>
                        <div v-if="openedMetalKeys.includes(metalKey)" class="pa-4">
                          <div v-if="loadingConstants[metalKey]" class="text-center pa-4">
                            <v-progress-circular indeterminate color="primary"></v-progress-circular>
                            <div class="mt-2">Loading constants...</div>
                          </div>
                          <div v-else-if="!constantsData[metalKey]" class="text-center pa-4">
                            <v-progress-circular indeterminate color="primary"></v-progress-circular>
                            <div class="mt-2">Loading constants...</div>
                          </div>
                          <div v-else-if="constantsData[metalKey] && constantsData[metalKey].length > 0">
                            <v-data-table
                              :headers="constantHeaders"
                              :items="constantsData[metalKey]"
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
                              <template v-slot:[`item.data-table-expand`]="{ item }">
                                <v-btn
                                  size="small"
                                  variant="text"
                                  @click="goToDetailPage(metalGroup[0])"
                                >
                                  View Details
                                </v-btn>
                              </template>
                            </v-data-table>
                            <div class="mt-3">
                              <v-btn
                                color="primary"
                                prepend-icon="mdi-share"
                                @click="goToDetailPage(metalGroup[0])"
                              >
                                View Full Details
                              </v-btn>
                            </div>
                          </div>
                          <div v-else-if="constantsData[metalKey] && constantsData[metalKey].length === 0" class="text-center pa-4">
                            <v-alert type="info" variant="tonal">
                              No constants data available for this metal-ligand combination.
                            </v-alert>
                            <div class="mt-3">
                              <v-btn
                                color="primary"
                                prepend-icon="mdi-share"
                                @click="goToDetailPage(metalGroup[0])"
                              >
                                View Detail Page
                              </v-btn>
                            </div>
                          </div>
                        </div>
                      </v-expand-transition>
                      <v-divider class="my-2"></v-divider>
                    </template>
                  </v-list>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
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
import {LigandSearchResultModel} from "@/models/LigandSearchResultModel";
import {getConstants} from "@/axiosClient";
import {ConstantResultModel} from "@/models/ConstantResultModel";
import ElementDisplayUtils from "@/utils/ElementDisplayUtils";

export default defineComponent({
  name: "SearchResult",
  setup: () => {
    useMeta({
      title: 'Search Results'
    })
  },
  data: () => ({
    searchResult: [] as LigandSearchResultModel[],
    lastQuery: '',
    constantsData: {} as Record<string, ConstantResultModel[]>,
    loadingConstants: {} as Record<string, boolean>,
    openedMetalKeys: [] as string[],
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
      { title: "Actions", key: "data-table-expand" },
    ],
  }),
  computed: {
    groupedByLigand(): Record<string, LigandSearchResultModel[]> {
      const grouped: Record<string, LigandSearchResultModel[]> = {};
      for (const result of this.searchResult) {
        if (!grouped[result.name]) {
          grouped[result.name] = [];
        }
        grouped[result.name].push(result);
      }
      return grouped;
    }
  },
  methods: {
    returnToSearchPage(){
      this.$router.go(-1)
    },
    groupMetalsByLigand(ligandResults: LigandSearchResultModel[]): Record<string, LigandSearchResultModel[]> {
      const grouped: Record<string, LigandSearchResultModel[]> = {};
      for (const result of ligandResults) {
        const metalKey = `${result.central_element}_${result.metal_id}_${result.ligand_id}`;
        if (!grouped[metalKey]) {
          grouped[metalKey] = [];
        }
        grouped[metalKey].push(result);
      }
      return grouped;
    },
    toggleMetalPanel(metalKey: string) {
      const index = this.openedMetalKeys.indexOf(metalKey);
      if (index > -1) {
        this.openedMetalKeys.splice(index, 1);
      } else {
        this.openedMetalKeys.push(metalKey);
        // Load constants when opening
        const metalGroups = this.groupedByLigand;
        for (const ligandName in metalGroups) {
          const metals = this.groupMetalsByLigand(metalGroups[ligandName]);
          if (metals[metalKey] && metals[metalKey].length > 0) {
            if (!this.constantsData[metalKey] && !this.loadingConstants[metalKey]) {
              this.loadConstants(metals[metalKey][0]);
            }
            break;
          }
        }
      }
    },
    async loadConstants(item: LigandSearchResultModel) {
      const metalKey = `${item.central_element}_${item.metal_id}_${item.ligand_id}`;
      
      if (this.constantsData[metalKey]) {
        return; // Already loaded
      }

      this.loadingConstants[metalKey] = true;
      
      try {
        const constants = await getConstants(item.ligand_id, item.metal_id);
        if (constants) {
          this.constantsData[metalKey] = constants;
        } else {
          this.constantsData[metalKey] = [];
        }
      } catch (error) {
        console.error('Error loading constants:', error);
        this.constantsData[metalKey] = [];
      } finally {
        this.loadingConstants[metalKey] = false;
      }
    },
    goToDetailPage(item: LigandSearchResultModel){
      const store = searchResultStore()
      store.selectedSearchResult = item as any
      this.$router.push('/detail-view')
    },
    getFormattedMetalForm(form?: string){
      if(!form) return '-'
      const latexStr = MetalDisplayUtils.formatMetalFormulaString(form)
      return katex.renderToString(latexStr, { displayMode: false, throwOnError: false })
    },
    formatCharge(charge: string | number): string {
      return ElementDisplayUtils.formatElementCharge(+charge);
    },
    formatValue(value: number, significantFigures?: number): string {
      if (significantFigures !== undefined) {
        return value.toPrecision(significantFigures);
      }
      return value.toString();
    },
    highlightMatch(text: string){
      if(!this.lastQuery) return text
      const re = new RegExp(`(${this.lastQuery})`, 'ig')
      return text.replace(re, '<span class="mark">$1</span>')
    }
  },
  mounted() {
    const store = searchResultStore()
    this.searchResult = store.searchResult
    this.lastQuery = store.lastQuery
  }
})
</script>
