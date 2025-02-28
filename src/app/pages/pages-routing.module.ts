import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagesComponent } from './pages.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { ProjectmanagercreationComponent } from './projectmanagercreation/projectmanagercreation.component';
import { ViewComponent } from './view/view.component';
import { ProjectsComponent } from './projects/projects.component';
import { ProjectTableComponent } from './project-table/project-table.component';
import { CompanyTableComponent } from './company-table/company-table.component';
import { MapComponent } from './map/map.component';
import { ManagerTableComponent } from './manager-table/manager-table.component';
import { ThreeDComponent } from './three-d/three-d.component';
import { UploaderComponent } from './uploader/uploader.component';
import { UploaderdetailsComponent } from './uploaderdetails/uploaderdetails.component';
import { ProfilepageComponent } from './profilepage/profilepage.component';
const routes: Routes = [
  {
    path: '',
    component: PagesComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'company-profile', component: ProfileComponent },
      { path: 'project', component: ProjectsComponent },
      { path: 'project-view', component: ProjectTableComponent },
      { path: 'manager', component: ProjectmanagercreationComponent },
      { path: 'view', component: ViewComponent },
      { path: 'company-view', component: CompanyTableComponent },
      { path: 'map', component: MapComponent },
      { path: 'manager-view', component: ManagerTableComponent },
      { path: '3d', component: ThreeDComponent },
      { path: 'uploader-view', component: UploaderComponent },
      { path: 'uploader', component: UploaderdetailsComponent },
      { path: 'profile', component: ProfilepageComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
