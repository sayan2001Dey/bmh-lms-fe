import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'areaMapSafe',
  standalone: true
})
export class AreaMapSafePipe implements PipeTransform {
  private readonly sanitizer: DomSanitizer = inject(DomSanitizer);

  transform(url: any) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
