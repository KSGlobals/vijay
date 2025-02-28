import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { deleteField } from 'firebase/firestore';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-profilepage',
  templateUrl: './profilepage.component.html',
  styleUrl: './profilepage.component.scss',
})
export class ProfilepageComponent implements OnInit {
  profileForm: any;
  selectedFiles: File[] = [];
  currentUserEmail: string | null = null;
  userName!: string;
  userType!: string;
  file!: any;
  datas: any;
  img!: any;
  constructor(
    private formBuilder: FormBuilder,
    private ngxLoader: NgxUiLoaderService,
    private toastr: ToastrService,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private afAuth: AngularFireAuth,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.fetch();
  }
  profile() {
    this.router.navigate(['profile']);
  }
  back() {
    this.router.navigate(['manager-dashboard']);
  }
  async delete() {
    await this.getCurrentUserEmail();
    const user = await this.getUsername(this.currentUserEmail);
    this.userName = user[0].userName;
    this.userType = user[0].userType;
    this.firestore
      .collection('User Details')
      .doc(this.userName)
      .update({ url: deleteField() });
  }
  async fetch() {
    this.profileForm = this.formBuilder.group({
      name: '',
      photo: '',
      id: [''],
      phone: '',
      email: '',
    });
    await this.getCurrentUserEmail();
    const user = await this.getUsername(this.currentUserEmail);
    this.userName = user[0].userName;
    this.userType = user[0].userType;
    console.log(this.userName);
    this.firestore
      .collection('User Details')
      .doc(this.userName)
      .valueChanges()
      .subscribe((data) => {
        this.datas = data;
        console.log(this.datas);
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
    console.log(this.currentUserEmail);
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
      this.file = file.name;
      const filePath = `Profile/${this.profileForm.value.name}/${file.name}`;
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
            this.firestore
              .collection('All Users')
              .doc(this.profileForm.value.name)
              .update({
                file: this.file,
                url: downloadURL,
              });
            this.firestore
              .collection(this.userType)
              .doc(this.profileForm.value.name)
              .update({ file: this.file, url: downloadURL });
            this.firestore
              .collection('User Details')
              .doc(this.profileForm.value.name)
              .update({ file: this.file, url: downloadURL });
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
    this.userType = user[0].userType;
    console.log(this.profileForm.value);
    const docRef = this.firestore
      .collection('User Details')
      .doc(this.profileForm.value.name);
    docRef.get().subscribe((doc) => {
      if (!doc.exists) {
        this.firestore
          .collection('User Details')
          .doc(this.profileForm.value.name)
          .set({
            name: this.profileForm.value.name,
            email: this.profileForm.value.email,
            number: this.profileForm.value.phone,
            id: this.profileForm.value.id,
          })
          .then(() => {
            this.firestore
              .collection('All Users')
              .doc(this.profileForm.value.name)
              .update({
                name: this.profileForm.value.name,
                email: this.profileForm.value.email,
                number: this.profileForm.value.phone,
                id: this.profileForm.value.id,
              });
            this.firestore
              .collection(this.userType)
              .doc(this.profileForm.value.name)
              .update({
                name: this.profileForm.value.name,
                email: this.profileForm.value.email,
                number: this.profileForm.value.phone,
                id: this.profileForm.value.id,
              });
            if (this.selectedFiles) {
              this.uploadfile();
            }
            this.showSuccess();
            this.router.navigate(['manager-dashboard']);
            this.ngxLoader.stop();
          })
          .catch((e) => {
            this.showError(e);
            this.ngxLoader.stop();
          });
      } else {
        this.firestore
          .collection('User Details')
          .doc(this.profileForm.value.name)
          .update({
            name: this.profileForm.value.name,
            email: this.profileForm.value.email,
            number: this.profileForm.value.phone,
            id: this.profileForm.value.id,
          })
          .then(() => {
            this.firestore
              .collection('All Users')
              .doc(this.profileForm.value.name)
              .update({
                name: this.profileForm.value.name,
                email: this.profileForm.value.email,
                number: this.profileForm.value.phone,
                id: this.profileForm.value.id,
              });
            this.firestore
              .collection(this.userType)
              .doc(this.profileForm.value.name)
              .update({
                name: this.profileForm.value.name,
                email: this.profileForm.value.email,
                number: this.profileForm.value.phone,
                id: this.profileForm.value.id,
              });
            if (this.selectedFiles) {
              this.uploadfile();
            }
            this.toastr.success('Updated!!!, Success!!!');
            this.router.navigate(['manager-dashboard']);
            this.ngxLoader.stop();
          })
          .catch((e) => {
            this.showError(e);
            this.ngxLoader.stop();
          });
      }
    });
  }
  cancel() {
    this.ngxLoader.start();
    this.profileForm.reset();
    this.ngxLoader.stop();
    this.showWarn();
  }
  showSuccess() {
    this.toastr.success('Data Saved Successfully!!!', 'Success!', {
      timeOut: 1000,
    });
  }
  showError(error: any) {
    this.toastr.error(`${error}!!!, Error!`);
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
          .collection('All Users')
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
}
