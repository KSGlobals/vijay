import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManagerPagesComponent } from './pages.component';
import { ViewComponent } from './view/view.component';
import { ProjectTableComponent } from './project-table/project-table.component';
import { MapComponent } from './map/map.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ThreeDComponent } from './three-d/three-d.component';
import { ProfilepageComponent } from './profilepage/profilepage.component';

const routes: Routes = [
  {
    path: '',
    component: ManagerPagesComponent,
    children: [
      { path: 'manager-project-view', component: ProjectTableComponent },
      { path: 'manager-viewing', component: ViewComponent },
      { path: 'manager-map', component: MapComponent },
      { path: 'manager-dashboard', component: DashboardComponent },
      { path: 'manager-3d', component: ThreeDComponent },
      { path: 'manager-profile', component: ProfilepageComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
