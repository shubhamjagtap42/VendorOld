import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LoadingSpinnerService } from 'src/app/services/loading-spinner.service';
import { VendorService } from 'src/app/services/vendor.service';
import { lineOfBusiness, Vendor } from './model/vendor';

@Component({
  selector: 'app-vendor',
  templateUrl: './vendor.component.html',
  styleUrls: ['./vendor.component.css'],
  providers: [ConfirmationService, MessageService],
})
export class VendorComponent implements OnInit {
  addVendorDialogBox: boolean = false;
  editVendorDialog: boolean = false;
  checked: boolean = true;
  vendorForm!: FormGroup;
  allVendors: any[] = [];
  vendorData!: Vendor;

  allLineOfBusiness: lineOfBusiness[] = [];

  selectedFiles?: FileList;
  selectedLineOfBusiness!: string;
  selectedId: string[] = [];

  vendorNamePattern ='^([0-9a-zA-Z!@#$%^&*()_+ ]{3,50})$';
  spocNamePattern = '^([a-zA-Z ]{3,200})$';
  mobnumPattern = '^((\\+91-?)|0)?[6,7,8,9]{1}[0-9]{9}$';
  emailPattern = '^[A-Za-z0-9._%+-]+[@]{1}[A-Za-z0-9.-]+[.]{1}[A-Za-z]{2,4}$';

  vendorId!: string;
  editVendorForm: boolean = false;

  updateButton: boolean = false;
  save: boolean = false;
  update: boolean = false;
  isLoading: boolean = false;

  constructor(
    private vendorService: VendorService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private spinner: LoadingSpinnerService
  ) {}

  ngOnInit(): void {
    this.spinner.isLoading.subscribe((val) => {
      this.isLoading = val;
    });

    this.spinner.isLoading.next(true);

    this.allLineOfBusiness = [
      { businessName: 'Hospitality ' },
      { businessName: 'IT' },
      { businessName: 'Logistics ' },
      { businessName: 'Manufacturing' },
      { businessName: 'Real Estate' },
      { businessName: 'Retailing' },
    ];

    this.vendorForm = new FormGroup({
      vendorName: new FormControl('', [Validators.required,Validators.pattern(this.vendorNamePattern)]),
      spocName: new FormControl('', [Validators.required,Validators.pattern(this.spocNamePattern)]),
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(this.emailPattern),
      ]),
      contactNumber: new FormControl('', [
        Validators.required,
        Validators.pattern(this.mobnumPattern),
      ]),
      lineOfBusiness: new FormControl(''),
      // createdOn: new FormControl(''),
    });

    // to fetch all users
    this.vendorService.getVendors().subscribe(
      (data: any) => {
        this.allVendors = data;
        // console.log(this.allVendors);
        this.spinner.isLoading.next(false);
      },
      (error: HttpErrorResponse) => {
        alert('something went wrong');
        this.spinner.isLoading.next(false);
      }
    );
  }

  onClickAddVendor() {
    this.addVendorDialogBox = true;
    this.update = false;
    this.save = true;
  }

  handleChange(e: any) {
    this.checked = e.checked;
  }

  onClickSave() {
    // this.vendorForm.value.lineOfBusiness = this.selectedLineOfBusiness;

    // this.vendorService
    //   .addVendor(this.vendorForm.value)
    //   .subscribe((data: any) => {
    //    console.log(data);

    //     if (data.status === 200) {
    //       this.messageService.add({
    //         severity: 'success',
    //         summary: 'Successfull',
    //         detail: 'Vendor addedd successfully',
    //       });
    //       console.log(data,"response...!!");
    //       this.addVendorDialogBox = false;
    //       this.ngOnInit();
    //     } else if(data.status===404) {
    //       console.log(data,"response...!!");

    //     }
    //     else{
    //       alert("xyz")
    //     }
    //   });

    // this.vendorForm.value.lineOfBusiness = this.selectedLineOfBusiness;

    this.addVendorDialogBox = false;
    this.spinner.isLoading.next(true);

    this.vendorService.addVendor(this.vendorForm.value).subscribe(
      (data: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Successfull',
          detail: 'Vendor addedd successfully',
        });
        this.spinner.isLoading.next(false);

        this.vendorForm.reset();
        this.ngOnInit();
      },
      (error: HttpErrorResponse) => {
        if (error.status === 406) {
          this.messageService.add({
            severity: 'warn',
            summary: 'warning  ',
            detail: 'Vender already Exist...!!',
          });
          this.spinner.isLoading.next(false);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'error..!!',
            detail: 'Something went wrong, please try again',
          });
          this.spinner.isLoading.next(false);

          this.vendorForm.reset();
          this.ngOnInit();
        }
      }
    );
  }

  onClickUpdate() {
    // console.log(this.vendorData);

    this.confirmationService.confirm({
      message: 'Are you sure that you want to edit this Vendor?',
      accept: () => {
        this.addVendorDialogBox = false;
        this.spinner.isLoading.next(true);

        this.vendorService
          .updateVendor(this.vendorForm.value, this.vendorId)
          .subscribe(
            (data: any) => {
              // console.log('Vendor Updated' + data);
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Vendor updated Successfully',
              });

              this.spinner.isLoading.next(false);

              this.ngOnInit();
            },
            (error: HttpErrorResponse) => {
              if (error.status === 406) {
                this.messageService.add({
                  severity: 'warn',
                  summary: 'Warning',
                  detail: 'Vendor Already Exist...!!',
                });
                this.spinner.isLoading.next(false);
              } else {
                this.messageService.add({
                  severity: 'error',
                  summary: 'error...!!',
                  detail: 'Something went wrong, please try again',
                });
                this.spinner.isLoading.next(false);
              }
            }
          );
      },

      reject: () => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Cancelled',
          detail: 'vendor not updated',
        });
      },
    });
  }

  onClickCancle() {
    this.editVendorForm = false;
    this.addVendorDialogBox = false;
    this.editVendorDialog = false;
    this.updateButton = false;
    this.vendorForm.reset();
  }

  editVendor(id: string) {
    // this.updateButton=true;
    this.vendorService.getVendorById(id).subscribe(
      (data: any) => {
        this.vendorData = data;
        // this.save=false;
        // this.update=true;
        // this.vendorForm.get('vendorName')?.patchValue(this.vendorData.vendorName);
        // this.vendorForm.get('spocName')?.patchValue(this.vendorData.spocName);
        // this.vendorForm.get('email')?.patchValue(this.vendorData.email);
        // this.vendorForm.get('contactNumber')?.patchValue(this.vendorData.contactNumber);
        // this.vendorForm.get('lineOfBusiness')?.patchValue(this.vendorData.lineOfBusiness);

        this.vendorId = this.vendorData.vendorId;
        this.vendorForm
          .get('vendorName')
          ?.patchValue(this.vendorData.vendorName);
        this.vendorForm.get('spocName')?.patchValue(this.vendorData.spocName);
        this.vendorForm.get('email')?.patchValue(this.vendorData.email);
        this.vendorForm
          .get('contactNumber')
          ?.patchValue(this.vendorData.contactNumber);
        this.vendorForm
          .get('lineOfBusiness')
          ?.patchValue(this.vendorData.lineOfBusiness);

        this.editVendorForm = true;
        this.addVendorDialogBox = true;
        // console.log('vendor data', this.vendorData);
      },
      (error: HttpErrorResponse) => {
        alert(error);
      }
    );
  }

  deleteVendor(id: string) {
    //   console.log(id," id to be deleted");

    //   this.confirmationService.confirm({
    //     message: 'Are you sure that you want to Delete this Vendor?',
    //     accept: () => {
    //       this.vendorService.deleteVendor(id).subscribe(
    //         (data: any) => {
    //           this.messageService.add({
    //             severity: 'success',
    //             summary: 'Deleted',
    //             detail: 'Vendor deleted successfully',
    //           });
    //           this.editVendorDialog=false;
    //           this.ngOnInit();
    //         },
    //         (error: HttpErrorResponse) => {
    //           this.messageService.add({
    //             severity: 'danger',
    //             summary: 'Error',
    //             detail: 'Something went wrong while deleting vendor',
    //           });
    //         }
    //       );

    //       this.selectedId = [];
    //       this.ngOnInit();
    //     },
    //     reject: () => {
    //       this.messageService.add({
    //         severity: 'warn',
    //         summary: 'Cancelled',
    //         detail: 'Vendor not deleted',
    //       });
    //     },
    //   });

    this.confirmationService.confirm({
      message: 'Are you sure that you want to Delete this Vendor?',
      accept: () => {
        this.vendorService.deleteVendor(id).subscribe(
          (data: any) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successfully deleted',
              detail: 'Vendor deleted successfully',
            });
            this.addVendorDialogBox = false;
            this.ngOnInit();
          },
          (error: any) => {
            this.messageService.add({
              severity: 'success',
              summary: 'success',
              detail: 'Vendor deleted successfully',
            });
            // this.editVendorDialog = false;
            // this.ngOnInit();
          }
        );
      },
      reject: () => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Cancelled',
          detail: 'Vendor not deleted',
        });
      },
    });
  }
}
