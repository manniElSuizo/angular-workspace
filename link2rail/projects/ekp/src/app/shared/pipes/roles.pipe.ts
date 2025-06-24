import { Pipe, PipeTransform } from '@angular/core';
import { Role } from '@src/app/user-management/model/role.model';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'roles'
})
export class RolesPipe implements PipeTransform {
  constructor(
    private translate: TranslateService
    ) {}

  transform(value: Role[] | null | undefined, ...args: unknown[]): string {
    if(!value) return "";
    let roleNames: string[] = [];
    value.forEach(r =>
      {
        roleNames.push(this.translate.instant('Shared.' + r.abbreviation))
      });
    return roleNames.join(", ");
  }

}
