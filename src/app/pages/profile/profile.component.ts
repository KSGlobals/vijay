import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ServiceService } from 'src/app/service.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  insuranceForm: any;
  selectedVehicleType!: string;
  showPopup: boolean = false;
  selectedFiles: File[] = [];
  arrayValue: string[] = [];
  newItem: any;
  currentUserEmail: string | null = null;
  userName!: string;
  userType!: string;
  img!: any;
  constructor(
    private formBuilder: FormBuilder,
    private ngxLoader: NgxUiLoaderService,
    private toastr: ToastrService,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private afAuth: AngularFireAuth,
    private dataService: ServiceService,
    private router: Router
  ) {
    this.newItem = {};
  }

  async ngOnInit() {
    await this.fetch();
  }
  profile() {
    this.router.navigate(['profile']);
  }
  async fetch() {
    this.insuranceForm = this.formBuilder.group({
      name: '',
      logo: '',
      address: [''],
      SPOC: '',
      email: '',
      password: '',
      type: 'SPOC',
      firstlogin: true,
    });
    await this.getCurrentUserEmail();
    const user = await this.getUsername(this.currentUserEmail);
    this.userName = user[0].userName;
    this.userType = user[0].userType;
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
  onDelete(file: File) {
    const index = this.selectedFiles.indexOf(file);
    if (index > -1) {
      this.selectedFiles.splice(index, 1);
    }
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
  onFileSelected(event: any) {
    const files: File[] = event.target.files;
    for (let i = 0; i < files.length; i++) {
      this.selectedFiles.push(files[i]);
      this.selectedFiles;
    }
  }
  uploadfile() {
    for (const file of this.selectedFiles) {
      const filePath = `Company/${this.insuranceForm.value.name}/${file.name}`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, file);

      // Observe the upload progress
      task.percentageChanges().subscribe((percentage) => {
        console.log(`Upload progress: ${percentage}%`);
      });

      // Get notified when the upload is completed successfully
      task
        .then((snapshot) => {
          console.log('File uploaded:', file.name);
          // You can get the file's download URL if needed
          fileRef.getDownloadURL().subscribe((downloadURL) => {
            console.log('Download URL:', downloadURL);
            // Save the download URL to Firestore or perform any other operations
          });
        })
        .catch((error) => {
          console.error('Error uploading file:', file.name, error);
        });
    }
  }
  async submit() {
    this.ngxLoader.start();
    this.getCurrentUserEmail();
    const user = await this.getUsername(this.currentUserEmail);
    const pass = user[0].pass;
    console.log(this.insuranceForm.value);
    if (this.currentUserEmail === 'admin1@gmail.com') {
      this.afAuth
        .createUserWithEmailAndPassword(
          this.insuranceForm.value.email,
          this.insuranceForm.value.password
        )
        .then(() => {
          this.afAuth.signInWithEmailAndPassword('admin1@gmail.com', pass);
        })
        .then(() => {
          this.uploadfile();
          const dataToSave = this.insuranceForm.value;
          this.firestore
            .collection('Profile')
            .doc(this.insuranceForm.value.name)
            .set(dataToSave)
            .then(() => {
              console.log('Data saved successfully.');
              this.showPopup = true; // Show the popup when data is saved successfully
            })
            .catch((error) => {
              console.error('Error saving data:', error);
            });
          this.firestore
            .collection('SPOC')
            .doc(this.insuranceForm.value.SPOC)
            .set({
              name: this.insuranceForm.value.SPOC,
              email: this.insuranceForm.value.email,
              password: this.insuranceForm.value.password,
              type: 'SPOC',
            })
            .then(() => {
              console.log('Data saved successfully.');
              this.showPopup = true; // Show the popup when data is saved successfully
            })
            .catch((error) => {
              console.error('Error saving data:', error);
            });
          this.firestore
            .collection('All Users')
            .doc(this.insuranceForm.value.SPOC)
            .set({
              name: this.insuranceForm.value.SPOC,
              email: this.insuranceForm.value.email,
              password: this.insuranceForm.value.password,
              type: 'SPOC',
            })
            .then(() => {
              console.log('Data saved successfully.');
              this.showPopup = true; // Show the popup when data is saved successfully
            })
            .catch((error) => {
              console.error('Error saving data:', error);
            });
          this.ngxLoader.stop();
        });
    } else if (this.currentUserEmail === 'adarsh@skyx.co.in') {
      this.afAuth
        .createUserWithEmailAndPassword(
          this.insuranceForm.value.email,
          this.insuranceForm.value.password
        )
        .then(() => {
          this.afAuth.signInWithEmailAndPassword('adarsh@skyx.co.in', pass);
        })
        .then(() => {
          this.uploadfile();
          const dataToSave = this.insuranceForm.value;
          this.firestore
            .collection('Profile')
            .doc(this.insuranceForm.value.name)
            .set(dataToSave)
            .then(() => {
              console.log('Data saved successfully.');
              this.showPopup = true; // Show the popup when data is saved successfully
            })
            .catch((error) => {
              console.error('Error saving data:', error);
            });
          this.firestore
            .collection('SPOC')
            .doc(this.insuranceForm.value.SPOC)
            .set({
              name: this.insuranceForm.value.SPOC,
              email: this.insuranceForm.value.email,
              password: this.insuranceForm.value.password,
              type: 'SPOC',
            })
            .then(() => {
              console.log('Data saved successfully.');
              this.showPopup = true; // Show the popup when data is saved successfully
            })
            .catch((error) => {
              console.error('Error saving data:', error);
            });
          this.firestore
            .collection('All Users')
            .doc(this.insuranceForm.value.SPOC)
            .set({
              name: this.insuranceForm.value.SPOC,
              email: this.insuranceForm.value.email,
              password: this.insuranceForm.value.password,
              type: 'SPOC',
            })
            .then(() => {
              console.log('Data saved successfully.');
              this.showPopup = true; // Show the popup when data is saved successfully
            })
            .catch((error) => {
              console.error('Error saving data:', error);
            });
          this.ngxLoader.stop();
        });
    }
    this.router.navigate(['company-view']);
  }
  closePopup() {
    this.showPopup = false;
  }

  cancel() {
    this.ngxLoader.start();
    this.insuranceForm.reset();
    this.ngxLoader.stop();
    this.showWarn();
  }
  showSuccess() {
    this.toastr.success('Data Saved Successfully!!!', 'Success!', {
      timeOut: 1000,
    });
  }
  showError() {
    this.toastr.error('Cannot Save Data!!!', 'Error!', { timeOut: 1000 });
  }
  showWarn() {
    this.toastr.warning('Cancelled Operation!!!', 'Warning!', {
      timeOut: 1000,
    });
  }
  async getUsername(
    currentUserEmail: any
  ): Promise<{ userName: string; userType: string; pass: string }[]> {
    if (currentUserEmail) {
      try {
        const querySnapshot = await this.firestore
          .collection('Super Admin')
          .ref.where('email', '==', currentUserEmail)
          .get();

        if (!querySnapshot.empty) {
          const userArray: {
            userName: string;
            userType: string;
            pass: string;
          }[] = [];

          querySnapshot.forEach((doc) => {
            const currentUserDoc = doc.data() as {
              name: string;
              type: string;
              password: string;
            };
            const userName = currentUserDoc.name;
            const userType = currentUserDoc.type;
            const pass = currentUserDoc.password;
            userArray.push({ userName, userType, pass });

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
  senddata() {
    this.newItem = { ...this.insuranceForm.value };
    this.dataService.setDatas(this.newItem);
    this.newItem = {};
  }
}
