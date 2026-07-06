import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'countDevices',
  standalone: true
})
export class CountDevicesPipe implements PipeTransform {
  transform(habitaciones: any[] | undefined | null): number {
    if (!habitaciones || !Array.isArray(habitaciones)) return 0;
    return habitaciones.reduce((acc, h) => acc + (h.dispositivos?.length || 0), 0);
  }
}
