import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss'],
})
export class PagesComponent implements OnInit {
  sideBar: boolean = false;
  userType!: string;
  userName!: string;
  activeIndex: number = 0;
  showDropdown = false;
  @Input() isExpanded: boolean = false;
  currentUserEmail: string | null = null;
  @Input() sidebarExpanded: boolean = true;
  @Output() toggleSidebar: EventEmitter<boolean> = new EventEmitter<boolean>();
  handleSidebarToggle = () => this.toggleSidebar.emit(!this.isExpanded);
  img!: any;
  // adminDashboard = true;
  constructor(
    private router: Router,
    public ngxLoader: NgxUiLoaderService,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore
  ) {}

  async ngOnInit() {
    await this.getCurrentUserEmail();
    const user = await this.getUsername(this.currentUserEmail);
    this.userName = user[0].userName;
    this.userType = user[0].userType;
    const storedActiveIndex = localStorage.getItem('activeIndex');
    if (storedActiveIndex) {
      this.activeIndex = parseInt(storedActiveIndex, 10);
    }
    if (window.location.href.endsWith('dashboard')) {
      localStorage.setItem('activeIndex', '0');
    }
    this.firestore
      .collection('All Users')
      .doc(this.userName)
      .valueChanges()
      .subscribe((data: any) => {
        console.log(data);

        this.img = data.url;
        console.log(this.img);
      });
  }
  async getUsername(
    currentUserEmail: any
  ): Promise<{ userName: string; userType: string }[]> {
    if (currentUserEmail) {
      try {
        const querySnapshot = await this.firestore
          .collection('Super Admin')
          .ref.where('email', '==', currentUserEmail)
          .get();

        if (!querySnapshot.empty) {
          const userArray: { userName: string; userType: string }[] = [];

          querySnapshot.forEach((doc) => {
            const currentUserDoc = doc.data() as { name: string; type: string };
            const userName = currentUserDoc.name;
            const userType = currentUserDoc.type;

            userArray.push({ userName, userType });

            console.log('Current User Name:', userName);
            console.log('Current User Type:', userType);
          });

          return userArray;
        } else {
          console.error('User document not found.');
          this.router.navigate(['login']);
          // Handle the case where the user document is not found.
          throw new Error('User document not found');
        }
      } catch (error) {
        console.error('Error fetching user document:', error);
        throw error;
      }
    } else {
      console.log('User is not logged in.');
      this.router.navigate(['login']);
      throw new Error('User is not logged in');
    }
  }
  getCurrentUserEmail() {
    return new Promise<void>((resolve) => {
      this.afAuth.authState.subscribe((user) => {
        if (user) {
          this.currentUserEmail = user.email;
          console.log('Current User Email:', this.currentUserEmail);
        } else {
          this.currentUserEmail = null;
          console.log('User is not logged in.');
          this.router.navigate(['login']);
        }
        resolve();
      });
    });
  }
  sideBarNav() {
    this.sideBar = true;
  }
  closePopup() {
    this.sideBar = false;
  }
  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }
  logout() {
    this.afAuth.signOut().then(() => {
      this.router.navigateByUrl('login'); // Replace '/login' with your actual login page route
    });
  }
  userProfile() {
    this.router.navigate(['user-profile']);
  }

  Dashboard() {
    this.ngxLoader.start();
    this.activeIndex = 0;
    localStorage.setItem('activeIndex', '0'); // Store in localStorage
    this.router.navigate(['dashboard']);
    this.sideBar = false;
    this.ngxLoader.stop();
  }
  Company() {
    this.ngxLoader.start();
    this.activeIndex = 1;
    localStorage.setItem('activeIndex', '1');
    this.router.navigate(['company-view']);
    this.sideBar = false;
    this.ngxLoader.stop();
  }
  Project() {
    this.activeIndex = 2;
    this.ngxLoader.start();
    localStorage.setItem('activeIndex', '2');
    this.router.navigate(['project-view']);
    this.sideBar = false;
    this.ngxLoader.stop();
  }
  Manager() {
    this.ngxLoader.start();
    this.activeIndex = 3;
    localStorage.setItem('activeIndex', '3');
    this.router.navigate(['manager-view']);
    this.sideBar = false;
    this.ngxLoader.stop();
  }
  uploader() {
    this.ngxLoader.start();
    this.activeIndex = 4;
    localStorage.setItem('activeIndex', '4');
    this.router.navigate(['uploader-view']);
    this.sideBar = false;
    this.ngxLoader.stop();
  }
  project() {
    this.ngxLoader.start();
    this.router.navigate(['project']);
    this.ngxLoader.stop();
  }
}
