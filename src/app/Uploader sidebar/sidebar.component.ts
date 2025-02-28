import {
  Component,
  OnInit,
  EventEmitter,
  Input,
  Output,
  HostListener,
} from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Route, Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-uploader-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class UploaderSidebarComponent implements OnInit {
  @Input() isExpanded: boolean = false;
  activeIndex: number = 0;
  @Output() toggleSidebar: EventEmitter<boolean> = new EventEmitter<boolean>();
  userType!: string;
  handleSidebarToggle = () => this.toggleSidebar.emit(!this.isExpanded);

  constructor(
    private router: Router,
    public ngxLoader: NgxUiLoaderService,
    public log: AngularFireAuth
  ) {}

  ngOnInit(): void {
    const sessionActiveIndex = sessionStorage.getItem('activeIndex');
    if (window.location.href.endsWith('dashboard')) {
      localStorage.setItem('activeIndex', '0');
    }
    if (sessionActiveIndex !== null) {
      this.activeIndex = parseInt(sessionActiveIndex, 10);
    } else {
      // If 'activeIndex' is not in sessionStorage, check localStorage
      const localActiveIndex = localStorage.getItem('activeIndex');
      if (localActiveIndex !== null) {
        this.activeIndex = parseInt(localActiveIndex, 10);
      }
    }
  }
  @HostListener('window:beforeunload', ['$event'])
  unloadHandler(event: any): void {
    sessionStorage.removeItem('activeIndex');
    this.activeIndex = 0;
    localStorage.setItem('activeIndex', '0');
  }
  Dashboard() {
    this.ngxLoader.start();
    this.activeIndex = 0;
    localStorage.setItem('activeIndex', '0'); // Store in localStorage
    this.router.navigate(['uploader-dashboard']);
    this.ngxLoader.stop();
  }
  logout() {
    this.ngxLoader.start();
    this.activeIndex = 0;
    localStorage.setItem('activeIndex', '0');
    this.log.signOut();
    this.router.navigate(['login']);
    this.ngxLoader.stop();
  }
  Company() {
    this.ngxLoader.start();
    this.activeIndex = 1;
    localStorage.setItem('activeIndex', '1');
    this.router.navigate(['company-view']);
    this.ngxLoader.stop();
  }
  Project() {
    this.activeIndex = 2;
    this.ngxLoader.start();
    localStorage.setItem('activeIndex', '2');
    this.router.navigate(['uploader-project-view']);
    this.ngxLoader.stop();
  }
  Manager() {
    this.ngxLoader.start();
    this.activeIndex = 3;
    localStorage.setItem('activeIndex', '3');
    this.router.navigate(['manager-view']);
    this.ngxLoader.stop();
  }
  project() {
    this.ngxLoader.start();
    this.router.navigate(['project']);
    this.ngxLoader.stop();
  }
}
