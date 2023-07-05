import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AppModuleConstants } from 'src/app/app-constants';
import { LoadingSpinnerService } from 'src/app/services/loading-spinner.service';
import { VendorMngServiceService } from 'src/app/vendor-mng-service.service';
import {
  DraftTemplate,
  Template,
} from './newtemplate/template-details/model/template';
import { TemplateService } from './template.service';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css'],
  providers: [MessageService, ConfirmationService],
})
export class TemplateComponent implements OnInit {
  templateDetails1: Template[] = [];
  templateDetails: Template[] = [];

  userRole!: string;
  userName!: string;
  draftTemplateData!: DraftTemplate[];
  isLoading: boolean = false;

  selectedDrafts: any[] = [];

  tab2: boolean = false;
  tab1: boolean = true;

  constructor(
    private router: Router,
    private service: VendorMngServiceService,
    private templateService: TemplateService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private spinner: LoadingSpinnerService
  ) { }

  ngOnInit(): void {
    this.spinner.isLoading.subscribe((val) => {
      this.isLoading = val;
    });

    this.spinner.isLoading.next(true);

    this.userRole = sessionStorage.getItem(AppModuleConstants.ROLE)!;
    this.userName = sessionStorage.getItem(AppModuleConstants.USERNAME)!;
    this.service.draftTemplateDetails = null;
    // to fetch all template details
    // this.service.pageProgressBar = true;
    this.service.getTemplateDetailsByUser(sessionStorage.getItem(AppModuleConstants.USERNAME)).subscribe(
      (data: any) => {
        console.log('hello1', data);

        // this.templateDetails = data;
        this.spinner.isLoading.next(false);
        this.templateDetails= this.transformTempalteData(data);
        this.templateDetails1 = this.transformTempalteData1(data);
        console.log("this.templateDetails1: ",this.templateDetails1);


        // this.pageProgressBar = false;
      },
      (error: HttpErrorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error..!!',
          detail: "Something went wrong while fetching templates' ",
        });
      }
    );

    // // to fetch all template details
    // this.service.getTemplateDetails().subscribe(
    //   (data: any) => {
    //     console.log('hello');

    //     this.templateDetails = data;
    //     console.log('hello', this.templateDetails);
    //   },
    //   (error: HttpErrorResponse) => {
    //     console.log(error, ' inside error response');
    //   }
    // );

    this.getDraftTemplateData();
  }
  allData: any[] = [];
  createdByAllData: any[] = [];
  allDraftData: any[] = [];

  transformTempalteData(inputData: any) {
    this.allData=[];
    // console.log(inputData, 'inputData1');
    const categoryData = inputData.filter((data: any) => {
      // console.log(data, "data of single project");
      for (let i = 0; i < data.project.businessUser.length; i++) {
        console.log(data.project.businessUser[i]);

        if (data.project.businessUser[i] === sessionStorage.getItem('email')) {
          this.allData.push(data)
        }
      }
    });
    return this.allData;
  }

  transformTempalteData1(inputData: any) {
    this.createdByAllData=[];
    // console.log(inputData, 'inputData1');
    // const categoryData = inputData.filter((data: any) => {
      // console.log(data, "data of single project");
      for (let i = 0; i < inputData.length; i++) {
        // console.log(data," for created by");

        if (inputData[i].templateDescription.createdBy === sessionStorage.getItem('email')) {
          this.createdByAllData.push(inputData[i])
        }
      // }
    };
    return this.createdByAllData;
  }












  getDraftTemplateData(): void {
    this.templateService.getDraftTemplateData().subscribe((data: any) => {
      this.draftTemplateData = data;
      console.log('this.draftTemplateData: ', this.draftTemplateData);
      this.draftTemplateData = this.transformTempalteDraftData(data);
      this.spinner.isLoading.next(false);
    });
  }
  transformTempalteDraftData(inputData: any) {
    this.allDraftData=[];
    console.log(inputData, 'inputData1');
    const categoryData = inputData.filter((data: any) => {
      console.log(data, "data of single project");
      for (let i = 0; i < data.projectDraft.businessUser.length; i++) {
        console.log(data.project.businessUser[i]);

        if (data.projectDraft.businessUser[i] === sessionStorage.getItem('email')) {
          this.allDraftData.push(data)
        }
      }
    });
    return this.allDraftData;
  }

  onClickAddTemplate() {
    this.router.navigate(['/BusinessUser/create-template/templatedetails']);
  }

  target(event: any): HTMLInputElement {
    if (!(event.target instanceof HTMLInputElement)) {
      throw new Error('wrong target');
    }
    return event.target;
  }

  getStatusClass(status: any) {
    console.log('status: ', status);
    switch (status) {
      case 'Pending':
        return 'status-badge status-badge-pending';
        break;
      case 'In Progress':
        return 'status-badge status-badge-progress';
      case 'Done':
        return 'status-badge status-badge-success';
    }
    return '';
  }

  navigateTemplateDetails(templateId: any) {
    this.service.templateDetails = this.templateDetails.filter((data: any) => {
      return data.templateId == templateId;
    });
    console.log('TD: ', this.service.templateDetails);
    console.log('this.service.templateDetails: ', this.service.templateDetails);
    // this.router.navigate(['/BusinessUser/template-list/' + templateId]);
    this.router.navigate([
      '/BusinessUser/create-template/templatedetails/template/' + templateId,
    ]);
  }

  navigateCreateTemplate(draftId: any) {
    // this.service.draftTemplateDetails = this.draftTemplateData.filter(
    //   (data: any) => {
    //     return data.draftId == draftId;
    //   }
    // )[0];

    // this.service.isDraftRedirect = true;

    this.router.navigate([
      '/BusinessUser/create-template/templatedetails/' + draftId,
    ]);
  }

  onClickTab(tab: any) {
    console.log(tab, ' tab');

    if (tab === '1') {
      console.log(tab);

      this.tab1 = true;
    } else if (tab === '2') {
      this.tab2 = true;
    }
  }
  deleteSelectedDrafts(id: string) {
    console.log(this.selectedDrafts, 'selected drafts');

    console.log('deleting draft:', id);
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected products?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.templateService.deleteSelectedDrafts(id).subscribe(
          (data: any) => {
            console.log('deleted');
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Draft Deleted',
              life: 3000,
            });
            this.ngOnInit();
          },
          (error: HttpErrorResponse) => {
            alert(error);
          }
        );
      },
      reject: () => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Cancelled',
          detail: 'Draft not updated',
        });
      },
    });
  }
}
