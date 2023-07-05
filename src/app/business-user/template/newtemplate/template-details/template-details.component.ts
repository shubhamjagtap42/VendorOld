import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AppModuleConstants } from 'src/app/app-constants';
import { ProjectService } from 'src/app/services/project.service';
import { VendorMngServiceService } from 'src/app/vendor-mng-service.service';
import { TemplateService } from '../../template.service';
import { TemplatebuilderService } from '../templatebuilder.service';
import { Template } from './model/template';

@Component({
  selector: 'app-template-details',
  templateUrl: './template-details.component.html',
  styleUrls: ['./template-details.component.css'],
  providers: [ConfirmationService, MessageService],
})
export class TemplateDetailsComponent implements OnInit {
  index: number = 0;
  templateForm!: FormGroup;

  projects: any;
  selectedProject: any;
  templateData!: Template;

  userRole!: string;
  userName!: string;

  draftTemplateData!: any;
  isDraftRedirect: boolean = false;

  spinner: boolean = false;

  
  namePattern ='^([0-9a-zA-Z!@#$%^&*()_+ ]{3,50})$';
  descriptionPattern = '^([0-9a-zA-Z!@#$%^&,;.:""*()_+ ]{10,500})$';
  constructor(
    private router: Router,
    private service: VendorMngServiceService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private projectService: ProjectService,
    private activatedRoute: ActivatedRoute,
    private draftService: TemplatebuilderService,
    private templateService: TemplateService
  ) {}

  ngOnInit(): void {
    this.spinner = true;
    this.userRole = sessionStorage.getItem(AppModuleConstants.ROLE)!;
    this.userName = sessionStorage.getItem(AppModuleConstants.USER)!;
// console.log(this.activatedRoute.snapshot.params," this.activatedRoute.snapshot.params['draftId']");

    if (this.activatedRoute.snapshot.params['draftId']) {
      // console.log('l;l;l;l;l;l;l;l');

      this.isDraftRedirect = true;
      this.draftService
        .getDraftById(this.activatedRoute.snapshot.params['draftId'])
        .subscribe(
          (data: any) => {
            this.draftTemplateData = data;
            console.log("draft data.../././.",data);
            
            this.service.draftTemplateDetails = data;
            this.selectedProject = this.draftTemplateData.projectDraft;
            // console.log(data,"draft data",this.selectedProject);
            this.templateForm = new FormGroup({
              name: new FormControl(
                this.draftTemplateData.templateDescription.name,
                Validators.required
              ),
              projectName: new FormControl(
                data.projectDraft
              ),
              description: new FormControl(
                this.draftTemplateData.templateDescription.description
              ),
              createdBy: new FormControl(sessionStorage.getItem('email')),
            });
            // console.log(this.templateForm.value, 'TEMPLATE FORM');

            this.spinner = true;
          },
          (error: HttpErrorResponse) => {
            alert(error);
          }
        );
    } else if (this.activatedRoute.snapshot.params['templateId']) {
      // console.log('template id....!!');
      this.isDraftRedirect = true;

      this.templateService
        .getTemplateById(this.activatedRoute.snapshot.params['templateId'])
        .subscribe(
          (data: any) => {
            console.log(data, ' template data');
            this.draftTemplateData = data;
            this.service.draftTemplateDetails = data;
            this.selectedProject = this.draftTemplateData.project;
            // console.log(data);
            this.templateForm = new FormGroup({
              name: new FormControl(
                this.draftTemplateData.templateDescription.name,
                Validators.required
              ),
              description: new FormControl(
                this.draftTemplateData.templateDescription.description
              ),
              projectName: new FormControl(
                this.draftTemplateData.project
              ),
              createdBy: new FormControl(sessionStorage.getItem('email')),
            });
            // console.log(this.templateForm.value, 'TEMPLATE FORM');

            this.spinner = true;
          },
          (error: HttpErrorResponse) => {
            alert('error...!!');
          }
        );
    } else {
      this.templateForm = new FormGroup({
        name: new FormControl('', [Validators.required,Validators.pattern(this.namePattern)]),
        description: new FormControl('',[Validators.required,Validators.pattern(this.descriptionPattern)]),
        projectName: new FormControl('',Validators.required),
        createdBy: new FormControl(sessionStorage.getItem('email')),
      
       
      });
    }
    // this.draftTemplateData = this.service.draftTemplateDetails;
    // this.isDraftRedirect = this.service.isDraftRedirect;

    // if(this.isDraftRedirect) {
    //     this.selectedProject = this.draftTemplateData.projectDraft;
    //     console.log('this.draftTemplateData: ', this.draftTemplateData)
    // }

    // this.selectedProject = this.service.draftTemplateDetails;

    this.projectService.getClients().subscribe(
      (data: any) => {
        this.projects = data;
        this.projects = this.transferProjectName1(data)
        // console.log(this.projects);
        for (let i = 0; i < this.projects.length; i++) {
          this.projects = this.projects.sort((a: any, b: any) => {
            if (a.projectName < b.projectName) return -1;
            if (a.projectName > b.projectName) return 1;
            return 0;
          });
         
          
        }
      },
      (error: HttpErrorResponse) => {
        alert('something went wrong');
      }
    );
  }
  allProjectName:any []=[];
  transferProjectName1(inputData: any){
    console.log(inputData, 'inputData1');
    const categoryData = inputData.filter((data: any) => {
      console.log(data, "data of single project");
      for (let i = 0; i < data.businessUser.length; i++) {
        console.log(data.businessUser[i]);

        if (data.businessUser[i] === sessionStorage.getItem('email')) {
          this.allProjectName.push(data)
        }
      }
    });
    return this.allProjectName;
  }

  openNext() {
    this.templateForm.value.createdOn = Date.now();

    this.service.templateDescriptionData = this.templateForm.value;
    this.service.project = this.selectedProject;
    this.redirectToTemplateCreation();
    // console.log('template data', this.templateForm.value);
    // console.log('template data', JSON.stringify(this.templateForm.value));
  }

  onSaveDraft() {
    this.templateForm.value.createdOn = Date.now();
    this.service.project = this.selectedProject;
    this.service.templateDescriptionData = this.templateForm.value;
    console.log('project data', this.selectedProject);
    this.redirectToTemplateCreation();
    console.log('template data', JSON.stringify(this.templateForm.value));
  }

  private redirectToTemplateCreation() {
    if (this.activatedRoute.snapshot.params['draftId']) {
      this.router.navigate([
        '/BusinessUser/create-template/tableDemo/' +
          this.activatedRoute.snapshot.params['draftId'],
      ]);
    } else if (this.activatedRoute.snapshot.params['templateId']) {
      this.router.navigate([
        '/BusinessUser/template-list/' +
          this.activatedRoute.snapshot.params['templateId'],
      ]);
    } else {
      this.router.navigate(['/BusinessUser/create-template/tableDemo']);
    }
  }

  onClickCancel() {
    this.router.navigate(['/BusinessUser/template-list']);
  }
}
