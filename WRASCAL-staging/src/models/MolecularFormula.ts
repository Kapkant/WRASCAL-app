export class MolecularFormula{
  atoms!: Atom[];
  charge!: number;
}

export class Atom{
  element!: string;
  count!: number;
}
