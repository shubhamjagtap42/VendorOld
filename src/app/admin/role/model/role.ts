export interface Role{
    roleId:string;
    roleName:string;
    totalCount:number;
    descriptions:string;
    checked:boolean;
    accessCount:string;
    vendorTemplateAccess:string[];
    dashboardAccess:string[];
    masterRepoAccess:string[];
    roleStatus:string;
    createdOn:Date;
    editedOn:Date;
}