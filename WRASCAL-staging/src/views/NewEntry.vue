<template>
  <v-container class="pt-8">
    <h1>New Entry Submission</h1>
    <br />

    <!-- Each component corresponds to a single table in the database -->

    <MetalInfo :isLoading="isLoading" @entry="updateField" />

    <LigandInfo :isLoading="isLoading" @entry="updateField" />

    <ConditionsInfo :isLoading="isLoading" @entry="updateField" />

    <ConstantsInfo :isLoading="isLoading" @entry="updateField" />

    <UncertaintiesInfo :isLoading="isLoading" @entry="updateField" />

    <LiteraturesInfo :isLoading="isLoading" @entry="updateField" />

    <FootnotesInfo :isLoading="isLoading" @entry="updateField" />

    <v-btn
      id="sumbitbutton"
      type="submit"
      block
      class="mt-2"
      color="primary"
      :loading="isSubmitting"
      :disabled="isSubmitting"
      @click="submitForm"
      >Submit</v-btn
    >
    
    <!-- Success/Error Messages -->
    <v-snackbar
      v-model="showSuccessMessage"
      color="success"
      timeout="5000"
      location="top"
    >
      Entry submitted successfully!
      <template v-slot:actions>
        <v-btn variant="text" @click="showSuccessMessage = false">Close</v-btn>
      </template>
    </v-snackbar>
    
    <v-snackbar
      v-model="showErrorMessage"
      color="error"
      timeout="10000"
      location="top"
    >
      {{ errorMessage }}
      <template v-slot:actions>
        <v-btn variant="text" @click="showErrorMessage = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import LigandInfo from "@/components/DataEntry/LigandInfo.vue";
import { NoteType } from "@/models/Note";
import MetalInfo from "@/components/DataEntry/MetalInfo.vue";
import ConditionsInfo from "@/components/DataEntry/ConditionsInfo.vue";
import ConstantsInfo from "@/components/DataEntry/ConstantsInfo.vue";
import FootnotesInfo from "@/components/DataEntry/FootnotesInfo.vue";
import UncertaintiesInfo from "@/components/DataEntry/UncertaintiesInfo.vue";
import LiteraturesInfo from "@/components/DataEntry/LiteraturesInfo.vue";

import { Element } from "@/models/enums/element";
import { footnoteType } from "@/models/enums/footnoteType";
import {
  MetalData,
  Atom,
  MolecularFormula,
  form,
  LigandData,
  ConditionsData,
  ExpressionEntry,
  EquilibriumExpressionData,
  ConstantsData,
  UncertaintiesData,
  LiteratureData,
  note,
  FootnotesData,
  writeRequest,
} from "../models/writeRequest";
import { AccessTokenResponse } from "@/models/UserData";

// POSTs the data to backend API endpoint. Reciever is currently in wrascal-ts-2024
// repository, under src/controllers/rest/api/WriteController.ts
async function postJSON(data: writeRequest): Promise<any> {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_ADDR}/rest/write/db`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Server error: ${response.status} ${response.statusText}`);
  }
  
  const result = await response.json();
  console.log("Success:", result);
  return result;
}

// Defines the HTML so that it can be used as a component in the vue frame on the site
function getUserID() {
  const user =
    window.localStorage.getItem("sb-eauyarvlibdxezijtoyx-auth-token") || "";
  const accessTokenResponse: AccessTokenResponse = JSON.parse(user);

  return accessTokenResponse.user.id;
}

// necessary for all vue components. As this component does not communicate with a parent, props (besides loading) are unneccesary.
export default defineComponent({
  name: "NewEntryForm",
  props: {
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  // child components must be ported into the parent. Other added components must be placed here.
  components: {
    MetalInfo,
    ConditionsInfo,
    ConstantsInfo,
    LigandInfo,
    FootnotesInfo,
    UncertaintiesInfo,
    LiteraturesInfo,
  },
  data: () => ({
    // all data is prefixed_ with the component it came from!

    // metal information
    metal_central_element: "",
    metal_formula_string: "",
    metal_charge: "",

    // ligand information
    ligand_name: "",
    ligand_molecular_formula: "",
    ligand_form_protonation: "",
    ligand_form_charge: "",
    ligand_charge: "",
    ligand_categories: "",

    // conditions information
    conditions_constant_kind: "",
    conditions_temperature: "",
    conditions_temperature_varies: false,
    conditions_ionic_strength: "",

    // equilibrium expression information
    expression_string: "",
    products: "",
    reactants: "",

    // constants info
    constants_value: "",
    constants_significant_figures: "",

    // uncertainties info
    direction: "",
    magnitude: "",

    // Literature info
    litref: "",
    litcode: "",

    //footnote info
    note_type: "",
    note_content: "",
    
    // UI state
    isSubmitting: false,
    showSuccessMessage: false,
    showErrorMessage: false,
    errorMessage: "",
  }),
  methods: {
    validateForm(): string[] {
      const errors: string[] = [];
      
      // Required fields validation
      if (!this.metal_central_element) {
        errors.push("Metal central element is required");
      }
      if (!this.ligand_name) {
        errors.push("Ligand name is required");
      }
      if (!this.expression_string) {
        errors.push("Expression string is required");
      }
      if (!this.constants_value || isNaN(parseInt(this.constants_value))) {
        errors.push("Valid constant value is required");
      }
      if (!this.conditions_constant_kind) {
        errors.push("Constant kind is required");
      }
      
      // Validate numeric fields
      if (this.metal_charge && isNaN(parseInt(this.metal_charge))) {
        errors.push("Metal charge must be a valid number");
      }
      if (this.ligand_charge && isNaN(parseInt(this.ligand_charge))) {
        errors.push("Ligand charge must be a valid number");
      }
      if (this.conditions_temperature && isNaN(parseInt(this.conditions_temperature))) {
        errors.push("Temperature must be a valid number");
      }
      if (this.conditions_ionic_strength && isNaN(parseInt(this.conditions_ionic_strength))) {
        errors.push("Ionic strength must be a valid number");
      }
      
      return errors;
    },
    async submitForm() {
      // Validate form
      const validationErrors = this.validateForm();
      if (validationErrors.length > 0) {
        this.errorMessage = "Please fix the following errors:\n" + validationErrors.join("\n");
        this.showErrorMessage = true;
        return;
      }
      
      this.isSubmitting = true;
      this.showErrorMessage = false;
      this.showSuccessMessage = false;
      
      try {
        console.log("ligand molecular formula", this.ligand_molecular_formula);

        // assembling the data into individual interfaces makes json structure easier to read and parse by the backend,
        // even though it's somewhat bloated here. Is there perhaps a better way to do this?

      const metalinfo: MetalData = {
        central_element: this.metal_central_element,
        formula_string: this.metal_formula_string,
        charge: parseInt(this.metal_charge),
      };

      const ligandinfo: LigandData = {
        name: this.ligand_name ?? "",
        molecular_formula: this.parseMolecularFormula(
          this.ligand_molecular_formula
        ),
        form: {
          protonation_level: parseInt(this.ligand_form_protonation) ?? 0,
          charge: parseInt(this.ligand_form_charge) ?? 0,
        } as form,
        charge: parseInt(this.ligand_charge) ?? 0,
        categories: this.ligand_categories.split(",") ?? [],
      };

      const conditionsinfo: ConditionsData = {
        constant_kind: this.conditions_constant_kind,
        temperature: parseInt(this.conditions_temperature),
        temperature_varies: this.conditions_temperature_varies,
        ionic_strength: parseInt(this.conditions_ionic_strength),
      };

      const equilibriumExpressioninfo: EquilibriumExpressionData = {
        expression_string: this.expression_string,
        products: this.parseExpressionEntryList(this.products),
        reactants: this.parseExpressionEntryList(this.reactants),
      };

      const constantsinfo: ConstantsData = {
        value: parseInt(this.constants_value),
        significant_figures: parseInt(this.constants_significant_figures),
        user_id: getUserID(),
      };

      const uncertaintiesinfo: UncertaintiesData = {
        direction: this.direction,
        magnitude: parseInt(this.magnitude),
      };

      const literatureinfo: LiteratureData = {
        litref: this.litref,
        litcode: this.litcode,
      };

      const footnoteinfo: FootnotesData = {
        notes: [
          {
            type: (this.note_type as footnoteType) ?? null,
            content: this.note_content,
          },
        ],
      };

      // the object that actually gets sent in the post request
      const writeData: writeRequest = {
        metalInfo: metalinfo,
        ligandInfo: ligandinfo,
        conditionsInfo: conditionsinfo,
        equilibriumExpressionInfo: equilibriumExpressioninfo,
        constantsInfo: constantsinfo,
        uncertaintiesInfo: uncertaintiesinfo,
        literaturesInfo: literatureinfo,
        footnotesInfo: footnoteinfo,
      };

        console.log("Sending Request");
        console.log(JSON.stringify(writeData));
        
        const response = await postJSON(writeData);
        
        if (response && response.error) {
          throw new Error(response.error);
        }
        
        // Success
        this.showSuccessMessage = true;
        // Reset form after successful submission
        setTimeout(() => {
          this.resetForm();
        }, 2000);
      } catch (error: any) {
        console.error("Error submitting form:", error);
        this.errorMessage = error?.message || "Failed to submit entry. Please try again.";
        this.showErrorMessage = true;
      } finally {
        this.isSubmitting = false;
      }
    },
    resetForm() {
      // Reset all form fields
      this.metal_central_element = "";
      this.metal_formula_string = "";
      this.metal_charge = "";
      this.ligand_name = "";
      this.ligand_molecular_formula = "";
      this.ligand_form_protonation = "";
      this.ligand_form_charge = "";
      this.ligand_charge = "";
      this.ligand_categories = "";
      this.conditions_constant_kind = "";
      this.conditions_temperature = "";
      this.conditions_temperature_varies = false;
      this.conditions_ionic_strength = "";
      this.expression_string = "";
      this.products = "";
      this.reactants = "";
      this.constants_value = "";
      this.constants_significant_figures = "";
      this.direction = "";
      this.magnitude = "";
      this.litref = "";
      this.litcode = "";
      this.note_type = "";
      this.note_content = "";
    },

    updateField(input: { fieldToChange: String; dataToSend: any }) {
      console.log("field updated: ", input.fieldToChange);
      // I should be sent to live on a butterfly farm for this line
      // vscode flags this as an error but it works anyways. funny how life woks
      this.$data[input.fieldToChange] = input.dataToSend;
      console.log("new value: ", this.$data[input.fieldToChange]);
    },
    // parse the string version of a molecular formula
    parseMolecularFormula(str: string): MolecularFormula {
      const atoms: Atom[] = [];
      const regex = /\([a-zA-Z]+,\d+\)/g;

      if (!str) return { atoms: atoms, charge: -1 } as MolecularFormula;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      [...str.matchAll(regex)].forEach((match, _) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        match.forEach((value, _) => {
          const [atomStr, atomCountStr] = value
            .substring(1, value.length - 1)
            .split(",");
          const element = atomStr;
          const atomCount = parseInt(atomCountStr);

          if (isNaN(atomCount))
            throw new TypeError(
              `invalid amount in record atomCount: [${atomStr}][${atomCountStr}]`
            );
          var newAtom = { element: element, count: atomCount } as Atom;
          atoms.push(newAtom);
        });
      });

      const charge = +(str.split(",").at(-1)?.replace(")", "") ?? "");

      if (isNaN(charge)) throw new TypeError(`invalid amount in record charge`);
      return { atoms: atoms, charge: charge } as MolecularFormula;
    },
    // parse the string version of an expression entry list
    parseExpressionEntryList(str: string): ExpressionEntry[] {
      if (!str) return [];

      var expressionList: ExpressionEntry[] = [];
      const elements = str.replace(/\s/g, "").split("),(");
      elements.forEach((expr) => {
        const [speciesStr, equivalentsStr] = expr.split(",");
        const equivalentsNum = +parseInt(equivalentsStr);
        if (isNaN(equivalentsNum))
          throw new TypeError(
            `invalid amount in record equivalents: [${equivalentsStr}]`
          );
        expressionList.push({
          species: speciesStr,
          equivalents: equivalentsNum,
        } as ExpressionEntry);
      });
      return expressionList;
    },
  },
});
</script>
