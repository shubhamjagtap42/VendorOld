import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './admin.component';
import { LibraryComponent } from './library/library.component';
import { RoleComponent } from './role/role.component';
import { TemplateComponent } from '../business-user/template/template.component';
import { UserComponent } from './user/user.component';
import { ProjectComponent } from './project/project.component';
import { VendorComponent } from './vendor/vendor.component';
import { AuthGaurdService } from '../gaurd/auth-gaurd.service';


const roleChildRoutes : Routes = [
  {
    path:'',
    component:RoleComponent,    
  },
  {
    path:'user',
    component:UserComponent
  },
  {
    path:'master-repo',
    component:LibraryComponent
  },
  {
    path:'projects',
    component:ProjectComponent
  },
  {
    path:'vendors',
    component:VendorComponent
  },
];


const routes: Routes = [
  {
    path:'',
    component:AdminComponent,
    children:roleChildRoutes,
    canActivate:[AuthGaurdService]

  },
  {
    path:'Admin',
    component:AdminComponent,
    children:roleChildRoutes
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
