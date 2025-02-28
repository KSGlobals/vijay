import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
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
  todayFormatted!: string;
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
    private router: Router
  ) {
    this.getProjectsCount();
    this.getCompletedProjectsCount();
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    this.todayFormatted = `${year}-${month}-${day}`;
    this.getOngoingProjectsCount();
    this.getUpcomingProjectsCount();
    this.getCompanyData();
  }

  async ngOnInit() {
    await this.fetch();
  }
  profile() {
    this.router.navigate(['profile']);
  }
  async fetch() {
    await this.getCurrentUserEmail();
    const user = await this.getUsername(this.currentUserEmail);
    this.userName = user[0].userName;
    this.userType = user[0].userType;
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
  getProjectsCount() {
    this.firestore
      .collection('Project')
      .get()
      .subscribe((querySnapshot) => {
        this.totalProjects = querySnapshot.size;
      });
  }
  getCompletedProjectsCount() {
    this.firestore
      .collection('Project', (ref) => ref.where('status', '==', 'Completed'))
      .get()
      .subscribe((querySnapshot) => {
        this.totalCompletedProjects = querySnapshot.size;
      });
  }
  getOngoingProjectsCount() {
    const allowedStatuses = [
      'In Progress',
      'In Approval',
      'Delete Request',
      'Rework',
    ];
    this.firestore
      .collection('Project', (ref) =>
        ref.where('status', 'in', allowedStatuses)
      )
      .get()
      .subscribe((querySnapshot) => {
        this.totalOngoingProjects = querySnapshot.size;
      });
  }
  getUpcomingProjectsCount() {
    console.log(this.todayFormatted);
    this.firestore
      .collection('Project', (ref) =>
        ref
          .where('date', '<=', this.todayFormatted)
          .where('status', '==', 'Pending')
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
          this.companies.push(doc.data());
          console.log(doc.data());
          this.date = doc.data() as { date: Date };
        });
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
  applyFilter() {
    console.log(this.companies);
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
}
