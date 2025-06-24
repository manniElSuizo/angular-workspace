import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {
    ListKeyValue
} from "../../../../../shared/components/form-dialog/multiselect-autocomplete/multiselect-autocomplete.component";
import { SharedModule } from '@src/app/shared/shared.module';
import {
    ElSAutocompleteModule
} from "../../../../../shared/components/form-dialog/el-s-autocomplete/el-s-autocomplete.module";
import {TemplateFilterParametersService} from "../../../../template/services/template-filter-parameters.service";

@Component({
    selector: 'app-order-template',
    templateUrl: './order-template.component.html',
    styleUrl: './order-template.component.scss',
    standalone: true,
    imports: [
        SharedModule,
        ElSAutocompleteModule
    ]
})
export class OrderTemplateComponent implements OnChanges {
    @Input() data: string;
    @Input() customerTemplateName?: string;
    @Input() formGroup: FormGroup;
    @Input() action: string = 'view';
    @Output() templateNameChanged = new EventEmitter();
    templateNameResultList: ListKeyValue[] = [];

    constructor(private service: TemplateFilterParametersService) { }

    ngOnChanges(): void {
        this.init();
        this.fillForm();
    }

    init() {
        if (!this.formGroup) this.formGroup = new FormGroup({});

        this.formGroup.addControl('templateNameControl', new FormControl());
        if (this.action === 'create') return;
        this.templateNameControl.disable();
    }

    private fillForm(): void {

        this.templateNameControl.setValue(this.customerTemplateName
            ? `${this.customerTemplateName} (${this.data})`
            : this.data);
        if (this.action !== 'edit') this.templateNameControl.setValidators(Validators.required);

    }

    get templateNameControl(): FormControl {
        return this.formGroup?.get('templateNameControl') as FormControl;
    }

    fetchTemplateNames($event: string) {
        this.templateNameResultList = [];
        this.service.findTemplateNamesForCreation($event).subscribe({
            next: (result: ListKeyValue[]) => {
                console.log('result: ', result);
                this.templateNameResultList = result;
            }
        })
    }

    onSelectTemplateNameListItem($event: ListKeyValue) {
        this.templateNameChanged.emit($event.key);
    }
}
