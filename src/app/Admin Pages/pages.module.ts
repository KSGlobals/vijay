import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesRoutingModule } from './pages-routing.module';
import { FormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { ViewComponent } from './view/view.component';
import { ProjectTableComponent } from './project-table/project-table.component';
import { MapComponent } from './map/map.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProjectmanagercreationComponent } from './projectmanagercreation/projectmanagercreation.component';
import { CompanyTableComponent } from './company-table/company-table.component';
import { ManagerTableComponent } from './manager-table/manager-table.component';
import { ProfileComponent } from './profile/profile.component';
import { ProjectsComponent } from './projects/projects.component';
import { ThreeDComponent } from './three-d/three-d.component';
import { ProfilepageComponent } from './profilepage/profilepage.component';

@NgModule({
  declarations: [
    ViewComponent,
    ProjectTableComponent,
    MapComponent,
    DashboardComponent,
    ProjectmanagercreationComponent,
    CompanyTableComponent,
    ManagerTableComponent,
    ProfileComponent,
    ProjectsComponent,
    ThreeDComponent,
    ProfilepageComponent,
  ],
  imports: [
    CommonModule,
    PagesRoutingModule,
    FormsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatNativeDateModule,
  ],
})
export class PagesModule {}
