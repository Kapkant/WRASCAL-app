import { array, number, object, string } from "@tsed/schema";

export class AdvanceSearchRequestModel {
  ligands?: string[];
  metals?: string[];
  categories?: string[];
  ligandCharges?: number[];
  metalCharges?: number[];
  chemicals?: string[];
  limit?: number;

  constructor(
    ligands: string[],
    metals: string[] = [],
    categories: string[] = [],
    ligandCharges: number[] = [],
    metalCharges: number[] = [],
    chemicals: string[] = [],
    limit: number = 100
  ) {
    this.ligands = ligands;
    this.metals = metals;
    this.categories = categories;
    this.ligandCharges = ligandCharges;
    this.metalCharges = metalCharges;
    this.chemicals = chemicals;
    this.limit = limit;
  }
}

export const AdvanceSearchRequestSchema = object({
  ligands: array().items(string()).description(""),
  metals: array().items(string()).description(""),
  categories: array().items(string()).description(""),
  ligandCharges: array().items(number()).description(""),
  metalCharges: array().items(number()).description(""),
  chemicals: array().items(string()).description(""),
  limit: number().description("")
});

export const AdvanceSearchRequestExample = new AdvanceSearchRequestModel(["EDTA"], ["H"], [], [], [], [], 300);
