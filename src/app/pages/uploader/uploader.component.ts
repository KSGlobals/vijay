import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
@Component({
  selector: 'app-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss'],
})
export class UploaderComponent implements OnInit {
  uploaders: any[] = [];
  showEditPopup: boolean = false;
  form!: FormGroup;
  showPopup: boolean = false;
  selectedTask: any;
  currentUserEmail: string | null = null;
  userName!: string;
  userType!: string;
  name!: string;
  filteredData: any[] = [];
  date!: any;
  filterValue: string = '';
  img!: any;
  deleteselectedTask: any;
  showDeletePopup = false;
  constructor(
    private firestore: AngularFirestore,
    private router: Router,
    private afAuth: AngularFireAuth,
    private ngxLoader: NgxUiLoaderService,
    private formBuilder: FormBuilder
  ) {
    this.getUploaderData();
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
    this.form = this.formBuilder.group({
      title: '',
      email: '',
      number: '',
      name: '',
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
  delete(task: any) {
    this.showDeletePopup = true;
    this.deleteselectedTask = task;
  }
  camceldelete() {
    this.showDeletePopup = false;
  }
  viewAddTask() {
    this.router.navigate(['uploader']);
  }
  cancelEdit() {
    this.showEditPopup = false;
    this.form.reset();
  }
  updateTask() {
    this.ngxLoader.start();
    this.firestore.collection('All Users').doc(this.form.value.name).update({
      email: this.form.value.email,
      number: this.form.value.number,
      name: this.form.value.name,
    });
    this.firestore
      .collection('Uploader')
      .doc(this.form.value.name)
      .update({
        email: this.form.value.email,
        number: this.form.value.number,
        name: this.form.value.name,
      })
      .then(() => {
        console.log(123);
        window.location.reload();
        this.ngxLoader.stop();
      })
      .catch((error) => {
        console.log(error);
        this.ngxLoader.stop();
      });
    this.cancelEdit();
  }
  getUploaderData() {
    this.firestore
      .collection('Uploader')
      .get()
      .subscribe((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          this.uploaders.push(doc.data());
          let data = doc.data() as { name: string };
          this.name = data.name;
        });
      });
  }
  editTask(task: any) {
    this.selectedTask = task;
    this.showEditPopup = true;
    console.log(task);
    this.form.patchValue({
      name: task.name,
      email: task.email,
      number: task.number,
      company: task.company,
    });
  }
  closePopup() {
    this.showPopup = false;
  }
  deleteTask(task: any) {
    console.log(123);

    this.firestore.collection('Uploader').doc(task.name).delete();
    this.firestore.collection('User Details').doc(task.name).delete();
    this.firestore
      .collection('All Users')
      .doc(task.name)
      .delete()
      .then(() => {
        window.location.reload();
      });
  }
  onDownload(file: File) {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
    // Filter the data based on any of the columns
    this.filteredData = this.uploaders.filter(
      (company) =>
        company.name.toLowerCase().includes(this.filterValue.toLowerCase()) ||
        company.email.toLowerCase().includes(this.filterValue.toLowerCase()) ||
        company.number.toLowerCase().includes(this.filterValue.toLowerCase())
    );
  }
}
