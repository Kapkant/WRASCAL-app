import { number, object } from "@tsed/schema";

export class ConstantRequestModel {
  ligandId!: number;
  metalId!: number;

  constructor(ligandId: number, metalId: number) {
    this.ligandId = ligandId;
    this.metalId = metalId;
  }
}

export const ConstantRequestSchema = object({
  ligandId: number().description("Unique ID of the ligand").examples([414, 574]),
  metalId: number().description("Unique ID of the metal").examples([59, 134])
});

export const ConstantRequestExample = new ConstantRequestModel(414, 59);
