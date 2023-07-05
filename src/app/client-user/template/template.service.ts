import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {

  constructor(private http: HttpClient) { }

  getSelectedTemplateData(templateId: number){
    return this.http.get(`${environment.url}/template/`+templateId);
  }

  getSelectedScoreCardById(scoreCardId: number) {
    return this.http.get(`${environment.url}/score_cards/` + scoreCardId)
  }

  getCategoriesData(){
    return this.http.get(`${environment.url}/master`);
  }
  addTemplateData(data: any) {
    return this.http.post(`${environment.url}/template`, data);
  }

  updateTemplateData(templateId: number, data: any) {
    return this.http.put(`${environment.url}/template/`+templateId+'/templateData', data);
  }

  transformCategoryData(inputData: any) {
    const categoryData = inputData.filter((data: any) => {
      return (data.type).toLowerCase() == 'category';
    }).map((data: any) => {
      return { name: data.value }
    });

    const subCategoryData = inputData.filter((data: any) => {
      return (data.type).toLowerCase() == 'subcategory';
    }).map((data: any) => {
      return { name: data.value }
    });

    const parameterData = inputData.filter((data: any) => {
      return (data.type).toLowerCase() == 'parameter';
    }).map((data: any) => {
      return { name: data.value }
    });

    return [{
      "name": "Category",
      "id": "c1",
      "states": categoryData
    },
    {
      "name": "Subcategory",
      "id": "sc1",
      "states": subCategoryData
    },
    {
      "name": "Parameter",
      "id": "p1",
      "states": parameterData
    }];
  }
}
