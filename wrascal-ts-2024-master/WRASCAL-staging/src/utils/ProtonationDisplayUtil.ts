export default class ProtonationDisplayUtil{
  public static formatProtonationString(str: string): string{
    const [number] = str
      .replace('(', '')
      .replace(')', '')
      .split(',')
      .map(s => (+s))

    if(number === 0) return "L"

    return `H_{${number}}L`
  }
}
