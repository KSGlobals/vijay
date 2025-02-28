import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import {
  AngularFireStorage,
  AngularFireStorageReference,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, from, of } from 'rxjs';
import { Router } from '@angular/router';
// import { first } from 'rxjs/operators';
import { FormBuilder } from '@angular/forms';
import { ServiceService } from 'src/app/service.service';
import 'firebase/firestore';
@Component({
  selector: 'app-spoc-task-page',
  templateUrl: './project-table.component.html',
  styleUrls: ['./project-table.component.scss'],
})
export class ProjectTableComponent implements OnInit {
  companies: any[] = [];
  searchTerm: string = '';
  filteredCompanies: any[] = [];
  ProjectForm: any;
  selectedCompanies: any[] = [];
  selectedFiles: any[] = [];
  selectedFiles1: any[] = [];
  selectedFiles2: any[] = [];
  selectedFiles3: any[] = [];
  selectedFiles4: any[] = [];
  threedzip: any;
  extension!: any;
  selectedTask: any;
  projects: any[] = [];
  showPopup: boolean = false;
  currentUserEmail: string | null = null;
  userName!: string;
  userType!: string;
  filteredData: any[] = [];
  date!: any;
  filterValue: string = '';
  img!: any;
  constructor(
    private firestore: AngularFirestore,
    private router: Router,
    private storage: AngularFireStorage,
    private toastr: ToastrService,
    private ngxLoader: NgxUiLoaderService,
    private formBuilder: FormBuilder,
    private downloadUrlService: ServiceService,
    private cdr: ChangeDetectorRef,
    private afAuth: AngularFireAuth
  ) {
    this.getCompanyData();
    this.filteredCompanies = [...this.companies];
  }

  async ngOnInit() {
    await this.fetch();
  }
  profile() {
    this.router.navigate(['spoc-profile']);
  }
  async fetch() {
    await this.getCurrentUserEmail();
    const user = await this.getUsername(this.currentUserEmail);
    this.userName = user[0].userName;
    this.userType = user[0].userType;
    console.log(this.userName);
    this.firestore
      .collection('Project')
      .valueChanges()
      .subscribe((data: any[]) => {
        this.projects = data.filter(
          (project) => project.SPOC[0] === this.userName
        );
        console.log(this.projects);
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
  onCompanySelected(company: any) {
    if (!this.selectedCompanies.includes(company)) {
      this.selectedCompanies.push(company);
    } else {
      const index = this.selectedCompanies.indexOf(company);
      if (index > -1) {
        this.selectedCompanies.splice(index, 1);
      }
    }
    this.ProjectForm = this.formBuilder.group({
      title: '',
    });
    this.firestore
      .collection('Project')
      .valueChanges()
      .subscribe((data) => {
        this.projects = data;
        console.log(this.projects);
      });
  }
  applyFilters() {
    this.filteredCompanies = this.companies.filter((company) => {
      const nameMatch = company.title
        .toLowerCase()
        .includes(this.searchTerm.toLowerCase());
      return nameMatch;
    });
  }
  async getUsername(
    currentUserEmail: any
  ): Promise<{ userName: string; userType: string }[]> {
    if (currentUserEmail) {
      try {
        const querySnapshot = await this.firestore
          .collection('SPOC')
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
  viewAddTask() {
    this.router.navigate(['project']);
  }
  viewTask(title: string) {
    this.router.navigate(['spoc-view'], {
      queryParams: {
        title,
      },
    });
  }

  startTask(task: any) {
    this.showPopup = true;
    this.selectedTask = task;
    console.log(this.selectedTask);
  }
  getCompanyData() {
    this.firestore
      .collection('Project')
      .get()
      .subscribe((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          this.companies.push(doc.data());
        });
      });
  }
  closePopup() {
    this.showPopup = false;
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
  downloadFile(task: any) {
    this.firestore
      .collection('Project')
      .doc(task.title)
      .valueChanges()
      .subscribe((data: any) => {
        console.log(data);
        const downloadUrl = data.Downloadurl11;

        if (downloadUrl) {
          window.open(downloadUrl);
        } else {
          console.error('Download URL not available.');
        }
      });
  }
  async allocateUser() {
    this.ngxLoader.start();
    try {
      const user = await this.getUsername(this.currentUserEmail);
      const userName = user[0].userName;
      const userType = user[0].userType;
      console.log(this.selectedTask.title);
      if (userName && userType) {
        let currentIndex = 0;
        for (const file of this.selectedFiles) {
          const filePath = `Project/${this.selectedTask.title}/Ortho/${file.name}`;
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
                const downloadUrlField = `Downloadurl${currentIndex}`;
                this.firestore
                  .collection('Project')
                  .doc(this.selectedTask.title)
                  .update({ [downloadUrlField]: downloadURL });

                // Increment the index for the next file
                currentIndex++;
                this.downloadUrlService.setDownloadUrls(downloadURL);
              });
            })
            .catch((error) => {
              console.error('Error uploading file:', file.name, error);
            });
        }
        let currentIndex1 = 2;
        for (const file of this.selectedFiles1) {
          const filePath = `Project/${this.selectedTask.title}/DEM/${file.name}`;
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
                const downloadUrlField = `Downloadurl${currentIndex1}`;
                this.firestore
                  .collection('Project')
                  .doc(this.selectedTask.title)
                  .update({ [downloadUrlField]: downloadURL });

                // Increment the index for the next file
                currentIndex1++;
              });
            })
            .catch((error) => {
              console.error('Error uploading file:', file.name, error);
            });
        }
        for (const file of this.selectedFiles2) {
          const filePath = `Project/${this.selectedTask.title}/Survey/${file.name}`;
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
                  .collection('Project')
                  .doc(this.selectedTask.title)
                  .update({ Downloadurl4: downloadURL });
                this.downloadUrlService.setDownloadUrlss(downloadURL);
              });
            })
            .catch((error) => {
              console.error('Error uploading file:', file.name, error);
            });
        }
        for (const file of this.selectedFiles3) {
          const filePath = `Project/${this.selectedTask.title}/3D View/${file.name}`;
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
                this.getFileExtension(downloadURL);
                if (this.extension === 'obj' || this.extension === 'fbx') {
                  this.firestore
                    .collection('Project')
                    .doc(this.selectedTask.title)
                    .update({ Downloadurl5: downloadURL });
                  this.downloadUrlService.setDownloadsUrls(downloadURL);
                }
              });
            })
            .catch((error) => {
              console.error('Error uploading file:', file.name, error);
            });
        }
        let currentIndex2 = 6;
        for (const file of this.selectedFiles4) {
          const filePath = `Project/${this.selectedTask.title}/Map/${file.name}`;
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
                const downloadUrlField = `Downloadurl${currentIndex2}`;
                this.firestore
                  .collection('Project')
                  .doc(this.selectedTask.title)
                  .update({ [downloadUrlField]: downloadURL });

                // Increment the index for the next file
                currentIndex2++;

                this.downloadUrlService.setsDownloadUrls(downloadURL);
              });
            })
            .catch((error) => {
              console.error('Error uploading file:', file.name, error);
            });
        }
        const allSelectedFiles = [
          ...this.selectedFiles,
          ...this.selectedFiles1,
          ...this.selectedFiles2,
          ...this.selectedFiles3,
          ...this.selectedFiles4,
        ];
        const filesInfo = allSelectedFiles.map((file) => {
          return { name: file.name, size: file.size, type: file.type };
        });
        this.firestore
          .collection('Project')
          .doc(this.selectedTask.title)
          .update({
            status: 'In Approval',
            files: filesInfo,
            uploadedBy: userType,
          })
          .then(() => {
            console.log('Project status updated successfully.');
          })
          .catch((error) => {
            console.error('Error updating project status:', error);
          });
      }
    } catch (error) {
      console.log(error);
    }
    this.showPopup = false;
    this.ngxLoader.stop();
  }

  onFileSelected(event: any) {
    const files: File[] = event.target.files;
    for (let i = 0; i < files.length; i++) {
      this.selectedFiles.push(files[i]);
      // this.selectedFileNames.push(files[i].name);
    }
  }
  onFileSelected1(event: any) {
    const files: File[] = event.target.files;
    for (let i = 0; i < files.length; i++) {
      this.selectedFiles1.push(files[i]);
      // this.selectedFileNames.push(files[i].name);
    }
  }
  onFileSelected2(event: any) {
    const files: File[] = event.target.files;
    for (let i = 0; i < files.length; i++) {
      this.selectedFiles2.push(files[i]);
      // this.selectedFileNames.push(files[i].name);
    }
  }
  onFileSelected3(event: any) {
    const files: File[] = event.target.files;
    for (let i = 0; i < files.length; i++) {
      this.selectedFiles3.push(files[i]);
      // this.selectedFileNames.push(files[i].name);
    }
  }
  onFileSelected4(event: any) {
    const files: File[] = event.target.files;
    for (let i = 0; i < files.length; i++) {
      this.selectedFiles4.push(files[i]);
      // this.selectedFileNames.push(files[i].name);
    }
  }
  onDelete(file: File) {
    const index = this.selectedFiles.indexOf(file);
    if (index > -1) {
      this.selectedFiles.splice(index, 1);
    }
  }
  onDelete1(file: File) {
    const index = this.selectedFiles1.indexOf(file);
    if (index > -1) {
      this.selectedFiles1.splice(index, 1);
    }
  }
  onDelete2(file: File) {
    const index = this.selectedFiles2.indexOf(file);
    if (index > -1) {
      this.selectedFiles2.splice(index, 1);
    }
  }
  onDelete3(file: File) {
    const index = this.selectedFiles3.indexOf(file);
    if (index > -1) {
      this.selectedFiles3.splice(index, 1);
    }
  }
  onDelete4(file: File) {
    const index = this.selectedFiles4.indexOf(file);
    if (index > -1) {
      this.selectedFiles4.splice(index, 1);
    }
  }
  applyFilter() {
    // Filter the data based on any of the columns
    this.filteredData = this.companies.filter(
      (company) =>
        company.title.toLowerCase().includes(this.filterValue.toLowerCase()) ||
        company.company
          .toLowerCase()
          .includes(this.filterValue.toLowerCase()) ||
        (company.SPOC &&
          Array.isArray(company.SPOC) &&
          company.SPOC.some((SPOC: string) =>
            SPOC.toLowerCase().includes(this.filterValue.toLowerCase())
          )) ||
        company.manager
          .toLowerCase()
          .includes(this.filterValue.toLowerCase()) ||
        company.status.toLowerCase().includes(this.filterValue.toLowerCase())
    );
  }
  getExtensionFromStorageLink(storageLink: string): string | null {
    console.log(storageLink);

    // Split the URL by '?' to remove the query parameters
    const parts = storageLink.split('?');

    // Split the remaining part by '.' to get the file extension
    const extensionParts = parts[0].split('.');

    if (extensionParts.length > 1) {
      return extensionParts[extensionParts.length - 1];
    } else {
      return null; // No extension found
    }
  }
  getFileExtension(url: any) {
    const storageLink = url;
    console.log(storageLink);

    this.extension = this.getExtensionFromStorageLink(storageLink);
    console.log('File extension:', this.extension);
  }
}
