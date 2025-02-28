import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPagesComponent } from './pages.component';
import { ViewComponent } from './view/view.component';
import { ProjectTableComponent } from './project-table/project-table.component';
import { MapComponent } from './map/map.component';
import { CompanyTableComponent } from './company-table/company-table.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ManagerTableComponent } from './manager-table/manager-table.component';
import { ProfileComponent } from './profile/profile.component';
import { ProjectmanagercreationComponent } from './projectmanagercreation/projectmanagercreation.component';
import { ProjectsComponent } from './projects/projects.component';
import { ThreeDComponent } from './three-d/three-d.component';
import { ProfilepageComponent } from './profilepage/profilepage.component';
const routes: Routes = [
  {
    path: '',
    component: AdminPagesComponent,
    children: [
      { path: 'admin-project-view', component: ProjectTableComponent },
      { path: 'admin-view', component: ViewComponent },
      { path: 'admin-map', component: MapComponent },
      { path: 'admin-company-view', component: CompanyTableComponent },
      { path: 'admin-dashboard', component: DashboardComponent },
      { path: 'admin-manager-view', component: ManagerTableComponent },
      { path: 'admin-company-profile', component: ProfileComponent },
      {
        path: 'admin-manager',
        component: ProjectmanagercreationComponent,
      },
      { path: 'admin-project', component: ProjectsComponent },
      { path: 'admin-3d', component: ThreeDComponent },
      { path: 'admin-profile', component: ProfilepageComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
