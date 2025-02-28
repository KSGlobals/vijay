import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SPOCPagesComponent } from './pages.component';
import { ViewComponent } from './view/view.component';
import { ProjectTableComponent } from './project-table/project-table.component';
import { MapComponent } from './map/map.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ThreeDComponent } from './three-d/three-d.component';
import { ProfilepageComponent } from './profilepage/profilepage.component';

const routes: Routes = [
  {
    path: '',
    component: SPOCPagesComponent,
    children: [
      { path: 'spoc-project-view', component: ProjectTableComponent },
      { path: 'spoc-view', component: ViewComponent },
      { path: 'spoc-map', component: MapComponent },
      { path: 'spoc-dashboard', component: DashboardComponent },
      { path: 'spoc-3d', component: ThreeDComponent },
      { path: 'spoc-profile', component: ProfilepageComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
