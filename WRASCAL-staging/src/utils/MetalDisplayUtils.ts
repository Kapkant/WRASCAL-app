export default class MetalDisplayUtils{
  public static formatMetalFormulaString(str: string): string{
    const arr = str.split('/')
    const subNumberRegex = /\d+/g

    arr[0] = arr[0].replaceAll(subNumberRegex, match => `_${match}`)

    if(arr.length === 1) return arr[0]

    arr[1] = `^{${arr[1]}}`

    return arr.join('')
  }
}
