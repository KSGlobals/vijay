import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manager-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  totalProjects: number = 0;
  totalCompletedProjects: number = 0;
  totalOngoingProjects: number = 0;
  totalUpcomingProjects: number = 0;
  startDate: any;
  activeIndex: number = 0;
  companies: any[] = [];
  companydetails: any;
  todayFormatted!: string;
  url: any;
  currentUserEmail: string | null = null;
  userName!: string;
  userType!: string;
  selectedOption: string = 'none';
  dateValue: Date = new Date(); // The date value in your component
  filteredData: any[] = [];
  date!: any;
  filterValue: string = '';
  img!: any;
  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth,
    private storage: AngularFireStorage,
    private router: Router
  ) {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    this.todayFormatted = `${year}-${month}-${day}`;
  }

  async ngOnInit() {
    await this.fetch();
  }
  logout() {
    this.afAuth.signOut();
  }
  profile() {
    this.router.navigate(['manager-profile']);
  }
  async fetch() {
    await this.getCurrentUserEmail();
    const user = await this.getUsername(this.currentUserEmail);
    this.userName = user[0].userName;
    this.getCompanyData();
    this.afAuth;
    await this.run();
    this.filterData();
    this.activeIndex = 0;
    console.log(this.activeIndex);
    sessionStorage.setItem('activeIndex', '0');
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
  getProjectsCount(company: any) {
    this.firestore
      .collection('Project', (ref) => ref.where('manager', '==', company))
      .get()
      .subscribe((querySnapshot) => {
        this.totalProjects = querySnapshot.size;
        console.log(this.totalProjects);
      });
  }

  getCompletedProjectsCount(company: any) {
    this.firestore
      .collection('Project', (ref) =>
        ref.where('status', '==', 'Completed').where('manager', '==', company)
      )
      .get()
      .subscribe((querySnapshot) => {
        this.totalCompletedProjects = querySnapshot.size;
      });
  }
  getOngoingProjectsCount(company: any) {
    const allowedStatuses = [
      'In Progress',
      'In Approval',
      'Delete Request',
      'Rework',
    ];
    this.firestore
      .collection('Project', (ref) =>
        ref
          .where('status', 'in', allowedStatuses)
          .where('manager', '==', company)
      )
      .get()
      .subscribe((querySnapshot) => {
        this.totalOngoingProjects = querySnapshot.size;
      });
  }
  getUpcomingProjectsCount(company: any) {
    console.log(this.todayFormatted);
    this.firestore
      .collection('Project', (ref) =>
        ref
          .where('date', '<=', this.todayFormatted)
          .where('status', '==', 'Pending')
          .where('manager', '==', company)
      )
      .get()
      .subscribe((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          this.firestore
            .collection('Project')
            .doc(doc.id)
            .update({ status: 'In Progress' })
            .then(() => {
              console.log(
                `Status updated to 'In Progress' for document with ID: ${doc.id}`
              );
              window.location.reload();
            })
            .catch((error) => {
              console.error(
                `Error updating status for document with ID: ${doc.id}`,
                error
              );
            });
        });

        // Now, let's query for upcoming projects with 'Pending' status
        this.firestore
          .collection('Project', (ref) =>
            ref
              .where('date', '>', this.todayFormatted)
              .where('status', '==', 'Pending')
          )
          .get()
          .subscribe((newQuerySnapshot) => {
            this.totalUpcomingProjects = newQuerySnapshot.size;
            console.log(this.totalUpcomingProjects);
          });
      });
  }

  getCompanyData() {
    this.firestore
      .collection('Project')
      .get()
      .subscribe((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const projectData = doc.data() as { manager: string; date: Date }; // Assuming 'spoc' is a string field

          if (projectData.manager === this.userName) {
            this.companies.push(projectData);
            this.companydetails = projectData;
            console.log(this.companydetails.manager);
            this.getProjectsCount(this.companydetails.manager);
            this.getCompletedProjectsCount(this.companydetails.manager);
            this.getOngoingProjectsCount(this.companydetails.manager);
            this.getUpcomingProjectsCount(this.companydetails.manager);
            console.log(projectData);
            this.date = projectData.date;
          }
        });
      });
  }
  async getUsername(
    currentUserEmail: any
  ): Promise<{ userName: string; userType: string }[]> {
    if (currentUserEmail) {
      try {
        const querySnapshot = await this.firestore
          .collection('Project Manager')
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
  applyFilter() {
    // Filter the data based on any of the columns
    this.filteredData = this.companies.filter(
      (company) =>
        company.title.toLowerCase().includes(this.filterValue.toLowerCase()) ||
        company.company
          .toLowerCase()
          .includes(this.filterValue.toLowerCase()) ||
        company.uploadedBy
          .toLowerCase()
          .includes(this.filterValue.toLowerCase()) ||
        company.due.toLowerCase().includes(this.filterValue.toLowerCase()) ||
        company.status.toLowerCase().includes(this.filterValue.toLowerCase())
    );
    console.log(this.filterValue);
  }
  filterData() {
    const currentDate = new Date();
    this.startDate = new Date();

    switch (this.selectedOption) {
      case 'lastWeek':
        this.startDate.setDate(currentDate.getDate() - 7);
        break;
      case 'lastMonth':
        this.startDate.setMonth(currentDate.getMonth() - 1);
        break;
      case 'lastYear':
        this.startDate.setFullYear(currentDate.getFullYear() - 1);
        break;
      default:
        this.startDate = null;
        // 'None' option or unknown option, do not apply any filter
        break;
    }

    if (this.startDate) {
      // Filter the data based on the startDate
      this.filteredData = this.companies.filter((item) => {
        const itemDate = new Date(item.date); // Replace 'date' with your actual date field name
        console.log(itemDate >= this.startDate && itemDate <= currentDate);

        return itemDate >= this.startDate && itemDate <= currentDate;
      });
    } else {
      // If 'None' or unknown option is selected, show all data
      this.filteredData = this.companies;
    }
  }
  async run() {
    await this.getCurrentUserEmail();
    console.log(this.currentUserEmail);

    this.firestore
      .collection('Company', (ref) =>
        ref.where('email', '==', this.currentUserEmail)
      )
      .get()
      .subscribe((querySnapshot) => {
        querySnapshot.forEach(async (doc) => {
          this.companydetails.push(doc.data());
          console.log(this.companydetails[0].name);
          const path = this.storage.ref(
            `Company/${this.companydetails[0].name}`
          );
          const files = await path.listAll().toPromise();
          if (files) {
            for (const fileRef of files.items) {
              const downloadURL = await fileRef.getDownloadURL();
              this.url = downloadURL;
              console.log(this.url);
            }
          }
        });
      });
  }
}
