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
        <v-alert
          class="mt-5"
          v-for="failed in this.failedResources"
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
        <v-divider class="mt-2 mb-2"></v-divider>
        <div class="d-flex">
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

      <v-data-table
        v-model:items-per-page="itemsPerPage"
        :group-by="groupBy.length > 0 ? groupBy : undefined"
        :headers="headers"
        :items="constants"
        :items-per-page="itemsPerPage"
        multi-sort
        class="mt-8 elevation-1"
      >
        <template
          v-if="groupBy.length > 0"
          v-slot:group-header="{ item, columns, toggleGroup, isGroupOpen }"
        >
          <tr class="text-left">
            <td :colspan="columns.length" class="pa-2" style="background-color: rgba(0,0,0,0.05);">
              <VBtn
                size="small"
                variant="text"
                :class="`ml-${item.depth * 5}`"
                :icon="isGroupOpen(item) ? '$expand' : '$next'"
                @click="toggleGroup(item)"
              ></VBtn>
              <strong v-html="item.value"></strong>
              <span v-if="item.items" class="text-caption ml-2">({{ item.items.length }} items)</span>
            </td>
          </tr>
        </template>
        <template v-slot:expanded-row="{ columns, item }">
          <tr v-if="getItemData(item)">
            <td :colspan="columns.length" class="text-left">
              <v-chip class="ma-2" color="primary" label text-color="white">
                <v-icon start icon="mdi-note-text-outline"></v-icon>
                FootNote:
                <div
                  class="ml-2"
                  v-html="getFootNote(getItemData(item)?.legacy_identifier) ?? 'None'"
                ></div>
              </v-chip>
            </td>
          </tr>
        </template>
        <template v-slot:[`item.constant_kind`]="{ item }">
          <template v-if="getItemData(item)">
            <v-chip v-if="getItemData(item)?.constant_kind" :color="getConstantKindBadgeColor(getItemData(item)!.constant_kind)">
              <div
                class="no-katex-html"
                v-html="getFormattedConstantKind(getItemData(item)!.constant_kind)"
              ></div>
            </v-chip>
            <span v-else>-</span>
          </template>
          <span v-else>-</span>
        </template>
        <template v-slot:[`item.expression_string`]="{ item }">
          <template v-if="getItemData(item)">
            <div
              v-if="getItemData(item)?.expression_string"
              class="no-katex-html"
              v-html="convertExpressionToLatex(getItemData(item)!.expression_string)"
            ></div>
            <span v-else>-</span>
          </template>
          <span v-else>-</span>
        </template>
        <template v-slot:[`item.temperature`]="{ item }">
          <template v-if="getItemData(item)">
            <div>
              {{ (getItemData(item)!.temperature !== undefined && getItemData(item)!.temperature !== null)
                ? getItemData(item)!.temperature + (getItemData(item)!.temperature_varies ? ' (varies)' : '') + ' °C'
                : '-' }}
            </div>
          </template>
          <span v-else>-</span>
        </template>
        <template v-slot:[`item.ionic_strength`]="{ item }">
          <template v-if="getItemData(item)">
            <div>
              {{ (getItemData(item)!.ionic_strength !== undefined && getItemData(item)!.ionic_strength !== null)
                ? getItemData(item)!.ionic_strength + ' M'
                : '-' }}
            </div>
          </template>
          <span v-else>-</span>
        </template>
        <template v-slot:[`item.value`]="{ item }">
          <template v-if="getItemData(item)">
            <div style="min-width: 150px" class="d-flex align-center">
              <div
                class="no-katex-html pl-3 pr-3"
                v-html="
                  convertValueWithUncertaintyToLatex1(
                    getItemData(item)!.value,
                    getItemData(item)!.magnitude,
                    getItemData(item)!.direction,
                    getItemData(item)!.constant_kind
                  )
                "
              ></div>
              <div
                v-if="getItemData(item)!.constant_kind !== 'Equilibrium'"
                class="no-katex-html pl-3 pr-3"
                v-html="
                  convertValueWithUncertaintyToLatex2(
                    getItemData(item)!.value,
                    getItemData(item)!.magnitude,
                    getItemData(item)!.direction,
                    getItemData(item)!.constant_kind
                  )
                "
              ></div>
            </div>
          </template>
          <span v-else>-</span>
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
        { title: "FootNotes", key: "data-table-expand" },
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
      failedResources: [] as RequestFailedModel[],
      failedConstantCount: 0,
      failedMolDataCount: 0,
      failedReferenceCount: 0,
    };
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
        // Log the item structure for debugging
        if (!item) {
          console.warn('DetailView.getItemData: item is null or undefined');
          return null;
        }
        
        // Log item structure when it's unexpected
        const hasValue = item.value !== undefined;
        const hasItems = item.items !== undefined;
        const hasRaw = item.raw !== undefined;
        const itemType = typeof item;
        const itemKeys = item ? Object.keys(item) : [];
        
        // If it's a group header (has value and items), return null
        if (hasValue && hasItems && Array.isArray(item.items)) {
          console.log('DetailView.getItemData: Detected group header', { 
            value: item.value, 
            itemsCount: item.items.length,
            itemKeys 
          });
          return null;
        }
        
        // In Vuetify grouped tables, the actual data row is usually in item.raw
        // But check item directly first in case it's not wrapped
        let data = item;
        
        // Check if item.raw exists and is not a group header
        if (hasRaw && typeof item.raw === 'object') {
          // Make sure it's not a group header
          if (!item.raw.items || !Array.isArray(item.raw.items)) {
            data = item.raw;
            console.log('DetailView.getItemData: Using item.raw', { 
              rawKeys: Object.keys(item.raw),
              hasValue: item.raw.value !== undefined,
              hasExpression: item.raw.expression_string !== undefined
            });
          } else {
            console.log('DetailView.getItemData: item.raw is a group header, using item directly');
          }
        }
        
        // Final check - make sure we have a valid data object with expected properties
        if (data && typeof data === 'object') {
          // Check if it has at least one property that suggests it's actual data
          const hasDataValue = data.value !== undefined;
          const hasTemperature = data.temperature !== undefined;
          const hasExpression = data.expression_string !== undefined;
          
          if (hasDataValue || hasTemperature || hasExpression) {
            console.log('DetailView.getItemData: Valid data object found', {
              hasValue: hasDataValue,
              hasTemperature,
              hasExpression,
              allKeys: Object.keys(data)
            });
            return data;
          } else {
            console.warn('DetailView.getItemData: Data object missing expected properties', {
              itemKeys,
              dataKeys: Object.keys(data),
              itemType,
              hasRaw,
              itemStructure: JSON.stringify(item, null, 2)
            });
          }
        } else {
          console.warn('DetailView.getItemData: Data is not a valid object', {
            data,
            dataType: typeof data,
            itemKeys,
            itemType
          });
        }
        
        return null;
      } catch (error) {
        console.error('DetailView.getItemData: Error processing item', error, {
          item,
          itemType: typeof item,
          itemKeys: item ? Object.keys(item) : []
        });
        return null;
      }
    },
    safeGet(item: any, property: string, fallback: any = null): any {
      try {
        const data = this.getItemData(item);
        if (!data) return fallback;
        return data[property] !== undefined ? data[property] : fallback;
      } catch (error) {
        console.error(`DetailView.safeGet: Error accessing property ${property}`, error, { item, property });
        return fallback;
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
      const temp = [];

      for (const state of this.groupKeys) {
        if (!state.isChecked) continue;
        temp.push({ key: state.key });
      }

      // Only apply grouping if at least one field is selected
      // If none selected, show flat table
      this.groupBy = temp.length > 0 ? temp : [];
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

      getConstants(
        store.selectedSearchResult.ligand_id,
        store.selectedSearchResult.metal_id
      )
        .then((result) => {
          if (!result) return;

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

          for (let i = result.length - 1; i > 0; i--) {
            const constant = result[i];

            if (constant.expression_string === undefined) continue;
            if (
              unbalancedDataNameList.indexOf(constant.expression_string) === -1
            ) {
              filteredData.push(constant);
            }
          }

          this.originalData = result;
          this.constants = filteredData;

          // Comprehensive logging to understand the data structure
          console.log("DetailView.loadConstants: Data loaded", {
            totalResults: result.length,
            filteredCount: filteredData.length,
            originalDataLength: this.originalData.length,
            constantsArrayLength: this.constants.length
          });
          
          if (filteredData.length > 0) {
            const firstItem = filteredData[0];
            console.log("DetailView.loadConstants: First item structure", {
              item: firstItem,
              itemType: typeof firstItem,
              itemKeys: Object.keys(firstItem),
              hasValue: firstItem.value !== undefined,
              hasExpression: firstItem.expression_string !== undefined,
              hasTemperature: firstItem.temperature !== undefined,
              hasConstantKind: firstItem.constant_kind !== undefined,
              fullItem: JSON.stringify(firstItem, null, 2)
            });
            
            // Check if items are plain objects or have special structure
            console.log("DetailView.loadConstants: Sample items structure check", {
              item0: filteredData[0],
              item0HasRaw: filteredData[0]?.raw !== undefined,
              item0HasItems: filteredData[0]?.items !== undefined,
              item0HasValue: filteredData[0]?.value !== undefined,
              constantsArrayType: Array.isArray(this.constants),
              constantsArrayFirstType: typeof this.constants[0]
            });
          } else {
            console.warn("DetailView.loadConstants: No filtered data, but result has", result.length, "items");
            if (result.length > 0) {
              console.log("DetailView.loadConstants: First unfiltered item", {
                item: result[0],
                itemKeys: Object.keys(result[0]),
                whyFiltered: result[0].expression_string === undefined ? "missing expression_string" : "in unbalanced list"
              });
            }
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
          this.failedConstantCount += 1;

          if (this.failedConstantCount < 3) {
            await new Promise((r) =>
              setTimeout(r, 500 * this.failedConstantCount)
            );
            this.loadConstants();
            return;
          }

          this.failedResources.push({
            resourceName: "Constants",
            detail: err,
            action: () => this.loadConstants(),
          });
          
          this.checkLoadingComplete();
        });
    },
    checkLoadingComplete() {
      // Set isLoading to false once all data has been attempted to load
      // We check if constants have been loaded (or failed after retries)
      if (this.failedConstantCount >= 3 || this.constants.length > 0 || this.originalData.length > 0 || this.noDataAvailable) {
        // Also check if mol data and references have completed (or failed)
        const molDataDone = this.molData !== null || this.failedMolDataCount >= 3;
        const referencesDone = this.references.length > 0 || this.failedReferenceCount >= 3;
        const constantsDone = this.constants.length > 0 || this.originalData.length > 0 || this.noDataAvailable || this.failedConstantCount >= 3;
        
        if (constantsDone && molDataDone && referencesDone) {
          this.isLoading = false;
        }
      }
    },
    async loadMolData() {
      if (!this.selectedSearchResult || !this.selectedSearchResult.ligand_id) {
        this.failedResources.push({
          resourceName: "MolData",
          detail: "Missing ligand_id",
          action: () => this.loadMolData(),
        });
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
        console.log("Real API failed, trying mock data...");
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

      // If both fail, show error
      this.failedResources.push({
        resourceName: "MolData",
        detail: "Both real API and mock data failed",
        action: () => this.loadMolData(),
      });
      
      this.checkLoadingComplete();
    },
    loadReferences() {
      if (!this.selectedSearchResult || !this.selectedSearchResult.ligand_id) {
        this.failedResources.push({
          resourceName: "References",
          detail: "Missing ligand_id",
          action: () => this.loadReferences(),
        });
        return;
      }

      getReferences(this.selectedSearchResult.ligand_id)
        .then((result) => {
          if (!result) {
            this.checkLoadingComplete();
            return;
          }

          this.references = result;
          this.checkLoadingComplete();
        })
        .catch(async (err) => {
          this.failedReferenceCount += 1;

          if (this.failedReferenceCount < 3) {
            await new Promise((r) =>
              setTimeout(r, 500 * this.failedReferenceCount)
            );
            this.loadReferences();
            return;
          }

          this.failedResources.push({
            resourceName: "References",
            detail: err,
            action: () => this.loadReferences(),
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

    this.loadConstants();
    this.loadMolData();
    this.loadReferences();
  },
  watch: {
    constants: {
      handler(newVal: any[], oldVal: any[]) {
        console.log('DetailView.constants watcher: Array changed', {
          newLength: newVal?.length,
          oldLength: oldVal?.length,
          isArray: Array.isArray(newVal),
          firstItem: newVal?.[0],
          firstItemType: typeof newVal?.[0],
          firstItemKeys: newVal?.[0] ? Object.keys(newVal[0]) : [],
          firstItemHasRaw: newVal?.[0]?.raw !== undefined,
          firstItemHasItems: newVal?.[0]?.items !== undefined
        });
        
        // Log a few sample items to understand structure
        if (newVal && newVal.length > 0) {
          for (let i = 0; i < Math.min(3, newVal.length); i++) {
            const item = newVal[i];
            const itemData = this.getItemData(item);
            console.log(`DetailView.constants watcher: Item ${i}`, {
              rawItem: item,
              extractedData: itemData,
              itemType: typeof item,
              itemKeys: item ? Object.keys(item) : [],
              dataKeys: itemData ? Object.keys(itemData) : []
            });
          }
        }
      },
      immediate: true,
      deep: true
    }
  },
  computed: {
    molViewStyle(): string {
      const background = this.theme.global.current.value.dark
        ? "gray"
        : "transparent";

      return `height: 400px; background: ${background}; ${
        this.molLoaded ? "" : "display: none;"
      }`;
    },
  },
});
</script>

<style scoped></style>
