import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { VendorMngServiceService } from 'src/app/vendor-mng-service.service';
@Component({
  selector: 'app-newtemplate',
  templateUrl: './newtemplate.component.html',
  styleUrls: ['./newtemplate.component.css'],
})
export class NewtemplateComponent implements OnInit {
  items!: MenuItem[];
  activeItem!: MenuItem;
  constructor(private service: VendorMngServiceService) {}

  ngOnInit(): void {
    let draftId = window.location.pathname.split('/')[4];
    
    let templateDetailsRoute = ['/BusinessUser/create-template', 'templatedetails'];
    let templateCreationRoute = ['/BusinessUser/create-template', 'tableDemo'];
    if(draftId) {
      templateDetailsRoute.push(draftId);
      templateCreationRoute.push(draftId);
    }

    this.items = [
      {
        label: 'Template Details',
        routerLink: templateDetailsRoute,
        disabled:true
      },
      {
        label: 'Template Creation',
        routerLink: templateCreationRoute,
        disabled:true
      },
    ];
    this.activeItem = this.items[0];
  }
}
