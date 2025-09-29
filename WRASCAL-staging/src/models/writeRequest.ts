import { Element } from "./enums/element";
import { footnoteType } from "./enums/footnoteType";

export interface MetalData {
    central_element: string;
    formula_string: string;
    charge: number;
};

export interface Atom {
  element: Element;
  count: number;
};

export interface MolecularFormula {
  atoms: Atom[]
  charge: number
};

export interface form {
  protonation_level: number;
  charge: number
};

export interface LigandData {
  name: string;
  molecular_formula: MolecularFormula,
  form: form;
  charge: number;
  categories: string[]
};

export interface ConditionsData {
    constant_kind: string;
    temperature: number;
    temperature_varies: boolean;
    ionic_strength: number;
};

export interface ExpressionEntry {
    species: string;
    equivalents: number;
};

export interface EquilibriumExpressionData {
    expression_string: string;
    products: ExpressionEntry[];
    reactants: ExpressionEntry[];
};

export interface ConstantsData{
    value: number;
    significant_figures: number;
    user_id: string;
};

export interface UncertaintiesData {
    direction: string;
    magnitude: number;
};

export interface LiteratureData {
    litref: string;
    litcode: string;
};

export interface note {
  type: footnoteType;
  content: string;
}

export interface FootnotesData {
    notes: note[];
};

export interface writeRequest {
    metalInfo: MetalData;
    ligandInfo: LigandData;
    conditionsInfo: ConditionsData;
    equilibriumExpressionInfo: EquilibriumExpressionData;
    constantsInfo: ConstantsData;
    uncertaintiesInfo: UncertaintiesData;
    literaturesInfo: LiteratureData;
    footnotesInfo: FootnotesData;
};