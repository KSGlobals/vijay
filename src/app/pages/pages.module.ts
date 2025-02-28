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

import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { ProjectmanagercreationComponent } from './projectmanagercreation/projectmanagercreation.component';
import { ViewComponent } from './view/view.component';
import { ProjectTableComponent } from './project-table/project-table.component';
import { CompanyTableComponent } from './company-table/company-table.component';
import { ProjectsComponent } from './projects/projects.component';
import { MapComponent } from './map/map.component';
import { ManagerTableComponent } from './manager-table/manager-table.component';
import { ThreeDComponent } from './three-d/three-d.component';
import { UploaderComponent } from './uploader/uploader.component';
import { UploaderdetailsComponent } from './uploaderdetails/uploaderdetails.component';
import { ProfilepageComponent } from './profilepage/profilepage.component';

@NgModule({
  declarations: [
    DashboardComponent,
    ProfileComponent,
    ProjectmanagercreationComponent,
    ViewComponent,
    ProjectTableComponent,
    CompanyTableComponent,
    ProjectsComponent,
    MapComponent,
    ManagerTableComponent,
    ThreeDComponent,
    UploaderComponent,
    UploaderdetailsComponent,
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
