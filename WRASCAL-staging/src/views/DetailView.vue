<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex text-center fill-height">
      <v-card class="mx-auto" variant="outlined">
        <v-card-actions>
          <v-btn
            variant="outlined"
            prepend-icon="mdi-arrow-left"
            @click="returnToSearchResultPage"
          >
            Return To Search Page
          </v-btn>
        </v-card-actions>
      </v-card>

      <v-progress-linear
        v-if="isLoading"
        indeterminate
        color="yellow-darken-2"
      ></v-progress-linear>

      <v-skeleton-loader
        v-if="isLoading"
        type="article, table, actions"
        class="mt-6"
      ></v-skeleton-loader>

      <div
        class="text-caption text-left mt-8"
        v-if="this.failedResources.length !== 0"
      >
        <!-- Critical errors (Constants, References) -->
        <v-alert
          class="mt-5"
          v-for="failed in this.failedResources.filter(f => f.resourceName !== 'MolData')"
          v-bind:key="failed.resourceName"
          density="compact"
          type="error"
          closable
          close-label="Close Alert"
          :title="`Failed To Request: ${failed.resourceName}`"
        >
          This might happen when there are too much traffic for the backend
          server. You can click [Retry All] button to reload. Detail:
          {{ failed.detail }}
        </v-alert>
        
        <!-- Optional warnings (MolData) -->
        <v-alert
          class="mt-5"
          v-for="failed in this.failedResources.filter(f => f.resourceName === 'MolData')"
          v-bind:key="failed.resourceName"
          density="compact"
          type="warning"
          variant="tonal"
          closable
          close-label="Close Alert"
          title="Molecular Preview Unavailable"
        >
          Molecular structure preview is not available for this compound. All other data (constants, references) is still accessible. {{ failed.detail }}
        </v-alert>
        
        <v-divider v-if="this.failedResources.filter(f => f.resourceName !== 'MolData').length > 0" class="mt-2 mb-2"></v-divider>
        <div v-if="this.failedResources.filter(f => f.resourceName !== 'MolData').length > 0" class="d-flex">
          <v-spacer></v-spacer>
          <v-btn
            color="info"
            prepend-icon="mdi-refresh"
            @click="this.retryFailed"
            >Retry All</v-btn
          >
        </div>
      </div>

      <div class="d-flex text-caption text-left mt-8" v-if="this.molData">
        <v-alert
          type="info"
          title="Tips"
          text="If the preview control doesn't show up, please try click [LOAD] button again!"
          variant="tonal"
        ></v-alert>
      </div>

      <v-container class="pa-0 mt-8">
        <v-row no-gutters>
          <v-col
            :class="$vuetify.display.xs ? '' : 'pr-3'"
            xs="12"
            :lg="this.molData ? 6 : 12"
          >
            <v-card class="mx-auto fill-height" variant="outlined">
              <v-card-item>
                <div>
                  <div class="d-flex text-overline mb-1">INFO</div>
                  <div class="d-flex text-h6 mb-1 text-left">
                    {{ this.selectedSearchResult?.name ?? "-" }}
                  </div>
                  <div class="d-flex text-overline mb-1">
                    <v-chip color="blue" v-if="this.selectedSearchResult?.form">
                      <div
                        class="no-katex-html text-h6"
                        v-html="
                          getFormattedProtonationForm(
                            this.selectedSearchResult?.form ?? '-'
                          )
                        "
                      ></div>
                    </v-chip>
                    <v-chip
                      color="green"
                      class="ml-3"
                      v-if="this.selectedSearchResult?.formula_string"
                    >
                      <div
                        class="no-katex-html text-h6"
                        v-html="
                          getFormattedMetalForm(
                            this.selectedSearchResult?.formula_string ?? '-'
                          )
                        "
                      ></div>
                    </v-chip>
                  </div>
                </div>
              </v-card-item>
              <v-list
                class="text-left"
                density="compact"
                style="overflow-y: auto; max-height: 400px"
              >
                <v-list-item>
                  Expression:
                  <span v-if="!this.molecular_formula">-</span>
                  <span v-else v-html="this.molecular_formula"></span>
                </v-list-item>
                <v-list-item>SMILE: {{ this.smileStr }}</v-list-item>
                <v-list-item
                  >Ligand ID:
                  {{ this.selectedSearchResult?.ligand_id ?? "-" }}</v-list-item
                >
                <v-list-item
                  >Metal ID:
                  {{ this.selectedSearchResult?.metal_id ?? "-" }}</v-list-item
                >
              </v-list>
              <div class="text-left">
                <v-chip
                  v-for="category in this.categories"
                  :key="category"
                  class="ma-2"
                  color="pink"
                  label
                  text-color="white"
                >
                  <v-icon start icon="mdi-label"></v-icon>
                  {{ category }}
                </v-chip>
              </div>
            </v-card>
          </v-col>
          <v-col
            :class="$vuetify.display.xs ? 'pt-8' : 'pl-3'"
            v-if="this.molData"
            xs="12"
            lg="6"
          >
            <v-card class="mx-auto fill-height" variant="outlined">
              <v-card-item>
                <div>
                  <div class="d-flex text-overline mb-1">PREVIEW</div>
                  <div class="d-flex text-h6 mb-1">
                    Mol Preview ({{ this.isIn3DPreviewMode ? "3D" : "2D" }})
                  </div>
                </div>
              </v-card-item>

              <v-container>
                <v-row no-gutters>
                  <v-col>
                    <div
                      id="mol2D"
                      v-if="!isIn3DPreviewMode"
                      :style="molViewStyle"
                      class="disabled"
                    ></div>
                    <div id="mol3D" v-else :style="molViewStyle"></div>
                  </v-col>
                </v-row>
              </v-container>

              <v-card-actions>
                <v-btn
                  variant="outlined"
                  prepend-icon="mdi-cube-scan"
                  @click="loadPreview"
                >
                  Load
                </v-btn>
                <v-btn
                  variant="outlined"
                  :prepend-icon="
                    this.isIn3DPreviewMode ? 'mdi-vector-rectangle' : 'mdi-cube'
                  "
                  @click="switchPreviewMode"
                >
                  Switch To {{ this.isIn3DPreviewMode ? "2D" : "3D" }} Preview
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <v-alert
        v-if="noDataAvailable"
        type="error"
        title="Criteria Not Meet"
        text="Published data do not meet criteria for critical selection."
        variant="tonal"
        icon="mdi-flask-empty-off-outline"
        class="mt-8 text-left"
      ></v-alert>

      <v-card
        class="mt-10 text-left"
        title="Options"
        subtitle="Group data by selecting fields below (optional)"
      >
        <v-card-actions>
          <v-row no-gutters>
            <v-col v-for="key in groupKeys" :key="key.key" cols="12" sm="3">
              <v-checkbox
                :label="key.name"
                v-model="key.isChecked"
                color="primary"
                hide-details
              ></v-checkbox>
            </v-col>
          </v-row>

          <v-btn
            class="ml-8"
            variant="flat"
            prepend-icon="mdi-refresh"
            color="secondary"
            @click="regroup"
          >
            Apply Grouping
          </v-btn>
        </v-card-actions>
      </v-card>

      <!-- Export Options -->
      <v-card v-if="sortedConstants.length > 0" class="mt-4 text-left" variant="outlined">
        <v-card-title class="text-subtitle-1">Export Constants</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                color="primary"
                variant="outlined"
                prepend-icon="mdi-download"
              >
                Export
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="exportConstantsToCSV">
                <v-list-item-title>
                  <v-icon class="mr-2">mdi-file-excel</v-icon>
                  Export to CSV
                </v-list-item-title>
              </v-list-item>
              <v-list-item @click="exportConstantsToJSON">
                <v-list-item-title>
                  <v-icon class="mr-2">mdi-code-json</v-icon>
                  Export to JSON
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-card-actions>
      </v-card>

      <v-data-table
        v-model:items-per-page="itemsPerPage"
        v-model:expanded="expandedRows"
        :headers="computedHeaders"
        :items="sortedConstants"
        :items-per-page="itemsPerPage"
        multi-sort
        show-expand
        class="mt-8 elevation-1"
      >
        <template v-slot:expanded-row="{ columns, item }">
          <tr v-if="getItemDataCached(item)">
            <td :colspan="columns.length" class="text-left">
              <v-chip class="ma-2" color="primary" label text-color="white">
                <v-icon start icon="mdi-note-text-outline"></v-icon>
                FootNote:
                <div
                  class="ml-2"
                  v-html="getFootNote(safeGet(item, 'legacy_identifier')) ?? 'None'"
                ></div>
              </v-chip>
            </td>
          </tr>
        </template>
        <template v-slot:[`item.constant_kind`]="{ item }">
          <template v-if="!item">-</template>
          <template v-else>
            <template v-if="!getItemDataCached(item)">-</template>
            <template v-else>
              <v-chip v-if="safeGet(item, 'constant_kind')" :color="getConstantKindBadgeColor(safeGet(item, 'constant_kind', '') || '')">
                <div
                  class="no-katex-html"
                  v-html="getFormattedConstantKind(safeGet(item, 'constant_kind'))"
                ></div>
              </v-chip>
              <template v-else>-</template>
            </template>
          </template>
        </template>
        <template v-slot:[`item.expression_string`]="{ item }">
          <template v-if="!item">-</template>
          <template v-else>
            <template v-if="!getItemDataCached(item)">-</template>
            <template v-else>
              <div
                v-if="safeGet(item, 'expression_string')"
                class="no-katex-html"
                v-html="convertExpressionToLatex(safeGet(item, 'expression_string'))"
              ></div>
              <template v-else>-</template>
            </template>
          </template>
        </template>
        <template v-slot:[`item.temperature`]="{ item }">
          <template v-if="!item">-</template>
          <template v-else>
            <template v-if="!getItemDataCached(item)">-</template>
            <template v-else>
              <div>
                {{ (safeGet(item, 'temperature') !== undefined && safeGet(item, 'temperature') !== null)
                  ? safeGet(item, 'temperature') + (safeGet(item, 'temperature_varies') ? ' (varies)' : '') + ' °C'
                  : '-' }}
              </div>
            </template>
          </template>
        </template>
        <template v-slot:[`item.ionic_strength`]="{ item }">
          <template v-if="!item">-</template>
          <template v-else>
            <template v-if="!getItemDataCached(item)">-</template>
            <template v-else>
              <div>
                {{ (safeGet(item, 'ionic_strength') !== undefined && safeGet(item, 'ionic_strength') !== null)
                  ? safeGet(item, 'ionic_strength') + ' M'
                  : '-' }}
              </div>
            </template>
          </template>
        </template>
        <template v-slot:[`item.value`]="{ item }">
          <template v-if="!item">-</template>
          <template v-else>
            <template v-if="!getItemDataCached(item)">-</template>
            <template v-else>
            <div style="min-width: 150px" class="d-flex align-center">
              <div
                class="no-katex-html pl-3 pr-3"
                v-html="
                  convertValueWithUncertaintyToLatex1(
                    safeGet(item, 'value'),
                    safeGet(item, 'magnitude'),
                    safeGet(item, 'direction'),
                    safeGet(item, 'constant_kind')
                  )
                "
              ></div>
              <div
                v-if="safeGet(item, 'constant_kind') !== 'Equilibrium'"
                class="no-katex-html pl-3 pr-3"
                v-html="
                  convertValueWithUncertaintyToLatex2(
                    safeGet(item, 'value'),
                    safeGet(item, 'magnitude'),
                    safeGet(item, 'direction'),
                    safeGet(item, 'constant_kind')
                  )
                "
              >              </div>
            </div>
            </template>
          </template>
        </template>
      </v-data-table>

      <v-switch
        color="primary"
        class="ml-8"
        label="Show Unbalanced data"
        @click="changeUnbalancedDataState"
      ></v-switch>

      <v-card
        class="mx-auto mt-8"
        variant="outlined"
        v-if="this.references && this.references.length !== 0"
      >
        <v-card-item>
          <div>
            <div class="d-flex text-overline mb-1">CREDITS</div>
            <div class="d-flex text-h6 mb-1">References</div>
          </div>
        </v-card-item>
        <v-list
          lines="one"
          class="text-left"
          style="overflow-y: auto; max-height: 400px"
        >
          <v-list-item
            v-for="ref in references"
            :key="ref.litId"
            :title="ref.reference"
            :subtitle="ref.code"
          ></v-list-item>
        </v-list>
      </v-card>
    </v-responsive>
  </v-container>
</template>

<style>
.disabled {
  pointer-events: none;
}

.no-katex-html .katex-html {
  display: none;
}
</style>

<script lang="ts">
import { defineComponent } from "vue";
import { searchResultStore } from "@/stores/searchResultStore";
import {
  LigandAdvanceSearchResultModel,
  ProcessedLigandAdvanceSearchResultModel,
} from "@/models/LigandSearchResultModel";
import { getConstants, getMolData, getReferences } from "@/axiosClient";
import { mockGetMolData, mockGetConstants, mockGetReferences } from "@/mockApiClient";
import { useTheme } from "vuetify";
import FootNoteUtils from "@/utils/FootNoteUtils";
import { useMeta } from "vue-meta";
import "openchemlib/full";
import ElementDisplayUtils from "@/utils/ElementDisplayUtils";
import katex from "katex";
import MetalDisplayUtils from "@/utils/MetalDisplayUtils";
import ProtonationDisplayUtil from "@/utils/ProtonationDisplayUtil";
import { ConstantResultModel } from "@/models/ConstantResultModel";
import { MolecularFormula } from "@/models/MolecularFormula";
import { MolDataRawResultModel } from "@/models/MolDataResultModel";
import { ReferenceFetchResultModel } from "@/models/ReferenceFetchResultModel";
import GroupByModel from "@/models/Group/GroupByModel";
import GroupKeyModel from "@/models/Group/GroupKeyModel";

const srcLinks = [
  "https://cdn.jsdelivr.net/gh/BoboRett/MolViewer@v0.52/molViewer.js",
  "https://d3js.org/d3.v5.js",
  "https://cdn.jsdelivr.net/gh/mrDoob/three.js@r97/build/three.min.js",
  "https://cdn.jsdelivr.net/gh/mrDoob/three.js@r97/examples/js/effects/OutlineEffect.js",
  "https://cdn.jsdelivr.net/gh/mrDoob/three.js@r97/examples/js/controls/OrbitControls.js",
];

const unbalancedDataNameList = [
  "[L]/[ML(s,amorphous)]",
  "[L]/[ML(s,am)]",
  "[OH][L]/[MOHL(s)]",
];

declare interface RequestFailedModel {
  resourceName: string;
  detail: string;
  action: () => void;
}

export default defineComponent({
  name: "DetailView",
  setup: () => {
    const theme = useTheme();
    useMeta({
      title: "Detail",
    });
    return { theme };
  },
  data() {
    return {
      categories: null as string[] | null,
      molecular_formula: null as string | null,
      element_with_charge: "",
      headers: [
        {
          title: "Expression",
          align: "start",
          key: "expression_string",
        },
        { title: "Constant Kind", align: "end", key: "constant_kind" },
        { title: "Temp (°C)", align: "end", key: "temperature" },
        { title: "Ionic Strength (M)", align: "center", key: "ionic_strength" },
        { title: "Value", align: "start", key: "value" },
        { title: "FootNotes", key: "data-table-expand", sortable: false },
      ],
      constants: [] as ConstantResultModel[],
      selectedSearchResult:
        null as ProcessedLigandAdvanceSearchResultModel | null,
      isLoading: true,
      molLoaded: false,
      molData: null as MolDataRawResultModel | null,
      references: [] as ReferenceFetchResultModel[],
      smileStr: null as string | null,
      noDataAvailable: false,
      isIn3DPreviewMode: false,
      groupKeys: [] as GroupKeyModel[],
      groupBy: [] as GroupByModel[],
      itemsPerPage: 40,
      originalData: [] as ConstantResultModel[],
      showUnbalancedData: false,
      expandedRows: [] as any[],
      failedResources: [] as RequestFailedModel[],
      failedConstantCount: 0,
      failedMolDataCount: 0,
      failedReferenceCount: 0,
    };
  },
  computed: {
    computedHeaders() {
      // All headers stay visible - no grouping means no columns are hidden
      return [...this.headers];
    },
    sortedConstants() {
      // Instead of grouping (which hides columns), sort by selected fields
      // This keeps all columns visible while organizing data
      console.log('DetailView.sortedConstants: Computing sorted data');
      console.log('  totalConstants:', this.constants.length);
      console.log('  groupByFields:', this.groupBy.map(g => g.key));
      console.log('  constants array:', this.constants);
      
      if (this.constants.length > 0) {
        console.log('  firstItem.expression_string:', this.constants[0].expression_string);
        console.log('  firstItem.constant_kind:', this.constants[0].constant_kind);
        console.log('  firstItem.value:', this.constants[0].value);
      }

      if (this.groupBy.length === 0) {
        console.log('DetailView.sortedConstants: No grouping selected, returning original data');
        console.log('  returning array with length:', this.constants.length);
        return this.constants;
      }

      // Sort by the selected fields in order
      const sorted = [...this.constants].sort((a, b) => {
        for (const group of this.groupBy) {
          const key = group.key as keyof ConstantResultModel;
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

      console.log('DetailView.sortedConstants: Sorting complete', {
        sortedCount: sorted.length,
        firstSortedItem: sorted.length > 0 ? {
          expression_string: sorted[0].expression_string,
          constant_kind: sorted[0].constant_kind,
          ionic_strength: sorted[0].ionic_strength
        } : null
      });

      return sorted;
    },
    molViewStyle(): string {
      const background = this.theme.global.current.value.dark
        ? "gray"
        : "transparent";

      return `height: 400px; background: ${background}; ${
        this.molLoaded ? "" : "display: none;"
      }`;
    },
  },
  methods: {
    async loadPreviewScripts() {
      for (const src of srcLinks) {
        await this.$loadScript(src);
      }
    },
    async unloadPreviewScripts() {
      for (const src of srcLinks) {
        await this.$unloadScript(src);
      }
    },
    async getSmileCode(): Promise<string> {
      await this.$loadScript(
        "https://unpkg.com/@rdkit/rdkit/dist/RDKit_minimal.js"
      );

      // @ts-ignore
      const RDKit = await window.initRDKitModule();
      // @ts-ignore
      const smiles = RDKit.get_mol(this.molData?.drawCode).get_smiles();

      return smiles;
    },
    async load2DMol() {
      await this.loadPreviewScripts();

      const smiles = await this.getSmileCode();

      // @ts-ignore
      // eslint-disable-next-line no-undef
      const molecule2D = new MolViewer.Molecule();
      molecule2D.get2DFromSMILE(smiles);

      const mol2DElement = document.getElementById("mol2D");

      // @ts-ignore
      mol2DElement.innerHTML = "";

      // @ts-ignore
      // eslint-disable-next-line no-undef
      const mol2D = new MolViewer.Mol2D(null, mol2DElement);

      mol2D.init();
      mol2D.Molecule = molecule2D;
      mol2D.draw();

      this.molLoaded = true;
      await this.unloadPreviewScripts();
    },
    async load3DMol() {
      await this.loadPreviewScripts();

      const smiles = await this.getSmileCode();
      // @ts-ignore
      // eslint-disable-next-line no-undef
      const molecule3D = new MolViewer.Molecule();
      molecule3D.get3DFromSMILE(smiles);

      const mol3DElement = document.getElementById("mol3D");

      // @ts-ignore
      mol3DElement.innerHTML = "";

      // @ts-ignore
      // eslint-disable-next-line no-undef
      const mol3D = new MolViewer.Mol3D(null, mol3DElement);

      mol3D.init();

      document.addEventListener("ajaxComplete", () => {
        mol3D.Molecule = molecule3D;
        mol3D.draw();
      });

      this.molLoaded = true;
      await this.unloadPreviewScripts();
    },
    getFootNote(id: string) {
      return FootNoteUtils.fromLegacyId(id);
    },
    returnToSearchResultPage() {
      this.$router.go(-1);
    },
    getItemData(item: any): any {
      try {
        // CRITICAL: Check for undefined/null first before accessing any properties
        if (item === undefined || item === null || typeof item !== 'object') {
          return null;
        }
        
        // Since we removed :group-by, Vuetify should pass items directly
        // But it might still wrap them in item.raw, so check for that
        // Also check for item.item in case of any other wrapping
        let data = item;
        if (item.raw && typeof item.raw === 'object') {
          data = item.raw;
        } else if (item.item && typeof item.item === 'object') {
          data = item.item;
        }
        
        // If it's a group header (has depth property), return null
        // This shouldn't happen anymore since we removed grouping, but keep as safety check
        if (data.depth !== undefined || (data.items && Array.isArray(data.items) && !data.expression_string)) {
          console.warn('DetailView.getItemData: Detected potential group header (should not happen without grouping)', {
            hasDepth: data.depth !== undefined,
            hasItems: !!data.items,
            hasExpression: data.expression_string !== undefined
          });
          return null;
        }
        
        // Return the data object - it should be a valid constant item from sortedConstants
        return data;
      } catch (error) {
        console.error('DetailView.getItemData: EXCEPTION', error, {
          item: item ? Object.keys(item) : 'null',
          itemType: typeof item
        });
        return null;
      }
    },
    safeGet(item: any, property: string, fallback: any = null): any {
      try {
        // CRITICAL: Check for undefined/null first before calling getItemData
        if (item === undefined || item === null) {
          return fallback;
        }
        
        const data = this.getItemData(item);
        if (!data || typeof data !== 'object') {
          // Log when safeGet is called but getItemData returns null/undefined
          // This happens when templates try to access properties on group headers
          console.warn(`DetailView.safeGet: getItemData returned null/undefined for property '${property}'`, {
            itemKeys: item ? Object.keys(item) : 'null',
            itemType: typeof item,
            itemHasDepth: item?.depth !== undefined,
            itemHasRaw: !!item?.raw,
            property
          });
          return fallback;
        }
        const value = data[property];
        // Return fallback for null, undefined, or if property doesn't exist
        return value !== undefined && value !== null ? value : fallback;
      } catch (error) {
        console.error(`DetailView.safeGet: EXCEPTION accessing property '${property}'`, error, { 
          item: item ? Object.keys(item) : 'null',
          itemType: typeof item,
          property 
        });
        return fallback;
      }
    },
    getItemDataCached(item: any): any {
      // Always return null (never undefined) for consistency
      try {
        // CRITICAL: Check for undefined/null first
        if (item === undefined || item === null) {
          return null;
        }
        const data = this.getItemData(item);
        return data ? data : null;
      } catch (error) {
        return null;
      }
    },
    getFormattedConstantKind(kind?: string) {
      if (!kind) return "-";

      const latexStr = ElementDisplayUtils.formatConstantKindLatex(kind);

      return katex.renderToString(latexStr, {
        displayMode: true,
        throwOnError: false,
      });
    },
    getConstantKindBadgeColor(kind: string) {
      return ElementDisplayUtils.constantKindColor(kind);
    },
    convertExpressionToLatex(str?: string) {
      if (!str) return "-";

      const latexStr = ElementDisplayUtils.formatExpressionToLatex(str);

      return katex.renderToString(latexStr, {
        displayMode: true,
        throwOnError: false,
      });
    },
    convertValueWithUncertaintyToLatex1(
      val?: number,
      uncertainty?: number,
      direction?: string,
      kind?: string
    ) {
      if (!val) return "-";

      if (!kind)
        return katex.renderToString(val.toString(), {
          displayMode: true,
          throwOnError: false,
        });

      const signDic: Record<string, string> = {
        Positive: "+",
        Negative: "-",
        Both: "\\pm",
        "-": "",
      };
      const unitDic: Record<string, string> = {
        Enthalpy: "\\frac{kCal}{mol}",
        Entropy: "\\frac{Cal}{mol \\Kappa}",
        Equilibrium: "",
        "-": "",
      };
      const latexStr = `${val}${signDic[direction ?? "-"]}${
        uncertainty ?? ""
      }\\space${unitDic[kind ?? "-"]}`;

      return katex.renderToString(latexStr, {
        displayMode: true,
        throwOnError: false,
      });
    },
    convertValueWithUncertaintyToLatex2(
      val?: number,
      uncertainty?: number,
      direction?: string,
      kind?: string
    ) {
      if (!val) return "-";

      if (kind && kind !== "Equilibrium") {
        val *= 4.184;

        if (uncertainty) {
          uncertainty *= 4.184;
          uncertainty.toFixed(0);
        }
      }

      if (!kind)
        return katex.renderToString(val.toString(), {
          displayMode: true,
          throwOnError: false,
        });

      const signDic: Record<string, string> = {
        Positive: "+",
        Negative: "-",
        Both: "\\pm",
        "-": "",
      };
      const unitDic: Record<string, string> = {
        Enthalpy: "\\frac{kJ}{mol}",
        Entropy: "\\frac{J}{mol \\Kappa}",
        "-": "",
      };
      const latexStr = `${val.toFixed(1)}${signDic[direction ?? "-"]}${
        uncertainty?.toFixed(0) ?? ""
      }\\space${unitDic[kind ?? "-"]}`;

      return katex.renderToString(latexStr, {
        displayMode: true,
        throwOnError: false,
      });
    },
    switchPreviewMode() {
      this.isIn3DPreviewMode = !this.isIn3DPreviewMode;
      this.molLoaded = false;
    },
    async loadPreview() {
      if (this.isIn3DPreviewMode) await this.load3DMol();
      else {
        await this.load2DMol();
        await this.load2DMol();
      }
    },
    getFormattedMetalForm(form?: string) {
      if (!form || form === "-") return "-";

      const latexStr = MetalDisplayUtils.formatMetalFormulaString(form);

      return katex.renderToString(latexStr, {
        displayMode: true,
        throwOnError: false,
      });
    },
    getFormattedProtonationForm(pro?: string) {
      if (!pro || pro === "-") return "-";

      const latexStr = ProtonationDisplayUtil.formatProtonationString(pro);

      return katex.renderToString(latexStr, {
        displayMode: true,
        throwOnError: false,
      });
    },
    regroup() {
      // Instead of grouping (which hides columns), we'll sort by selected fields
      // This keeps all columns visible while organizing data
      const temp = [];

      for (const state of this.groupKeys) {
        if (!state.isChecked) continue;
        temp.push({ key: state.key });
      }

      // Store selected fields for sorting (not grouping)
      this.groupBy = temp.length > 0 ? temp : [];
      
      console.log('DetailView.regroup: User clicked REGROUP', {
        selectedFields: this.groupBy.map(g => g.key),
        totalConstants: this.constants.length,
        willSort: this.groupBy.length > 0
      });
    },
    exportConstantsToCSV() {
      const data = this.sortedConstants;
      if (data.length === 0) {
        alert('No constants data to export');
        return;
      }

      // CSV headers
      const csvHeaders = [
        'Expression',
        'Constant Kind',
        'Temperature (°C)',
        'Ionic Strength (M)',
        'Value',
        'Magnitude',
        'Direction',
        'Legacy Identifier'
      ];

      // Create CSV rows
      const csvRows = data.map(item => {
        const temp = item.temperature !== undefined && item.temperature !== null
          ? item.temperature + (item.temperature_varies ? ' (varies)' : '')
          : '';
        const ionicStrength = item.ionic_strength !== undefined && item.ionic_strength !== null
          ? item.ionic_strength
          : '';
        
        return [
          this.escapeCSV(item.expression_string || ''),
          this.escapeCSV(item.constant_kind || ''),
          this.escapeCSV(temp),
          this.escapeCSV(ionicStrength),
          this.escapeCSV(item.value !== undefined ? item.value.toString() : ''),
          this.escapeCSV(item.magnitude !== undefined ? item.magnitude.toString() : ''),
          this.escapeCSV(item.direction || ''),
          this.escapeCSV(item.legacy_identifier || '')
        ].join(',');
      });

      // Combine header and rows
      const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      const ligandName = this.selectedSearchResult?.name?.replace(/[^a-z0-9]/gi, '_') || 'constants';
      link.setAttribute('download', `wrascal_constants_${ligandName}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    exportConstantsToJSON() {
      const data = this.sortedConstants;
      if (data.length === 0) {
        alert('No constants data to export');
        return;
      }

      // Convert to plain objects for JSON export
      const jsonData = data.map(item => ({
        expression_string: item.expression_string || '',
        constant_kind: item.constant_kind || '',
        temperature: item.temperature,
        temperature_varies: item.temperature_varies || false,
        ionic_strength: item.ionic_strength,
        value: item.value,
        magnitude: item.magnitude,
        direction: item.direction || '',
        legacy_identifier: item.legacy_identifier || ''
      }));

      const jsonContent = JSON.stringify(jsonData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      const ligandName = this.selectedSearchResult?.name?.replace(/[^a-z0-9]/gi, '_') || 'constants';
      link.setAttribute('download', `wrascal_constants_${ligandName}_${new Date().toISOString().split('T')[0]}.json`);
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
    },
    changeUnbalancedDataState() {
      this.showUnbalancedData = !this.showUnbalancedData;

      if (this.showUnbalancedData) {
        this.constants = this.originalData;
      } else {
        this.constants = this.originalData
          .filter((d) => d.expression_string !== undefined)
          .filter(
            (d) => unbalancedDataNameList.indexOf(d.expression_string!) === -1
          );
      }
    },
    retryFailed() {
      for (const fail of this.failedResources) fail.action();

      this.failedResources = [];
    },
    loadConstants() {
      const store = searchResultStore();

      if (!store.selectedSearchResult || !store.selectedSearchResult.ligand_id || !store.selectedSearchResult.metal_id) {
        this.failedResources.push({
          resourceName: "Constants",
          detail: "Missing ligand_id or metal_id",
          action: () => this.loadConstants(),
        });
        this.isLoading = false;
        return;
      }

      console.log("DetailView.loadConstants: Starting API call");
      console.log("  ligand_id:", store.selectedSearchResult.ligand_id);
      console.log("  metal_id:", store.selectedSearchResult.metal_id);

      getConstants(
        store.selectedSearchResult.ligand_id,
        store.selectedSearchResult.metal_id
      )
        .then((result) => {
          console.log("DetailView.loadConstants: API response received");
          console.log("  resultLength:", result?.length || 0);
          console.log("  resultIsArray:", Array.isArray(result));
          if (result && result.length > 0) {
            console.log("  firstItem keys:", Object.keys(result[0]));
            console.log("  firstItem.expression_string:", result[0].expression_string);
            console.log("  firstItem.constant_kind:", result[0].constant_kind);
            console.log("  firstItem.value:", result[0].value);
          }

          if (!result) {
            console.warn("DetailView.loadConstants: API returned null/undefined");
            return;
          }

          if (!this.categories || this.categories.length === 0) {
            let resultCategories: string[] = [];
            for (const constant of result) {
              resultCategories = resultCategories.concat(
                constant.categories ?? []
              );
            }

            this.categories = Array.from(new Set(resultCategories));

            if (this.categories.length === 0) this.categories = null;
          }

          if (!this.molecular_formula) {
            const temp = new LigandAdvanceSearchResultModel();
            temp.molecular_formula =
              result[0].molecular_formula ?? new MolecularFormula();

            this.molecular_formula =
              ProcessedLigandAdvanceSearchResultModel.process(
                temp
              ).molecular_formula;
          }

          if (result.length === 1 && result[0].expression_string === "*") {
            this.noDataAvailable = true;
          }

          const filteredData = [];
          let skippedUndefined = 0;
          let skippedUnbalanced = 0;

          // Fix: loop should include index 0 (changed i > 0 to i >= 0)
          for (let i = result.length - 1; i >= 0; i--) {
            const constant = result[i];

            // Handle null, undefined, or empty string
            const expr = constant.expression_string;
            if (expr === undefined || expr === null || expr === "") {
              skippedUndefined++;
              continue;
            }
            // Check if expression is in the unbalanced list
            if (
              unbalancedDataNameList.indexOf(expr) !== -1
            ) {
              skippedUnbalanced++;
              continue;
            }
            filteredData.push(constant);
          }

          this.originalData = result;
          this.constants = filteredData;

          // Enhanced diagnostic logging - use individual logs so values are always visible
          console.log("DetailView.loadConstants: Filtering complete");
          console.log("  totalResults:", result.length);
          console.log("  filteredCount:", filteredData.length);
          console.log("  skippedUndefined:", skippedUndefined);
          console.log("  skippedUnbalanced:", skippedUnbalanced);
          console.log("  unbalancedList:", unbalancedDataNameList);
          if (result.length > 0) {
            console.log("  firstResult.expression_string:", result[0].expression_string);
            console.log("  firstResult.expression_string type:", typeof result[0].expression_string);
            console.log("  firstResult.expression_string === null:", result[0].expression_string === null);
            console.log("  firstResult.expression_string === undefined:", result[0].expression_string === undefined);
            console.log("  firstResult.constant_kind:", result[0].constant_kind);
            console.log("  firstResult.value:", result[0].value);
            console.log("  firstResult.hasExpression:", result[0].expression_string !== undefined && result[0].expression_string !== null && result[0].expression_string !== "");
            console.log("  first 5 expressions:", result.slice(0, 5).map(r => r.expression_string));
            console.log("  first 5 expression types:", result.slice(0, 5).map(r => typeof r.expression_string));
          }
          if (filteredData.length > 0) {
            console.log("  firstFiltered.expression_string:", filteredData[0].expression_string);
            console.log("  firstFiltered.constant_kind:", filteredData[0].constant_kind);
            console.log("  firstFiltered.value:", filteredData[0].value);
          }

          // Only log if there's a problem with data structure
          if (filteredData.length > 0) {
            const firstItem = filteredData[0];
            // Check if item has unexpected structure (like raw, items, depth - these shouldn't be in raw data)
            if (firstItem.raw !== undefined || firstItem.items !== undefined || firstItem.depth !== undefined) {
              console.error("DetailView.loadConstants: UNEXPECTED - Raw data has Vuetify wrapper properties!", {
                itemKeys: Object.keys(firstItem),
                hasRaw: !!firstItem.raw,
                hasItems: !!firstItem.items,
                hasDepth: firstItem.depth !== undefined,
                firstItem: JSON.stringify(firstItem, null, 2).substring(0, 500)
              });
            }
          } else if (result.length > 0) {
            console.warn("DetailView.loadConstants: All items filtered out", {
              totalResults: result.length,
              firstItemKeys: Object.keys(result[0]),
              firstItemExpression: result[0].expression_string,
              firstItemSample: JSON.stringify(result[0], null, 2).substring(0, 500)
            });
          }

          // Start with NO grouping - show flat table so all data is visible and clear
          this.groupBy = [];
          this.groupKeys = [
            {
              key: "expression_string",
              name: "Expression",
              isChecked: false,
            },
            {
              key: "constant_kind",
              name: "Constant Kind",
              isChecked: false,
            },
            {
              key: "ionic_strength",
              name: "Ionic Strength",
              isChecked: false,
            },
            {
              key: "value",
              name: "Value",
              isChecked: false,
            },
            {
              key: "temperature",
              name: "Temperature",
              isChecked: false,
            },
          ];
          
          // Set loading to false after constants load (if mol data and references are also done)
          this.checkLoadingComplete();
        })
        .catch(async (err) => {
          console.error("DetailView.loadConstants: API call failed", err);
          console.error("  error message:", err?.message || err);
          console.error("  error stack:", err?.stack);
          this.failedConstantCount += 1;
          console.log("  failedConstantCount:", this.failedConstantCount);

          if (this.failedConstantCount < 3) {
            console.log("  Retrying in", 500 * this.failedConstantCount, "ms");
            await new Promise((r) =>
              setTimeout(r, 500 * this.failedConstantCount)
            );
            this.loadConstants();
            return;
          }

          console.error("  Max retries reached, giving up");
          this.failedResources.push({
            resourceName: "Constants",
            detail: err?.message || String(err),
            action: () => this.loadConstants(),
          });
          
          this.checkLoadingComplete();
        });
    },
    checkLoadingComplete() {
      // Set isLoading to false once all data has been attempted to load
      // We check if constants have been loaded (or failed after retries)
      const constantsDone = this.constants.length > 0 || this.originalData.length > 0 || this.noDataAvailable || this.failedConstantCount >= 3;
      const molDataDone = this.molData !== null || this.failedMolDataCount >= 3;
      // References are done if we have data, empty array (no references), or failed after retries
      const referencesDone = Array.isArray(this.references) || this.failedReferenceCount >= 3;
      
      console.log('DetailView.checkLoadingComplete:', {
        constantsDone,
        constantsLength: this.constants.length,
        failedConstantCount: this.failedConstantCount,
        molDataDone,
        molData: this.molData !== null,
        failedMolDataCount: this.failedMolDataCount,
        referencesDone,
        referencesIsArray: Array.isArray(this.references),
        referencesLength: Array.isArray(this.references) ? this.references.length : 'not array',
        failedReferenceCount: this.failedReferenceCount,
        allDone: constantsDone && molDataDone && referencesDone
      });
      
      if (constantsDone && molDataDone && referencesDone) {
        console.log('DetailView.checkLoadingComplete: All data loaded, setting isLoading = false');
        this.isLoading = false;
      } else {
        console.log('DetailView.checkLoadingComplete: Still waiting for data...');
      }
    },
    async loadMolData() {
      if (!this.selectedSearchResult || !this.selectedSearchResult.ligand_id) {
        this.failedMolDataCount += 1;
        this.failedResources.push({
          resourceName: "MolData",
          detail: "Missing ligand_id",
          action: () => this.loadMolData(),
        });
        this.checkLoadingComplete();
        return;
      }

      try {
        // Try real API first
        const result = await getMolData(this.selectedSearchResult.ligand_id);
        if (result) {
          this.molData = result;
          await this.load2DMol();
          await this.load2DMol();

          await this.$loadScript(
            "https://unpkg.com/@rdkit/rdkit/dist/RDKit_minimal.js"
          );

          const smiles = await this.getSmileCode();
          this.smileStr = smiles;
          this.checkLoadingComplete();
          return;
        }
      } catch (err) {
        console.log("Real API failed, trying mock data...", err);
      }

      // Fallback to mock data
      try {
        const mockResult = await mockGetMolData(this.selectedSearchResult.ligand_id);
        if (mockResult) {
          this.molData = mockResult;
          await this.load2DMol();
          await this.load2DMol();

          await this.$loadScript(
            "https://unpkg.com/@rdkit/rdkit/dist/RDKit_minimal.js"
          );

          const smiles = await this.getSmileCode();
          this.smileStr = smiles;
          console.log("✅ Using mock molecular data for visualization testing");
          this.checkLoadingComplete();
          return;
        }
      } catch (mockErr) {
        console.error("Mock data also failed:", mockErr);
      }

      // If both fail, increment failure count and retry if needed
      this.failedMolDataCount += 1;
      console.log("MolData failed, attempt:", this.failedMolDataCount);

      if (this.failedMolDataCount < 3) {
        // Retry after a delay
        console.log("Retrying mol data in", 500 * this.failedMolDataCount, "ms");
        await new Promise((r) =>
          setTimeout(r, 500 * this.failedMolDataCount)
        );
        this.loadMolData();
        return;
      }

      // Max retries reached, show error and stop loading
      console.error("Max mol data retries reached, giving up");
      this.failedResources.push({
        resourceName: "MolData",
        detail: "Both real API and mock data failed after 3 attempts",
        action: () => {
          this.failedMolDataCount = 0;
          this.loadMolData();
        },
      });
      
      this.checkLoadingComplete();
    },
    loadReferences() {
      console.log('DetailView.loadReferences: Starting API call');
      if (!this.selectedSearchResult || !this.selectedSearchResult.ligand_id) {
        console.error('DetailView.loadReferences: Missing ligand_id');
        this.failedReferenceCount += 1;
        this.failedResources.push({
          resourceName: "References",
          detail: "Missing ligand_id",
          action: () => {
            this.failedReferenceCount = 0;
            this.loadReferences();
          },
        });
        this.checkLoadingComplete();
        return;
      }

      console.log('DetailView.loadReferences: Calling API for ligand_id:', this.selectedSearchResult.ligand_id);
      getReferences(this.selectedSearchResult.ligand_id)
        .then((result) => {
          console.log('DetailView.loadReferences: API response received', result ? `result length: ${result.length}` : 'result is null/undefined');
          if (!result) {
            // Empty result - mark as done
            this.references = [];
            this.checkLoadingComplete();
            return;
          }

          this.references = result;
          console.log('DetailView.loadReferences: References loaded, count:', result.length);
          this.checkLoadingComplete();
        })
        .catch(async (err) => {
          console.error('DetailView.loadReferences: API call failed', err);
          this.failedReferenceCount += 1;
          console.log('DetailView.loadReferences: Failed attempt:', this.failedReferenceCount);

          if (this.failedReferenceCount < 3) {
            console.log('DetailView.loadReferences: Retrying in', 500 * this.failedReferenceCount, 'ms');
            await new Promise((r) =>
              setTimeout(r, 500 * this.failedReferenceCount)
            );
            this.loadReferences();
            return;
          }

          console.error('DetailView.loadReferences: Max retries reached, giving up');
          this.failedResources.push({
            resourceName: "References",
            detail: err?.message || String(err),
            action: () => {
              this.failedReferenceCount = 0;
              this.loadReferences();
            },
          });
          
          this.checkLoadingComplete();
        });
    },
  },
  mounted() {
    const store = searchResultStore();

    this.failedConstantCount = 0;
    this.failedMolDataCount = 0;
    this.failedReferenceCount = 0;

    // Validate that selectedSearchResult exists and has required fields
    console.log('DetailView mounted - store.selectedSearchResult:', store.selectedSearchResult);
    if (store.selectedSearchResult) {
      console.log('selectedSearchResult.ligand_id:', store.selectedSearchResult.ligand_id);
      console.log('selectedSearchResult.metal_id:', store.selectedSearchResult.metal_id);
      console.log('selectedSearchResult keys:', Object.keys(store.selectedSearchResult));
    }
    
    if (!store.selectedSearchResult || !store.selectedSearchResult.ligand_id || !store.selectedSearchResult.metal_id) {
      console.error('Invalid selectedSearchResult:', store.selectedSearchResult);
      console.error('Missing fields - ligand_id:', store.selectedSearchResult?.ligand_id, 'metal_id:', store.selectedSearchResult?.metal_id);
      this.isLoading = false;
      this.failedResources.push({
        resourceName: "Search Result",
        detail: "Invalid search result selected. Please go back and select a valid result.",
        action: () => this.$router.push('/')
      });
      return;
    }

    this.selectedSearchResult = store.selectedSearchResult;
    
    // Handle categories - may be missing for simple search results
    if (store.selectedSearchResult.categories) {
      this.categories =
        store.selectedSearchResult.categories == ""
          ? null
          : store.selectedSearchResult.categories.split(",");
    } else {
      this.categories = null; // Will be populated from constants data
    }
    
    // Handle molecular_formula - may be missing for simple search results
    this.molecular_formula = store.selectedSearchResult.molecular_formula || null;
    
    this.element_with_charge = `${
      store.selectedSearchResult.central_element || '-'
    }<sup>${ElementDisplayUtils.formatElementCharge(
      +store.selectedSearchResult.metal_charge || 0
    )}</sup>`;

    this.isLoading = true;

    // Add global error handler to catch any TypeErrors that slip through
    const originalErrorHandler = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      if (message && typeof message === 'string' && message.includes('Cannot read properties of undefined')) {
        console.error('DetailView: CAUGHT GLOBAL TypeError - This should not happen with safeGet', {
          message,
          source,
          lineno,
          colno,
          error,
          constantsLength: this.constants?.length,
          constantsFirstItem: this.constants?.[0] ? Object.keys(this.constants[0]) : null
        });
      }
      if (originalErrorHandler) {
        return originalErrorHandler(message, source, lineno, colno, error);
      }
      return false;
    };

    this.loadConstants();
    this.loadMolData();
    this.loadReferences();
  },
  watch: {
    constants: {
      handler(newVal: any[], oldVal: any[]) {
        console.log('DetailView.constants watcher: constants changed');
        console.log('  newVal length:', newVal?.length || 0);
        console.log('  oldVal length:', oldVal?.length || 0);
        
        if (newVal && newVal.length > 0) {
          const firstItem = newVal[0];
          console.log('  firstItem keys:', Object.keys(firstItem));
          console.log('  firstItem.expression_string:', firstItem.expression_string);
          console.log('  firstItem.constant_kind:', firstItem.constant_kind);
          console.log('  firstItem.value:', firstItem.value);
          
          // Check if it's a Vuetify-wrapped item (shouldn't be in raw constants array)
          if (firstItem.raw !== undefined || firstItem.items !== undefined || firstItem.depth !== undefined) {
            console.error('DetailView.constants watcher: UNEXPECTED - constants array contains Vuetify-wrapped items!');
          }
        } else {
          console.warn('DetailView.constants watcher: constants array is empty or null');
        }
      },
      immediate: true,
      deep: true
    },
    sortedConstants: {
      handler(newVal: any[], oldVal: any[]) {
        console.log('DetailView.sortedConstants watcher: sortedConstants changed');
        console.log('  newVal length:', newVal?.length || 0);
        console.log('  oldVal length:', oldVal?.length || 0);
      },
      immediate: true,
      deep: true
    }
  },
});
</script>

<style scoped></style>
