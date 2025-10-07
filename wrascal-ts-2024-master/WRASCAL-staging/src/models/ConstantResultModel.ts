import {MolecularFormula} from "@/models/MolecularFormula";
import {ExpressionEntry} from "@/models/ExpressionEntry";
import {Note} from "@/models/Note";

export class ConstantResultModelBase {
  name?: string;
  ligand_charge?: number;
  metal_charge?: number;
  value?: number;
  significant_figures?: number;
  categories?: string[];
  central_element?: string;
  constant_kind?: string;
  temperature?: number;
  temperature_varies?: boolean;
  ionic_strength?: number;
  expression_string?: string;
  direction?: string;
  magnitude?: number;
  protonation?: number;
}

export class ConstantResultModel extends ConstantResultModelBase {
  molecular_formula?: MolecularFormula;
  products?: ExpressionEntry[];
  reactants?: ExpressionEntry[];
  notes?: Note[];
  legacy_identifier?: string;
}
