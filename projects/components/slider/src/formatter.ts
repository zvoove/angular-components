export class DefaultFormatter {
  public to(value: number): string {
    return String(parseFloat(parseFloat(String(value)).toFixed(2)));
  }

  public from(value: string): number {
    return parseFloat(value);
  }
}
