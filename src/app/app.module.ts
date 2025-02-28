import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FirestoreModule } from '@angular/fire/firestore';
import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { LoginPagesComponent } from './login-pages/login-pages.component';
import { HttpClientModule } from '@angular/common/http';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { ToastrModule } from 'ngx-toastr';
import { PagesComponent } from './pages/pages.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ServiceService } from './service.service';
import { AdminPagesComponent } from './Admin Pages/pages.component';
import { ManagerPagesComponent } from './Manager Pages/pages.component';
import { SPOCPagesComponent } from './SPOC Pages/pages.component';
import { ManagerSidebarComponent } from './Manager sidebar/sidebar.component';
import { SPOCSidebarComponent } from './SPOC sidebar/sidebar.component';
import { AdminSidebarComponent } from './adminsidebar/sidebar.component';
import { UploaderPagesComponent } from './uploader Pages/pages.component';
import { UploaderSidebarComponent } from './Uploader sidebar/sidebar.component';
@NgModule({
  declarations: [
    AppComponent,
    LoginPagesComponent,
    PagesComponent,
    SidebarComponent,
    AdminPagesComponent,
    AdminSidebarComponent,
    ManagerPagesComponent,
    ManagerSidebarComponent,
    SPOCPagesComponent,
    SPOCSidebarComponent,
    UploaderPagesComponent,
    UploaderSidebarComponent,
  ],
  imports: [
    AngularFireModule.initializeApp(environment.firebase),
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    ToastrModule.forRoot(),
    BrowserAnimationsModule,
    HttpClientModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatDatepickerModule,
    NgbModule,
    FirestoreModule,
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireDatabaseModule,
    FormsModule,
    NgxUiLoaderModule.forRoot({}),
  ],
  providers: [ServiceService],
  bootstrap: [AppComponent],
})
export class AppModule {}
