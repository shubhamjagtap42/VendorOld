import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  BusinessUser,
  Client,
  DocData,
  Industry,
  Manager,
  newProject,
  Partner,
  Project,
  Rfp,
} from './model/project';
import { ConfirmationService, MessageService, PrimeIcons } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from 'src/app/admin/user/model/user';
import { ProjectService } from 'src/app/services/project.service';
import { UserService } from 'src/app/services/user.service';
import { LoadingSpinnerService } from 'src/app/services/loading-spinner.service';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css'],
  providers: [ConfirmationService, MessageService, PrimeIcons],
})
export class ProjectComponent implements OnInit {
  newProjectDialog: boolean = false;

  @ViewChild('inputFile') myInputVariable: any;

  clientForm1!: FormGroup;
  addIndustryForm!: FormGroup;
  clientForm2!: FormGroup;
  clientForm3!: FormGroup;
  projectForm!: FormGroup;
  rfpForm!: FormGroup;

  clientInfo: newProject[] = [];
  projectInfo: Project[] = [];
  rfpInfo: Rfp[] = [];

  results: any[] = [];
  files: any;

  selectedIndustry!: string;
  selectedPartner!: string;
  selectedManager!: string;
  selectedBusinessUserName: string[] = [];

  clientData: any;
  projectData: any;
  rfpData: any;

  businessUsers: BusinessUser[] = [];
  managers: Manager[] = [];
  partners: Partner[] = [];

  industryNames: Industry[] = [];

  index!: number;
  newindex!: number;

  //edit functionalty
  newprojectData!: newProject;
  editProjectDialog: boolean = false;

  selectedFiles?: FileList;
  selectedFiles1?: FileList;
  currentFile?: File;
  currentFile1?: File;

  docData: DocData[] = [];
  currentRfp!: DocData;
  selectedId: string[] = [];

  openNext() {
    this.index = this.index === 2 ? 0 : this.index + 1;
  }
  openPrev() {
    this.index = this.index === 0 ? 2 : this.index - 1;
  }

  openNextUpdate() {
    this.newindex = this.newindex === 2 ? 0 : this.newindex + 1;
  }

  openPrevUpdate() {
    this.newindex = this.newindex === 0 ? 2 : this.newindex - 1;
  }

  editClientForm: boolean = false;
  clientFormId!: string;

  // projectCodePattern = "^[a-zA-Z0-9]{3,15}$";
  descriptionPattern = '^([0-9a-zA-Z!@#$%^&,.;:""*()_+ ]{10,500})$';
  emailPattern = '^[A-Za-z0-9._%+-]+[@]{1}[A-Za-z0-9.-]+[.]{1}[A-Za-z]{2,4}$';
  clientnamePattern = '^([0-9a-zA-Z!@#$%^&*()_+ ]{3,50})$';
  //  clientnamePattern = '/^(?=.*\d)(?=.*[!@#$%^&*()_+])[0-9a-zA-Z!@#$%^&*()_+]+$/';

  firstNamePattern = '^([a-zA-Z ]{3,200})$';
  lastNamePattern = '^([a-zA-Z ]{3,200})$';
  projectnamePattern = '^([0-9a-zA-Z!@#$%^&*()_+ ]{3,50})$';
  projectcodePattern = '^[a-zA-Z0-9 ]+$';
  rfpNamePattern = '^([0-9a-zA-Z!@#$%^&*()_+ ]{3,50})$';

  constructor(
    private fb: FormBuilder,
    private vendorService: ProjectService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private user: UserService,
    private spinner: LoadingSpinnerService
  ) {
    this.industryNames = [
      { industryName: 'Commerce' },
      { industryName: 'Construction' },
      { industryName: 'Financial' },
      { industryName: 'IT' },
      { industryName: 'Manufacturing' },
    ];

    this.businessUsers = [
      { name: 'Ananya' },
      { name: 'Sangam' },
      { name: 'Rahul' },
      { name: 'Ashutosh' },
    ];

    this.managers = [
      {
        name: 'Aniruddha Chakraborty',
        email: 'aniruddha.chakraborty@pwc.com',
        designation: 'Manager',
        location: 'MUMBAI',
        LOS: 'Advisory',
      },
      {
        name: 'Manjunathv Gowda',
        email: 'rameshwar.solange.tpr@pwc.com',
        designation: 'Manager',
        location: 'MUMBAI',
        LOS: 'Advisory',
      },
      {
        name: 'Pranjal Nolakha',
        email: 'eshan.bhatt.tpr@pwc.com',
        designation: 'Manager',
        location: 'MUMBAI',
        LOS: 'Advisory',
      },
      {
        name: 'Rohit Sharma',
        email: 'eshan.bhatt.tpr@pwc.com',
        designation: 'Manager',
        location: 'Kolkata',
        LOS: 'Advisory',
      },

      {
        name: 'Sachin Madhukar Khaire',
        email: 'sachin.madhukar.khaire.tpr@pwc.com',
        designation: 'Manager',
        location: 'Gurugram',
        LOS: 'Advisory',
      },

      {
        name: 'Samson Daniel',
        email: 'aniruddha.chakraborty@pwc.com',
        designation: 'Manager',
        location: 'MUMBAI',
        LOS: 'Advisory',
      },
      {
        name: 'Subhajit Saha',
        email: 'eshan.bhatt.tpr@pwc.com',
        designation: 'Manager',
        location: 'Kolkata',
        LOS: 'Advisory',
      },
      {
        name: 'Sounak Sarkar',
        email: 'aniruddha.chakraborty@pwc.com',
        designation: 'Manager',
        location: 'BENGALURU',
        LOS: 'Advisory',
      },
      {
        name: 'Shruti  Solanki',
        email: 'rameshwar.solange.tpr@pwc.com',
        designation: 'Manager',
        location: 'BENGALURU',
        LOS: 'Advisory',
      },
      {
        name: 'Vikas Batra',
        email: 'vikas.batra@pwc.com',
        designation: 'Manager',
        location: 'Gurugram',
        LOS: 'Advisory',
      },
    ];

    this.partners = [
      {
        name: 'Ashootosh Chand',
        email: 'rameshwar.solange.tpr@pwc.com',
        designation: 'Partner',
        location: 'BENGALURU',
        LOS: '',
      },
      {
        name: 'Mihir Gandhi',
        email: 'rameshwar.solange.tpr@pwc.com',
        designation: 'Partner',
        location: 'MUMBAI',
        LOS: '',
      },
      {
        name: 'Rameshwar Solange',
        email: 'rameshwar.solange.tpr@pwc.com',
        designation: 'Partner',
        location: 'MUMBAI',
        LOS: '',
      },
    ];

    this.skillsForm = this.fb.group({
      skills: this.fb.array([this.newSkill()]),
    });
  }

  form!: FormGroup;
  projectId: string = '';
  allUsers: User[] = [];
  isLoading: boolean = false;

  skillsForm!: FormGroup;

  onShow() {
    this.skills.push(this.newSkill());
  }

  ngOnInit(): void {
    this.spinner.isLoading.subscribe((val) => {
      this.isLoading = val;
    });

    this.spinner.isLoading.next(true);
    // this.skills.push(this.newSkill());

    this.addIndustryForm = new FormGroup({
      industry: new FormControl('', [Validators.required]),
    });

    this.clientForm1 = new FormGroup({
      clientName: new FormControl('', [
        Validators.required,
        Validators.pattern(this.clientnamePattern),
      ]),
      industry: new FormControl(''),
      businessOwner: new FormControl(''),

      projectName: new FormControl('', [
        Validators.required,
        Validators.pattern(this.projectnamePattern),
      ]),
      projectCode: new FormControl('', [
        Validators.required,
        Validators.pattern(this.projectcodePattern),
      ]),
      partnerName: new FormControl(''),
      managerName: new FormControl(''),
      businessUser: new FormControl(''),

      rfpName: new FormControl('', [
        Validators.required,
        Validators.pattern(this.rfpNamePattern),
      ]),
      file: new FormControl('', [Validators.required]),
      description: new FormControl('', [
        Validators.required,
        Validators.pattern(this.descriptionPattern),
      ]),
      date: new FormControl(''),
      createdOn: new FormControl(''),
    });
    // to fetch all clients info
    this.vendorService.getClients().subscribe(
      (data: any) => {
        this.clientInfo = data;
      },
      (error: HttpErrorResponse) => {
        alert(error);
      }
    );

    this.user.getuUser().subscribe(
      (data: any) => {
        this.allUsers = data;
        // console.log('All Users: ', this.allUsers);

        for (let i = 0; i < this.allUsers.length; i++) {
          this.allUsers = this.allUsers.sort((a: any, b: any) => {
            if (a.email < b.email) return -1;
            if (a.email > b.email) return 1;
            return 0;
          });
        }
      },
      (error: HttpErrorResponse) => {
        // console.log(error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error..!!',
          detail: 'Something went wrong, please try again..!!',
        });
      }
    );
    this.spinner.isLoading.next(false);
  }

  display() {
    // console.log(this.selectedPartner);
  }
  passengerForm = [
    {
      firstname: '',
      lastname: '',
      email: '',
    },
  ];
  addFormBOx: boolean = false;
  addForm() {
    this.addFormBOx = true;
    this.passengerForm.push({
      firstname: '',
      lastname: '',
      email: '',
    });
  }

  removeForm() {
    this.passengerForm.pop();
  }
  flagAdding: boolean = false;

  onClickAddIndustry() {
    this.flagAdding = true;
  }

  onClickSaveIndustry() {
    // console.log(this.addIndustryForm.value, 'Industry / Sector.....');
  }
  onClickCancle1() {
    this.addIndustryForm.reset();
  }
  onClickCancel() {
    this.businessOwnerId = [];
    this.editClientForm = false;

    this.newProjectDialog = false;
    this.editProjectDialog = false;
    this.clientForm1.reset();
    this.skillsForm.reset();
    this.passengerForm = [
      {
        firstname: '',
        lastname: '',
        email: '',
      },
    ];

    // to make selectedFiles1 variable as null
    this.myInputVariable.nativeElement.value = '';
    this.files = { ...this.selectedFiles1?.item(0) };
    this.files = null;

    // to make selectedFiles variable as null
    this.myInputVariable.nativeElement.value = '';
    this.files = { ...this.selectedFiles?.item(0) };
    this.files = null;

    this.skillsForm.value.skills.controls = null;

    for (let i = 0; i < this.skillsForm.value.skills.length; i++) {
      this.removeSkill((i = 0));
    }

    this.ngOnInit();
  }

  selectFile(event: any): void {
    this.selectedFiles = event.target.files;
    // event.target.value = null;
  }
  selectFile1(event: any): void {
    this.selectedFiles1 = event.target.files;
  }

  Download(data: any) {
    this.vendorService.getDocDataBYProjectId(data.projectId).subscribe(
      (data1: any) => {
        // console.log(data1, ' doc data by peoject id');
        let id = data1.docKey;
        if (data1.docKey) {
          this.vendorService.downloadFile(data1.docKey).subscribe(
            (x: any) => {
              // console.log(x,"..!!");

              var newBlob = new Blob([x], { type: 'application/pdf' });

              const data1 = window.URL.createObjectURL(newBlob);

              var link = document.createElement('a');
              link.href = data1;
              link.download = id;
              // this is necessary as link.click() does not work on the latest firefox
              link.dispatchEvent(
                new MouseEvent('click', {
                  bubbles: true,
                  cancelable: true,
                  view: window,
                })
              );
            },
            (error: HttpErrorResponse) => {
              alert('unable to download file');
            }
          );
        } else {
          alert('Document not found...!!');
        }
      },
      (error: HttpErrorResponse) => {
        alert('Unable to download document..!!');
      }
    );
  }

  onClickDownload(projectid: string, version: string) {
    this.vendorService.downloadDocByVersion(projectid, version).subscribe(
      (event: Blob) => {
        var newBlob = new Blob([event], { type: 'application/pdf' });

        const data = window.URL.createObjectURL(newBlob);

        var link = document.createElement('a');
        link.href = data;
        link.download = projectid;
        // this is necessary as link.click() does not work on the latest firefox
        link.dispatchEvent(
          new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
          })
        );
      },
      (error: HttpErrorResponse) => {
        // console.log('error');
      }
    );
  }

  document!: Document;
  onUpload(projectData: any, file: any) {
    this.spinner.isLoading.next(true);

    this.vendorService.uploadDoc(file).subscribe(
      (data: any) => {
        console.log(data, 'file to be upload', projectData);
        if (data.type != 0) {
          this.document1(data, projectData);
        }
      },
      (error: HttpErrorResponse) => {
        alert('something went wrong while uploading document..11');
      }
    );
  }

  document1(data: any, projectData: any) {
    let document = {
      docName: projectData.rfpName,
      docType: 'RFP',
      docKey: data.body,
      projectId: projectData.projectId,
      version: '1.0',
    };
    this.vendorService.document(document).subscribe(
      (data: any) => {
        this.spinner.isLoading.next(false);
      },
      (error: HttpErrorResponse) => {
        alert('something went wrong while uploading document');
      }
    );
  }

  updateDocument1(data: any, projectData: any) {
    this.vendorService.getDocDataBYProjectId(projectData.projectId).subscribe(
      (data1: any) => {
        let document = {
          docName: projectData.rfpName,
          docType: 'RFP',
          docKey: data.body,
          projectId: projectData.projectId,
          version: '1.0',
        };
        // console.log(document, 'Narendra');

        this.vendorService
          .updateDocument(data1.docId, document)
          .subscribe((data: any) => {
            // console.log(data, 'Naru More');
          });
      },
      (error: HttpErrorResponse) => {
        alert('something went wrong while uploading document');
      }
    );

    let document = {
      docName: projectData.rfpName,
      docType: 'RFP',
      docKey: data.body,
      projectId: projectData.projectId,
      version: '1.0',
    };
    // console.log(document, 'Narendra');

    this.vendorService.document(document).subscribe(
      (data: any) => {
        // console.log(data, 'Naru More');
      },
      (error: HttpErrorResponse) => {
        alert('something went wrong while uploading document');
      }
    );
  }

  onEditUpload(projectData: any, file: any) {
    this.spinner.isLoading.next(true);

    this.currentFile1 = file;
    this.vendorService.uploadDoc(file).subscribe(
      (data: any) => {
        this.spinner.isLoading.next(false);

        // this.ngOnInit();
        if (data.type != 0) {
          this.updateDocument1(data, projectData);
        }
      },
      (error: HttpErrorResponse) => {
        // console.log('error');
        this.spinner.isLoading.next(false);
      }
    );
  }

  onClickAddProject() {
    this.index = 0;
    this.newProjectDialog = true;

    for (let i = 0; i < this.skillsForm.value.skills.length; i++) {
      this.removeSkill((i = 0));
    }
    //  this.ngOnInit();
  }

  //           <!-- save button  for client-->

  projectData1: any;
  onClickSaveClient() {
    this.newProjectDialog = false;
    this.spinner.isLoading.next(true);

    if (this.selectedFiles) {
      const file: File | null = this.selectedFiles.item(0);

      if (file) {
        this.clientForm1.value.document = file.name;

        this.clientForm1.value.businessOwner = this.skillsForm.value.skills;

        this.vendorService.addClient(this.clientForm1.value).subscribe(
          (data: any) => {
            this.projectId = data.projectid;
            this.projectData1 = JSON.parse(data);
            this.newProjectDialog = false;

            this.messageService.add({
              severity: 'success',
              summary: 'Successfull',
              detail: 'client data saved successfully',
            });
            this.spinner.isLoading.next(false);
            this.ngOnInit();
            this.onUpload(this.projectData1, file);
            this.clientForm1.reset();

            // to make selectedFiles variable as null
            this.myInputVariable.nativeElement.value = '';
            this.files = { ...this.selectedFiles?.item(0) };
            this.files = null;

            for (let i = 0; i < this.skillsForm.value.skills.length; i++) {
              this.removeSkill((i = 0));
            }
          },
          (error: HttpErrorResponse) => {
            if (error.status === 406) {
              this.messageService.add({
                severity: 'warn',
                summary: 'Warning...!!',
                detail:
                  'Duplicate project name , project code or business owner email-Id no allowed',
              });
              this.spinner.isLoading.next(false);
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error...!!',
                detail: 'Error while adding user',
              });
              this.spinner.isLoading.next(false);
            }
            // console.log(JSON.stringify(this.clientForm1.value), ' akshay');
            this.clientForm1.reset();
            this.newProjectDialog = false;
            this.ngOnInit();
          }
        );
      }
    }
  }

  passengerData: any[] = [];

  editProject(data: any) {
    this.vendorService.getProjectById(data.projectId).subscribe(
      (data: any) => {
        this.newprojectData = data;

        this.index = 0;
        this.newprojectData = data;

        this.clientForm1
          .get('clientName')
          ?.patchValue(this.newprojectData.clientName);

        this.clientForm1
          .get('industry')
          ?.patchValue(this.newprojectData.industry);

        this.clientFormId = this.newprojectData.projectId;

        this.clientForm1
          .get('projectName')
          ?.patchValue(this.newprojectData.projectName);

        this.clientForm1
          .get('projectCode')
          ?.patchValue(this.newprojectData.projectCode);

        this.clientForm1
          .get('partnerName')
          ?.patchValue(this.newprojectData.partnerName);
        this.clientForm1
          .get('managerName')
          ?.patchValue(this.newprojectData.managerName);
        this.clientForm1
          .get('businessUser')
          ?.patchValue(this.newprojectData.businessUser);
        this.clientForm1
          .get('rfpName')
          ?.patchValue(this.newprojectData.rfpName);
        this.clientForm1
          .get('description')
          ?.patchValue(this.newprojectData.description);

        this.clientForm1
          .get('businessOwner')
          ?.patchValue(this.newprojectData.businessOwner);
        this.clientForm1
          .get('createdOn')
          ?.patchValue(this.newprojectData.createdOn);

        // console.log(JSON.stringify(this.clientForm1.value));

        // console.log(this.clientForm1.value,".//././././././.");

        let controls: any = new FormArray([]);
        this.newprojectData.businessOwner.forEach(
          (projectOwnerControl: any, index: number) => {
            controls.push(
              new FormGroup({
                firstname: new FormControl(projectOwnerControl.firstname),
                lastname: new FormControl(projectOwnerControl.lastname),
                email: new FormControl(projectOwnerControl.email),
                id: new FormControl(projectOwnerControl.id),
              })
            );
          }
        );

        this.skillsForm = new FormGroup({ skills: controls });
        // console.log(this.skillsForm, '....');

        // console.log(this.clientForm1.value, ' editable form');

        this.editClientForm = true;
        this.newProjectDialog = true;
      },
      (error: HttpErrorResponse) => {
        alert(error);
      }
    );
  }

  onClickUpdateClient() {
    this.clientForm1.value.businessOwner = this.skillsForm.value.skills;
    this.confirmationService.confirm({
      message: 'Are you sure that you want to edit this Project?',
      accept: () => {
        this.newProjectDialog = false;
        this.spinner.isLoading.next(true);

        this.vendorService
          .updateProject(this.clientForm1.value, this.clientFormId)
          .subscribe(
            (data: any) => {
              console.log('Project Details Updated' + data);
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Project updated Successfully',
              });
              this.spinner.isLoading.next(false);

              if (this.selectedFiles1) {
                const file: File | null = this.selectedFiles1.item(0);

                if (file) {
                  this.onEditUpload(data, file);
                }
              }

              this.deleteBusinessOwner();

              this.ngOnInit();

              // to make selectedFiles1 variable as null
              this.myInputVariable.nativeElement.value = '';
              this.files = { ...this.selectedFiles1?.item(0) };
              this.files = null;
            },
            (error: HttpErrorResponse) => {
              if (error.status === 406) {
                this.messageService.add({
                  severity: 'info',
                  summary: 'error..!!',
                  detail: 'Duplicate values not allowed',
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
          detail: 'Project not updated',
        });
      },
    });
  }

  deleteBusinessOwner() {
    for (let i = 0; i < this.businessOwnerId.length; i++) {
      this.vendorService.deleteBusinessOwner(this.businessOwnerId[i]).subscribe(
        (data: any) => {
          // console.log(this.businessOwnerId[i], ' Deleted...........!!!');
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Business User deleted successfully..!! ',
          });
        },
        (error: HttpErrorResponse) => {
          // console.log('error...........!!!');
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Something went wrong , please try again...!!',
          });
        }
      );
    }
  }

  deleteProject() {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to Delete this Project?',
      accept: () => {
        for (let id of this.selectedId) {
          this.vendorService.deleteProject(id).subscribe(
            (data: any) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Deleted',
                detail: 'Project deleted successfully',
              });
            },
            (error: HttpErrorResponse) => {
              this.messageService.add({
                severity: 'danger',
                summary: 'Error',
                detail: 'Something went wrong while deliting vendor',
              });
            }
          );
        }
        this.selectedId = [];
        this.ngOnInit();
      },
      reject: () => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Cancelled',
          detail: 'Project not deleted',
        });
      },
    });
  }

  SaveDraftProjectForm1() {
    this.messageService.add({
      severity: 'info',
      summary: 'Saved',
      detail: 'Saved as Draft ',
    });
    // console.log(this.clientForm1.value);
  }
  SaveDraftProjectForm2() {
    this.messageService.add({
      severity: 'info',
      summary: 'Saved',
      detail: 'Saved as Draft ',
    });
    // console.log(this.clientForm1.value);
  }
  SaveDraftProjectForm3() {
    this.messageService.add({
      severity: 'info',
      summary: 'Saved',
      detail: 'Saved as Draft ',
    });
    // console.log(this.clientForm1.value);
  }

  // trial

  get skills(): FormArray {
    return this.skillsForm.get('skills') as FormArray;
  }

  newSkill(): FormGroup {
    return this.fb.group({
      firstname: new FormControl('', [
        Validators.required,
        Validators.pattern(this.firstNamePattern),
      ]),
      lastname: new FormControl('', [
        Validators.required,
        Validators.pattern(this.lastNamePattern),
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(this.emailPattern),
      ]),
      id: new FormControl(''),
    });
  }

  addSkills() {
    this.skills.push(this.newSkill());
  }

  businessOwnerId: any[] = [];
  removeSkill(i: any) {
    // console.log(i, '././././');

    this.businessOwnerId.push(i);
    this.skills.removeAt(i);
    // console.log(this.businessOwnerId, 'id......!');
  }

  removeSkill1(i: any) {
    // console.log(i, 'data to be removed');

    this.skills.removeAt(i);
    // console.log(i);
  }
}
