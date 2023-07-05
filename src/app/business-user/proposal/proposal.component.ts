import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppModuleConstants } from 'src/app/app-constants';
import { TemplateService } from 'src/app/client-user/template/template.service';
import { LoadingSpinnerService } from 'src/app/services/loading-spinner.service';
import { VendorMngServiceService } from 'src/app/vendor-mng-service.service';
import { Proposal } from './proposal.interface';
import { ProposalService } from './proposal.service';

@Component({
  selector: 'app-proposal',
  templateUrl: './proposal.component.html',
  styleUrls: ['./proposal.component.css'],
})
export class ProposalComponent implements OnInit {
  proposalDetails: Proposal[] = [];
  scorecards: any[] = [];
  sectorOptions: any[] = [
    { name: 'Sample Sector', code: 1 },
    { name: 'Sample Sector 1', code: 2 },
  ];
  selectedSector!: number;

  viewOptions: any[] = [{ name: 'Proposal', code: 1 }];
  selectedView!: number;
  userRole!: string;
  userName!: string;
  isLoading: boolean = false;
  allTemplateData: any[] = [];
  allScorecardData: any[] = [];

  constructor(
    private router: Router,
    private service: ProposalService,
    private templateService: TemplateService,
    private vendorService: VendorMngServiceService,
    private spinner: LoadingSpinnerService
  ) {}

  ngOnInit(): void {
    this.spinner.isLoading.subscribe((val) => {
      this.isLoading = val;
    });

    this.spinner.isLoading.next(true);

    this.userRole = sessionStorage.getItem(AppModuleConstants.ROLE)!;
    this.userName = sessionStorage.getItem(AppModuleConstants.USER)!;
    // to fetch all template details
    this.vendorService
      .getTemplateDetailsByUser(
        sessionStorage.getItem(AppModuleConstants.USERNAME)
      )
      .subscribe(
        (data: any) => {
          // this.proposalDetails = data;
          this.proposalDetails = this.transformScoredCardData1(data);

          // console.log('all templates', this.proposalDetails);
        },
        (error: HttpErrorResponse) => {}
      );

    // to fetch all score cards
    this.service.getscoreCards().subscribe(
      (data: any) => {
        this.scorecards = this.transformScoredCardData(data);
        console.log(this.scorecards);

        // this.transformScoredCardData(this.scorecards);
        // console.log('all scorecards', this.scorecards);
        this.spinner.isLoading.next(false);
      },
      (error: HttpErrorResponse) => {}
    );
  }

  target(event: any): HTMLInputElement {
    if (!(event.target instanceof HTMLInputElement)) {
      throw new Error('wrong target');
    }
    return event.target;
  }
  transformScoredCardData(inputData: any) {
    this.allScorecardData = [];

    console.log(inputData, 'inputData1');
    const categoryData = inputData.filter((data: any) => {
      console.log(data, 'data of single project');
      for (let i = 0; i < data.projectData.businessUser.length; i++) {
        console.log(data.projectData.businessUser[i]);

        if (
          data.projectData.businessUser[i] === sessionStorage.getItem('email')
        ) {
          this.allScorecardData.push(data);
        }
      }
    });
    return this.allScorecardData;
  }

  transformScoredCardData1(inputData: any) {
    this.allTemplateData = [];
    console.log(inputData, 'inputData1');
    const categoryData = inputData.filter((data: any) => {
      console.log(data, 'data of single project');
      for (let i = 0; i < data.project.businessUser.length; i++) {
        console.log(data.project.businessUser[i]);

        if (data.project.businessUser[i] === sessionStorage.getItem('email')) {
          this.allTemplateData.push(data);
        }
      }
    });
    return this.allTemplateData;
  }

  getStatusClass(status: any) {
    // console.log('status: ', status);
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

  navigateProposalDetails(templateId: any) {
    this.router.navigate(['/BusinessUser/proposal-list/' + templateId]);
  }

  navigateScorcardDetails(scoreCardId: any) {
    this.router.navigate(['/BusinessUser/scorecard/' + scoreCardId]);
  }
}
