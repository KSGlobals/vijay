import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UploaderPagesComponent } from './pages.component';
import { ViewComponent } from './view/view.component';
import { MapComponent } from './map/map.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProjectTableComponent } from './project-table/project-table.component';
import { ThreeDComponent } from './three-d/three-d.component';
import { ProfilepageComponent } from './profilepage/profilepage.component';
const routes: Routes = [
  {
    path: '',
    component: UploaderPagesComponent,
    children: [
      { path: 'uploader-project-view', component: ProjectTableComponent },
      { path: 'uploader-viewing', component: ViewComponent },
      { path: 'uploader-map', component: MapComponent },
      { path: 'uploader-dashboard', component: DashboardComponent },
      { path: 'uploader-3d', component: ThreeDComponent },
      { path: 'uploader-profile', component: ProfilepageComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
