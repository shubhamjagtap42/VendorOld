import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AppModuleConstants } from '../app-constants';


interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  sidebar: boolean = false;

  checked1: boolean = false;

  sidebar1: boolean = false;
  user!: string;
  logUser: boolean = false;
  isActive:boolean=false;
  isActive1:boolean=false;
  isActive2:boolean=false;
  isActive3:boolean=false;
  isActive4:boolean=false;

  userRole!:string;
  userName!:string;
  lastName!:string;
  constructor(private router: Router) { }

  ngOnInit(): void {
    
    this.userRole = sessionStorage.getItem(AppModuleConstants.ROLE)!;
    this.userName = sessionStorage.getItem(AppModuleConstants.USER)!;
    this.lastName = sessionStorage.getItem(AppModuleConstants.LASTNAME)!;
    this.screenWidth = window.innerWidth;
   
          this.navData = [
          {
            routeLink: '/Admin',
            icon: 'pi pi-chart-bar',
            label: 'Role',
            image:'assets/Images/Union 3.png',
            tooltip:"Roles"
          },
          {
            routeLink: '/Admin/user',
            icon: 'pi pi-table',
            label: 'User',
            image:'assets/Images/PwC_Funct_Icons_Avatar_Outline_Black_RGB.png',
            tooltip:"Users"
           },
          // {
          //   routeLink: '/document/nav/project-mng',
          //   icon: 'pi pi-chart-line',
          //   label: 'Project',
          //   image:'assets/Images/Union 2.png'
        
          // },
          // {
          //   routeLink: '/document/nav/vendor-mng',
          //   icon: 'pi pi-users',
          //   label: 'Vendor',
          //   image:'assets/Images/Group.png'
        
          // },
          // {
          //   routeLink: '/document/nav/template-mng',
          //   icon: 'pi pi-cog',
          //   label: 'Templates',
          //   image:'assets/Images/Union 1.png'
          // },
          {
            routeLink: '/Admin/master-repo',
            icon: 'pi pi-users',
            label: 'Library',
            image:'/assets/Images/library_icon.png',
            tooltip:"Master Library"
          },
          {
            routeLink: '/Admin/projects',
            icon: 'pi pi-chart-line',
            label: 'Project',
            image:'assets/Images/Union 2.png',
            tooltip:"Projects"
          },
          {
            routeLink: '/Admin/vendors',
            icon: 'pi pi-users',
            label: 'Vendor',
            image:'assets/Images/Group.png',
            tooltip:"Vendors"
          },
          // {
          //   routeLink: '/Admin/template-list',
          //   icon: 'pi pi-cog',
          //   label: 'Templates',
          //   image:'assets/Images/Union 1.png',
          //   tooltip:"Templates"
          // },
          
        ]

     
    


  }

  sideBar() {
    if (this.sidebar == false) {
      this.sidebar = true;
    } else {
      this.sidebar = false;
    }
  }

  logout() {
    sessionStorage.clear();
    this.router.navigate(['/']);
  }

  onClickHome() {
    this.router.navigate(['/home']);
  }

  onClicUserMngmnt() {
    this.router.navigate(['/user-mng']);
  }

  onClicRoleMngmnt() {
    this.router.navigate(['/role-mng']);
  }

  onClicVendorMngmnt() {
    this.router.navigate(['/vendor-mng']);
  }

  onClicProjectMngmnt(){
    this.router.navigate(['/project-mng']);
    
  }

  onClicTemplateMngmnt(){
    this.router.navigate(['/template-mng']);
  }

  onClickLibrary(){
    this.router.navigate(['/template-mng']);    
  }

  // config: boolean = false;
  // onClickConfig() {
  //   this.config = true;
  // }





  onClickAnchor(){
    this.isActive=true;
    this.isActive1=false;
    this.isActive2=false;
    this.isActive3=false;
    this.isActive4=false;
  }

  onClickAnchor1(){
    this.isActive=false;
    this.isActive1=true;
    this.isActive2=false;
    this.isActive3=false;
    this.isActive4=false;
  }


  @Output() onToggleSideNav: EventEmitter<SideNavToggle> = new EventEmitter();
  collapsed = false;
  screenWidth = 0;
  navData: any = [];

  isSideNavCollapsed=false;
  
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = window.innerWidth;
    if(this.screenWidth <= 768 ) {
      this.collapsed = false;
      this.onToggleSideNav.emit({collapsed: this.collapsed, screenWidth: this.screenWidth});
    }
  }

  toggleCollapse(): void {
    if(this.collapsed===true)
    {
      this.collapsed=false;
    }
    else{
      this.collapsed=true;
    }
    this.onToggleSideNav.emit({collapsed: this.collapsed, screenWidth: this.screenWidth});
  }

  toggleCollapse1(): void {
    if(this.collapsed===true)
    {
      this.collapsed=false;
    }
    else{
      this.collapsed=false;
    }
  }

  closeSidenav(): void {
    this.collapsed = false;
    this.onToggleSideNav.emit({collapsed: this.collapsed, screenWidth: this.screenWidth});
  }


  onClickLogout(){
    sessionStorage.clear();
    this.router.navigate(['/']);
  }


}
