export default class ElementDisplayUtils{
  public static formatElementCharge(charge: number){
    if(charge === 0) return ""
    if(charge === -1) return "-"
    if(charge === 1) return "+"

    const sign = charge < 0 ? "-" : "+"

    return `${charge}${sign}`
  }

  public static formatConstantKindLatex(kind: string){
    if(kind === "Equilibrium") return "\\Kappa"
    if(kind === "Enthalpy") return "\\Delta{H}"
    if(kind === "Entropy") return "\\Delta{S}"

    return kind
  }

  public static constantKindColor(kind: string){
    if(kind === "Equilibrium") return "blue"
    if(kind === "Enthalpy") return "orange"
    if(kind === "Entropy") return "red"

    return "gray"
  }

  public static formatExpressionToLatex(str: string){
    const numberRegex = /\d+/g
    const subRegex1 = /[A-Z]\d+/g
    const subRegex2 = /\((.*?)\)/g
    const fixRegex = /}_{/g
    const supRegex = /]\d+/g

    str = str.replace(supRegex, match => match.replace(numberRegex, m => `^{${m}}`));
    str = str.replace(subRegex1, match => match.replace(numberRegex, m => `_{${m}}`))
    str = str.replace(subRegex2, match => `_{${match}}`)
    str = str.replace(fixRegex, '') // fix for double subscript

    const parts = str.split('/')

    if(parts.length !== 2) return str

    return `\\frac{${parts[0]}}{${parts[1]}}`
  }
}
