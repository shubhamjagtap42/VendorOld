import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { ChartService } from 'src/Services/chart.service';

Chart.register(...registerables);

interface City {
  name: any;
  code: any;
}

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css'],
})
export class ChartComponent implements OnInit {
  basicData: any;
  data: City[] = [];
  selectedCity!: any;

  myarray: any;
  myarray1: any;
  selectedValue: any;
  venderNames: any = [];
  scores: any = [];

  constructor(private chartdata: ChartService) {}

  ngOnInit() {
    this.data = [
      { name: 'category', code: 'CT' },
      { name: 'subcategory', code: 'ST' },
      { name: 'subcategory2', code: 'WT' },
      { name: 'subcategory3', code: 'WT' },
    ];

    this.chartdata.getchart().subscribe((data) => {
      console.log(data);

      this.myarray = data;

      const finalScores = this.myarray.map((item: any) => {
        const categoryWeightage = item.categoryWeightage / 100;

        const subcategoryThreeWeightage = item.subcategoryThreeWeightage / 100;

        const subcategoryTwoWeightage = item.subcategoryTwoWeightage / 100;

        const subcategoryWeightage = item.subcategoryWeightage / 100;

        const finalScore =
          categoryWeightage *
          subcategoryThreeWeightage *
          subcategoryTwoWeightage *
          subcategoryWeightage;

        return {
          vendorId: item.vendorId,
          finalScore: finalScore,
          venderName: item.venderName,
        };
      });

      const vendorScores = finalScores.reduce((accumulator: any, item: any) => {
        const vendorId = item.vendorId;
        const finalScore = item.finalScore;
        const categoryName = item.categoryName;
        const venderName = item.venderNames;
        if (!accumulator[vendorId]) {
          accumulator[vendorId] = {
            vendorId,
            finalScore,
            categoryName,
            venderName,
          };
        } else {
          accumulator[vendorId].finalScore += finalScore;
        }
        return accumulator;
      }, {});

      const vendors = Object.values(vendorScores).sort(
        (a: any, b: any) => b.finalScore - a.finalScore
      );
      const vendorIds = vendors.map((item: any) => item.vendorId);
      // this.venderNames = vendors.map((item: any) => item.venderName);
      this.scores = vendors.map((item: any) => item.finalScore);

      for (let i = 0; i < vendorIds.length; i++) {
        this.chartdata.getVendorById(vendorIds[i]).subscribe((data: any) => {
          // console.log(data,"hiii ");

          const obj = data;
          // console.log(obj.vendorName);

          this.venderNames.push(obj.vendorName);
          // console.log(this.venderNames);

          this.myarray1 = data;

          this.basicData = {
            labels: this.venderNames,
            datasets: [
              {
                label: 'Final Scores',
                data: this.scores,  
                backgroundColor: [
                  '#3498db',
                  '#2ecc71',
                  '#f1c40f',
                  '#e67e22',
                  '#e74c3c',
                  '#9b59b6',
                  '#1abc9c',
                ],
                hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
              },
            ],
          };
        });

        
      }

      // const vendorObject = vendors.map((item: any) => item.vendorObject.venderName);

      // console.log(vendorObject,"this is object");
      
      
    });
  } 

  project()
  {
    
  }
 
}
