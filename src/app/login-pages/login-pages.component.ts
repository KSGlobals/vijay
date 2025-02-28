import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
@Component({
  selector: 'app-login',
  templateUrl: './login-pages.component.html',
  styleUrls: ['./login-pages.component.scss'],
})
export class LoginPagesComponent {
  loginForm!: FormGroup;
  EmailForm!: FormGroup;
  PasswordForm!: FormGroup;
  showPassword = false;
  email!: string;
  password!: string;
  errorMessage: string = '';
  isAgreed: boolean = false;
  showPopup = false;
  user: any;
  showPopup1 = false;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    public afs: AngularFirestore, // Inject Firestore service
    public afAuth: AngularFireAuth,
    public ngxLoader: NgxUiLoaderService,
    public firestore: AngularFirestore
  ) {
    this.user = this.afAuth.authState;
  }

  ngOnInit(): void {
    console.log(window.screen.width, window.screen.height);
    this.user.subscribe((user: any) => {
      if (user) {
        console.log('Current user:', user.email);
        this.afs
          .collection('All Users', (ref) =>
            ref.where('email', '==', user.email)
          )
          .get()
          .subscribe((querySnapshot) => {
            console.log('User Docs:');
            querySnapshot.forEach((doc) => {
              const currentUserDoc = doc.data() as {
                type: string;
                firstlogin: boolean;
              };
              console.log(currentUserDoc);
              const userType = currentUserDoc.type; // Assuming 'role' is the field containing user roles
              const firstLogin = currentUserDoc.firstlogin;
              if (firstLogin === false) {
                this.ngxLoader.start();
                if (userType === 'Super Admin') {
                  this.router.navigate(['dashboard']);
                  this.showSuccess();
                } else if (userType === 'Normal Admin') {
                  this.router.navigate(['admin-dashboard']);
                  this.showSuccess();
                } else if (userType === 'SPOC') {
                  this.router.navigate(['spoc-dashboard']);
                  this.showSuccess();
                } else if (userType === 'Manager') {
                  this.router.navigate(['manager-dashboard']);
                  this.showSuccess();
                } else if (userType === 'Uploader') {
                  this.router.navigate(['uploader-dashboard']);
                  this.showSuccess();
                }
                this.ngxLoader.stop();
              } else {
                this.showPopup1 = true;
                this.ngxLoader.stop();
              }
            });
          });
      } else {
        console.log('No user signed in.');
      }
    });
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', Validators.required],
    });
    this.EmailForm = this.formBuilder.group({
      Email: ['', [Validators.email, Validators.required]],
    });
    this.PasswordForm = this.formBuilder.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required]],
      confirmNewPassword: ['', [Validators.required]],
    });
  }
  login() {
    this.ngxLoader.start();
    const email = this.loginForm.value.email;
    this.email = email;
    const password = this.loginForm.value.password;
    this.password = password;

    this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        this.afs
          .collection('All Users', (ref) => ref.where('email', '==', email))
          .get()
          .subscribe((querySnapshot) => {
            console.log('User Docs:');
            querySnapshot.forEach((doc) => {
              const currentUserDoc = doc.data() as {
                type: string;
                firstlogin: boolean;
              };
              console.log(currentUserDoc);
              const userType = currentUserDoc.type; // Assuming 'role' is the field containing user roles
              const firstLogin = currentUserDoc.firstlogin;
              if (firstLogin === false) {
                this.ngxLoader.start();
                if (userType === 'Super Admin') {
                  this.router.navigate(['dashboard']);
                  this.showSuccess();
                } else if (userType === 'Normal Admin') {
                  this.router.navigate(['admin-dashboard']);
                  this.showSuccess();
                } else if (userType === 'SPOC') {
                  this.router.navigate(['spoc-dashboard']);
                  this.showSuccess();
                } else if (userType === 'Manager') {
                  this.router.navigate(['manager-dashboard']);
                  this.showSuccess();
                } else if (userType === 'Uploader') {
                  this.router.navigate(['uploader-dashboard']);
                  this.showSuccess();
                }
                this.ngxLoader.stop();
              } else {
                this.showPopup1 = true;
                this.ngxLoader.stop();
              }
            });
          });
      })
      .catch((e) => {
        this.ngxLoader.stop();
        this.showError(e);
      });
  }
  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }
  showSuccess() {
    this.toastr.success('Successfully Logged In!!!', 'Success!', {
      timeOut: 1000,
    });
  }
  showError(e: any) {
    this.toastr.error(`Error ${e}!', 'Error!`);
  }
  signup() {
    this.router.navigate(['signup']);
  }
  popup() {
    this.showPopup = true;
  }
  Sendresetlink() {
    this.afAuth
      .sendPasswordResetEmail(this.EmailForm.value.Email)
      .then(() => {
        this.true1();
      })
      .catch((error) => {
        this.false1(error);
      });
    this.showPopup = false;
    this.EmailForm.reset();
  }
  closePopup() {
    this.showPopup = false;
  }
  closePopup1() {
    this.showPopup1 = false;
  }
  true1(): any {
    this.toastr.success('Success!!!', 'Email Sent');
  }
  false1(error: any): any {
    this.toastr.error('Error!!!', error);
  }
  Updatepassword() {
    this.ngxLoader.start();
    console.log(123);

    const email = this.email;
    const password = this.PasswordForm.value.newPassword;
    console.log(password);

    if (
      this.PasswordForm.value.oldPassword !==
      this.PasswordForm.value.newPassword
    ) {
      if (
        this.PasswordForm.value.newPassword ===
        this.PasswordForm.value.confirmNewPassword
      ) {
        this.firestore
          .collection('All Users', (ref) => ref.where('email', '==', email))
          .get()
          .subscribe((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              console.log(doc.id);
              this.firestore.collection('All Users').doc(doc.id).update({
                firstlogin: false,
                password: this.PasswordForm.value.newPassword,
              });
            });
          });
        this.firestore
          .collection('All Users', (ref) => ref.where('email', '==', email))
          .get()
          .subscribe((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              console.log(doc.id);
              const data = doc.data() as { type: string };
              console.log(data.type);
              if (data.type !== 'Manager') {
                this.firestore.collection(data.type).doc(doc.id).update({
                  firstlogin: false,
                  password: this.PasswordForm.value.newPassword,
                });
              } else {
                this.firestore
                  .collection('Project Manager')
                  .doc(doc.id)
                  .update({
                    firstlogin: false,
                    password: this.PasswordForm.value.newPassword,
                  });
              }
            });
          });
        console.log(password);
        this.afAuth
          .signInWithEmailAndPassword(email, this.password)
          .then(async () => {
            const user = await this.afAuth.currentUser;
            if (user) {
              user.updatePassword(password);
            }
            console.log(123);
            this.afs
              .collection('All Users', (ref) => ref.where('email', '==', email))
              .get()
              .subscribe((querySnapshot) => {
                console.log('User Docs:');
                querySnapshot.forEach((doc) => {
                  const currentUserDoc = doc.data() as {
                    type: string;
                  };
                  console.log(currentUserDoc);
                  const userType = currentUserDoc.type;
                  console.log(123); // Assuming 'role' is the field containing user roles
                  if (userType === 'Super Admin') {
                    this.router.navigate(['login']);
                    this.toastr.info('Password Changed Relogin');
                    setTimeout(() => {
                      window.location.reload();
                    }, 3000);
                  } else if (userType === 'Normal Admin') {
                    this.router.navigate(['login']);
                    this.toastr.info('Password Changed Relogin');
                    setTimeout(() => {
                      window.location.reload();
                    }, 3000);
                  } else if (userType === 'SPOC') {
                    this.router.navigate(['login']);
                    this.toastr.info('Password Changed Relogin');
                    setTimeout(() => {
                      window.location.reload();
                    }, 3000);
                  } else if (userType === 'Manager') {
                    this.router.navigate(['login']);
                    this.toastr.info('Password Changed Relogin');
                    setTimeout(() => {
                      window.location.reload();
                    }, 3000);
                  } else if (userType === 'Uploader') {
                    this.router.navigate(['login']);
                    this.toastr.info('Password Changed Relogin');
                    setTimeout(() => {
                      window.location.reload();
                    }, 3000);
                  }

                  this.ngxLoader.stop();
                });
              });
          })
          .catch((error) => {
            console.log(error);
            this.ngxLoader.stop();
          });
      } else {
        this.toastr.error('Password do not match');
        this.ngxLoader.stop();
      }
    } else {
      this.toastr.error('Old and New Password should not be same');
      this.ngxLoader.stop();
    }
  }
}
