import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'numberFormat' })
export class NumberFormatPipe implements PipeTransform {
  transform(value: number): string {
    const units = ['', 'K', 'M', 'Md', 'T', 'Td'];
    // On prend la valeur absolue mais on ne pourra avoir que des valeurs positives
    let absValue = Math.abs(value);
    let i = 0;
    while (absValue >= 1e3 && i < units.length - 1) {
      absValue /= 1e3;
      i++;
    }
    const formattedValue = absValue.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return formattedValue + units[i];
  }
}
