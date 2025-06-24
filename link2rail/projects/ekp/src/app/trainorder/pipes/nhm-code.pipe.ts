import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'nhmPipe',
})
export class NhmCodePipe implements PipeTransform {
    transform(value: string[]|null, ...args: unknown[]): string {
        if(!value) return '';

        const strArr: string[] = [];

        value.forEach(el => {
            strArr.push(el.padEnd(8,'0'));
        });

        // const arr4Sort = [...strArr];
        strArr.sort((a, b) => Number(a) - Number(b));
        
        if (args[0] === 'full' || strArr.length <= 3) {
            return strArr.join(', ');
        }
        
        return `${strArr[0]}, ${strArr[1]}, ${strArr[2]}, ...`;
    }
}