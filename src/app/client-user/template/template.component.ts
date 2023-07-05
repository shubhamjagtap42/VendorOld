import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VendorMngServiceService } from 'src/app/vendor-mng-service.service';
import { Template } from './newtemplate/template-details/model/template';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css'],
})
export class TemplateComponent implements OnInit {
  templateDetails: Template[] = [];
  allData: any[] = [];

  constructor(
    private router: Router,
    private service: VendorMngServiceService
  ) {}

  ngOnInit(): void {
    this.service.getTemplateDetails().subscribe(
      (data: any) => {
        this.templateDetails = data;
       
        this.templateDetails =this.transformTempalteClientuserData(data);
        console.log( this.templateDetails);
      },
      (error: HttpErrorResponse) => {
        window.location.reload();

      }
    );
  }


  transformTempalteClientuserData(inputData: any) {
    this.allData=[];
    console.log(inputData, 'inputData1');
    const categoryData = inputData.filter((data: any) => {
      console.log(data, "data of single project");
      for (let i = 0; i < data.project.businessUser.length; i++) {
        console.log(data.project.businessUser[i]);

        if (data.project.businessUser[i] === sessionStorage.getItem('email')) {
          this.allData.push(data)
        }
      }
    });
    return this.allData;
  }






  onClickAddTemplate() {
    this.router.navigate(['/ClientUser/create-template']);
  }

  target(event: any): HTMLInputElement {
    if (!(event.target instanceof HTMLInputElement)) {
      throw new Error('wrong target');
    }
    return event.target;
  }

  getStatusClass(status: any) {
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
    this.router.navigate(['/ClientUser/template-list/' + templateId]);
  }
}
