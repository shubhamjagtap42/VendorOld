import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ScorecardService } from './scorecard.service';

@Component({
  selector: 'app-scorecard',
  templateUrl: './scorecard.component.html',
  styleUrls: ['./scorecard.component.css'],
})
export class ScorecardComponent implements OnInit {
  scorecards: any;
  allData: any[] = [];
  constructor(private service: ScorecardService, private router: Router) {}

  ngOnInit(): void {
    this.service.getScorecards().subscribe(
      (data: any) => {
        this.scorecards = data;
        // console.log(this.scorecards, ' all scorecards');
        this.scorecards = this.transformTempalteClientuserData(data);
        console.log(this.scorecards);
      },
      (error: any) => {
        alert('something went wrong while getting all scorecards');
      }
    );
  }
 
  transformTempalteClientuserData(inputData: any) {
    this.allData = [];
    const categoryData = inputData.filter((data: any) => {
      console.log(data, 'data of single project');
      for (let i = 0; i < data.projectData.businessUser.length; i++) {
        console.log(data.projectData.businessUser[i]);

        if (
          data.projectData.businessUser[i] === sessionStorage.getItem('email')
        ) {
          this.allData.push(data);
        }
      }
    });
    return this.allData;
    // return categoryData4;
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

  target(event: any): HTMLInputElement {
    if (!(event.target instanceof HTMLInputElement)) {
      throw new Error('wrong target');
    }
    return event.target;
  }

  navigateTemplateDetails(scorecardId: any) {
    // console.log('scorecardId: ', scorecardId);
    this.router.navigate(['/ClientUser/scorcard/' + scorecardId]);
  }
}
