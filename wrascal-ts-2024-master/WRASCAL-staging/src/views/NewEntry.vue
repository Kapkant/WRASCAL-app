<template>
  <v-container class="pt-8">
    <h1>New Entry Submission</h1>
    <br />

    <!-- Each component corresponds to a single table in the database -->
    <!-- Current known bugs: Ligand Molecular Formula is not correctly writing to the parent variable -->

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
      @click="submitForm"
      >Submit</v-btn
    >
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
async function postJSON(data: writeRequest) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_ADDR}/rest/write/db`,
      {
        // change before deoloy
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    const result = await response.json();
    console.log("Success:", result);
  } catch (error) {
    console.error("Error:", error);
  }
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
    ligand_molecular_formala: "",
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
  }),
  methods: {
    submitForm() {
      console.log("ligand molecular formula", this.ligand_molecular_formala);

      // assembling the data into individual interfaces makes json structure easier to read and parse by the backend,
      // even though it's somewhat bloated here. Is there perhaps a better way to do this?

      const metalinfo: MetalData = {
        central_element: this.metal_central_element,
        formula_string: this.metal_formula_string,
        charge: parseInt(this.metal_charge),
      };

      const ligandinfo: LigandData = {
        name: this.ligand_name ?? "",
        // known bug - this.ligand_molecular_formula always reads blank, even though the write from the form itself is fine.
        // the variable is being cleared sometime between when submit is pressed and the value is read here.
        molecular_formula: this.parseMolecularFormula(
          this.ligand_molecular_formala
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
      postJSON(writeData);
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
