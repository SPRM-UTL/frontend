import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'findById',
  standalone: true
})
export class FindByIdPipe implements PipeTransform {
  transform(items: any[] | null, id: any, key: string = 'id'): any {
    if (!items || id === undefined || id === null) return null;
    return items.find(item => item[key] === id);
  }
}
