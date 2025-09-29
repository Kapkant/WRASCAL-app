import {MolecularFormula} from "@/models/MolecularFormula";

export class LigandSearchResultModel {
  name!: string;
  ligand_charge!: number;
  metal_charge!: string;
  central_element!: string;
  ligand_id!: number;
  metal_id!: number;
  form!: string;
  uncertainty_id!: number;
  formula_string!: string;
}

export class LigandAdvanceSearchResultModel extends LigandSearchResultModel {
  molecular_formula!: MolecularFormula;
  categories!: string[];
}

export class ProcessedLigandAdvanceSearchResultModel extends LigandSearchResultModel{
  molecular_formula!: string;
  categories!: string;

  public static process(raw: LigandAdvanceSearchResultModel): ProcessedLigandAdvanceSearchResultModel{
    const result = new ProcessedLigandAdvanceSearchResultModel();

    result.name = raw.name
    result.ligand_charge = raw.ligand_charge
    result.metal_charge = raw.metal_charge
    result.central_element = raw.central_element
    result.ligand_id = raw.ligand_id
    result.metal_id = raw.metal_id

    {
      let molecularFormula = ''

      for(const atom of raw.molecular_formula.atoms){
        molecularFormula += `${atom.element}<sub>${atom.count}</sub>`
      }

      if(raw.molecular_formula.charge !== 0){
        const symbol = raw.molecular_formula.charge < 0 ? '-' : '+'
        molecularFormula = `(${molecularFormula})<sup>${raw.molecular_formula.charge}${symbol}</sup>`
      }

      result.molecular_formula = molecularFormula;
    }

    result.categories = raw.categories?.join(',')

    return result
  }
}
