import {
  Component,
  OnInit,
  WritableSignal,
  inject,
  signal,
} from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';

import { State } from '../../../model/state.model';
import { statesCollection } from '../../../data/states.collection';
import { LandRecordsService } from '../../land-records.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-new-land-record',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButton,
    MatCardModule,
    MatDividerModule,
    MatSelectModule,
    MatIconModule,
    MatIconButton,
    ReactiveFormsModule,
    MatListModule,
    MatDatepickerModule,
    MatRadioModule,
    MatSlideToggleModule,
    RouterLink,
  ],
  templateUrl: './new-land-record.component.html',
  styleUrl: './new-land-record.component.scss',
})
export class NewLandRecordComponent implements OnInit {
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private landRecordsService = inject(LandRecordsService);
  states: WritableSignal<State[]> = signal(statesCollection);
  cities: WritableSignal<string[]> = signal([]);
  newLandRecordForm: FormGroup;
  id: number = -1;
  updateMode: boolean = false;
  viewMode: boolean = false;

  constructor(private fb: FormBuilder) {
    this.newLandRecordForm = fb.group({
      groupName: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      mouza: ['', Validators.required],
      block: ['', Validators.required],
      jlno: ['', Validators.required],
      buyerOwner: ['', Validators.required],
      sellers: this.fb.array([]),
      deedName: ['Main Deed', Validators.required],
      deedNo: ['', Validators.required],
      deedDate: ['', Validators.required],
      // scanCopy: this.fb.array([]),
      oldRsDag: ['', Validators.required],
      newLrDag: ['', Validators.required],
      oldKhatian: ['', Validators.required],
      newKhatian: ['', Validators.required],
      totalQty: ['', Validators.required],
      purQty: ['', Validators.required],
      mutedQty: ['', Validators.required],
      unMutedQty: ['', Validators.required],
      landStatus: ['Vested', Validators.required],
      // mutationFile: this.fb.array([]),
      conversionLandStus: ['Converted', Validators.required],
      // conversionFile: this.fb.array([]),
      deedLoc: ['', Validators.required],
      photoLoc: ['', Validators.required],
      govtRec: ['', Validators.required],
      locationAndPropRemarks: [''],
      khazanaStatus: ['', Validators.required],
      dueDate: ['', Validators.required],
      // documentFile: this.fb.array([]),
      // areaMapFile: this.fb.array([]),
      legalMatters: ['', Validators.required],
      ledueDate: ['', Validators.required],
      historyChain: ['', Validators.required],
      // hcdocumentFile: this.fb.array([]),
      mortgaged: [false, Validators.required],
      partlySold: [false, Validators.required],
    });
    this.onAddSeller();
  }

  get form() {
    return this.newLandRecordForm.controls;
  }

  get sellerForms() {
    return this.form['sellers'] as FormArray;
  }

  get sellerFormControls() {
    return this.sellerForms.controls as FormControl[];
  }

  onStatesChange(): void {
    const state = this.states().find(
      (data) => data.code === this.form['state'].value
    );
    if (state) this.cities.set(state.cities);
    else this.cities.set([]);
  }

  onAddSeller(): void {
    this.sellerForms.push(this.fb.control('', Validators.required));
  }

  onRemoveSeller(idx: number): void {
    if (this.sellerForms.length > 1) this.sellerForms.removeAt(idx);
  }

  onSubmit(): void {
    if (this.newLandRecordForm.valid) {
      const formData = new FormData();

      // Append form values to formData
      for (const key of Object.keys(this.newLandRecordForm.value)) {
        formData.append(key, this.newLandRecordForm.value[key]);
      }

      // Append file data to formData (adjust based on your file structure)
      for (const key of Object.keys(this.fileObj)) {
        for (const file of this.fileObj[key]) {
          formData.append(key, file); // Or use key + '[]' for multiple files
        }
      }

      // Call the service method to handle the multipart request
      if (this.updateMode) {
        this.landRecordsService.updateLandRecord(this.id, this.newLandRecordForm.value);
      } else {
        this.landRecordsService.newLandRecord(this.newLandRecordForm.value);
      }
    } else {
      // Handle invalid form
      console.log('Invalid form data');
    }
    console.log(this.newLandRecordForm);
    console.log(this.newLandRecordForm.value);
  }

  fileInfoArray: any = {
    scanCopyFile: [],
    mutationFile: [],
    conversionFile: [],
    documentFile: [],
    hcdocumentFile: [],
  };

  fileObj: any = {
    scanCopyFileRAW: [],
    mutationFileRAW: [],
    conversionFileRAW: [],
    documentFileRAW: [],
    hcdocumentFileRAW: [],
  };
  onClickUploadFiles(e: any, key: string): void {
    const onloadHandler = (e: any) => {
      this.fileObj[key + 'RAW'].push(e.target?.result as string);
    };

    if (e.target.files)
      for (let index = 0; index < e.target.files.length; index++) {
        const reader = new FileReader();
        reader.onload = onloadHandler;

        const file: File = e.target.files[index];

        this.fileInfoArray[key].push(file);
        reader.readAsArrayBuffer(file);
      }
    console.log(this.fileObj);
    console.log(this.fileInfoArray);
  }

  ngOnInit(): void {
    this.route.url.subscribe((data) => {
      this.updateMode = data[0].path == 'update';
      this.viewMode = data[0].path == 'view';
      if (this.updateMode || this.viewMode) {
        this.route.params.subscribe((data) => {
          this.id = data['id'];
          this.landRecordsService.getLandRecord(this.id).subscribe((data) => {
            this.newLandRecordForm.patchValue(data);
          });
        });
      }
      if (this.viewMode) {
        this.newLandRecordForm.disable();
      }
    });
  }
}
