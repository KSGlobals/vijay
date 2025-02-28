import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ServiceService } from 'src/app/service.service';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-company-table',
  templateUrl: './company-table.component.html',
  styleUrls: ['./company-table.component.scss'],
})
export class CompanyTableComponent implements OnInit {
  companies: any[] = [];
  ProjectForm: any;
  selectedCompanies: any[] = [];
  selectedFiles: any[] = [];
  showEditPopup: boolean = false;
  selectedFiles1: any[] = [];
  selectedFiles2: any[] = [];
  selectedFiles3: any[] = [];
  selectedFiles4: any[] = [];
  selectedTask: any;
  showPopup: boolean = false;
  totalprojects: any;
  currentUserEmail: string | null = null;
  userName!: string;
  userType!: string;
  name!: string;
  filteredData: any[] = [];
  date!: any;
  documentId: string[] = [];
  filterValue: string = '';
  img!: any;
  deleteselectedTask: any;
  showDeletePopup = false;
  constructor(
    private firestore: AngularFirestore,
    private router: Router,
    private storage: AngularFireStorage,
    private toastr: ToastrService,
    private ngxLoader: NgxUiLoaderService,
    private formBuilder: FormBuilder,
    private downloadUrlService: ServiceService,
    private afAuth: AngularFireAuth
  ) {
    this.getCompanyData();
  }

  async ngOnInit() {
    await this.fetch();
    this.ProjectForm = this.formBuilder.group({
      title: '',
      email: '',
      address: '',
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
    this.firestore
      .collection('Profile')
      .valueChanges()
      .subscribe((data: any) => {
        this.documentId = data.map((company: any) => company.name);
      });
  }
  profile() {
    this.router.navigate(['manager-profile']);
  }
  async fetch() {
    await this.getCurrentUserEmail();
    const user = await this.getUsername(this.currentUserEmail);
    this.userName = user[0].userName;
    this.userType = user[0].userType;
    this.companies.forEach((company) => {
      console.log(company);

      this.totalprojects = this.getCompletedProjectsCount(company.name);
    });
  }
  delete(task: any) {
    this.showDeletePopup = true;
    this.deleteselectedTask = task;
  }
  camceldelete() {
    this.showDeletePopup = false;
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
  }
  deleteTask(task: any) {
    this.firestore.collection('Profile').doc(task.name).delete();
    this.firestore.collection('SPOC').doc(task.SPOC).delete();
    this.firestore.collection('User Details').doc(task.SPOC).delete();
    this.firestore
      .collection('All Users')
      .doc(task.SPOC)
      .delete()
      .then(() => {
        window.location.reload();
      });
  }
  viewAddTask() {
    this.router.navigate(['company-profile']);
  }
  getCompletedProjectsCount(name: any) {
    this.firestore
      .collection('Project', (ref) => ref.where('company', '==', name))
      .get()
      .subscribe((querySnapshot) => {
        const totalprojects = querySnapshot.size;

        // Update the 'companies' array with the total projects for the specific company
        const companyIndex = this.companies.findIndex((c) => c.name === name);
        if (companyIndex !== -1) {
          this.companies[companyIndex].totalprojects = totalprojects;
        }

        console.log(totalprojects);
      });
  }
  viewTask(title: string) {
    this.router.navigate(['view'], {
      queryParams: { title },
    });
  }
  editTask(task: any) {
    this.selectedTask = task;
    this.showEditPopup = true;
    console.log(task);
    this.ProjectForm.patchValue({
      email: task.email,
      address: task.address,
      name: task.name,
    });
  }
  cancelEdit() {
    this.showEditPopup = false;
    this.ProjectForm.reset();
  }
  updateTask() {
    this.ngxLoader.start();
    this.firestore
      .collection('Profile')
      .doc(this.ProjectForm.value.name)
      .update({
        email: this.ProjectForm.value.email,
        address: this.ProjectForm.value.address,
        name: this.ProjectForm.value.name,
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
  startTask(task: any) {
    this.showPopup = true;
    this.selectedTask = task;
    console.log(this.selectedTask);
  }
  getCompanyData() {
    this.firestore
      .collection('Profile')
      .valueChanges()
      .subscribe((data) => {
        data.forEach((doc: any) => {
          this.companies.push(doc);
          this.name = doc.name;
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
  async allocateUser() {
    console.log(this.selectedTask.title);
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
        .then(() => {
          console.log('File uploaded:', file.name);
          // You can get the file's download URL if needed
          fileRef.getDownloadURL().subscribe((downloadURL) => {
            console.log('Download URL:', downloadURL);

            this.downloadUrlService.setDownloadUrls(downloadURL);
          });
        })
        .catch((error) => {
          console.error('Error uploading file:', file.name, error);
        });
    }
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
        .then(() => {
          console.log('File uploaded:', file.name);
          // You can get the file's download URL if needed
          fileRef.getDownloadURL().subscribe((downloadURL) => {
            console.log('Download URL:', downloadURL);
            this.downloadUrlService.setDownloadUrl(downloadURL);
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
        .then(() => {
          console.log('File uploaded:', file.name);
          // You can get the file's download URL if needed
          fileRef.getDownloadURL().subscribe((downloadURL) => {
            console.log('Download URL:', downloadURL);
            this.downloadUrlService.setDownloadUrlss(downloadURL);
          });
        })
        .catch((error) => {
          console.error('Error uploading file:', file.name, error);
        });
    }
    for (const file of this.selectedFiles3) {
      const filePath = `Project/${this.selectedTask.title}/3D/${file.name}`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, file);

      // Observe the upload progress
      task.percentageChanges().subscribe((percentage) => {
        console.log(`Upload progress: ${percentage}%`);
      });

      // Get notified when the upload is completed successfully
      task
        .then(() => {
          console.log('File uploaded:', file.name);
          // You can get the file's download URL if needed
          fileRef.getDownloadURL().subscribe((downloadURL) => {
            console.log('Download URL:', downloadURL);
            this.downloadUrlService.setDownloadsUrls(downloadURL);
          });
        })
        .catch((error) => {
          console.error('Error uploading file:', file.name, error);
        });
    }
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
        .then(() => {
          console.log('File uploaded:', file.name);
          // You can get the file's download URL if needed
          fileRef.getDownloadURL().subscribe((downloadURL) => {
            console.log('Download URL:', downloadURL);
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
    const uploadPromises = this.selectedFiles.map((file: { name: any }) => {
      const filePath = `Project/${this.selectedTask.title}/Ortho/${file.name}`;
      const taskRef = this.storage.ref(filePath);
      return taskRef.put(file);
    });
    const uploadPromises1 = this.selectedFiles1.map((file: { name: any }) => {
      const filePath = `Project/${this.selectedTask.title}/DEM/${file.name}`;
      const taskRef = this.storage.ref(filePath);
      return taskRef.put(file);
    });
    const uploadPromises2 = this.selectedFiles1.map((file: { name: any }) => {
      const filePath = `Project/${this.selectedTask.title}/Survey/${file.name}`;
      const taskRef = this.storage.ref(filePath);
      return taskRef.put(file);
    });
    const uploadPromises3 = this.selectedFiles1.map((file: { name: any }) => {
      const filePath = `Project/${this.selectedTask.title}/3D/${file.name}`;
      const taskRef = this.storage.ref(filePath);
      return taskRef.put(file);
    });
    const uploadPromises4 = this.selectedFiles1.map((file: { name: any }) => {
      const filePath = `Project/${this.selectedTask.title}/Map/${file.name}`;
      const taskRef = this.storage.ref(filePath);
      return taskRef.put(file);
    });
    // Update the status only for companies with selected files
    const allPromises = [
      uploadPromises,
      uploadPromises1,
      uploadPromises2,
      uploadPromises3,
      uploadPromises4,
    ];
    Promise.all(allPromises).then(() => {
      this.firestore
        .collection('Project')
        .doc(this.selectedTask.title)
        .update({ status: 'Completed', files: filesInfo })
        .then(() => {
          console.log('Project status updated successfully.');
        })
        .catch((error) => {
          console.error('Error updating project status:', error);
        });
    });
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
      this.selectedFiles.splice(index, 1);
    }
  }
  onDelete2(file: File) {
    const index = this.selectedFiles2.indexOf(file);
    if (index > -1) {
      this.selectedFiles.splice(index, 1);
    }
  }
  onDelete3(file: File) {
    const index = this.selectedFiles3.indexOf(file);
    if (index > -1) {
      this.selectedFiles.splice(index, 1);
    }
  }
  onDelete4(file: File) {
    const index = this.selectedFiles4.indexOf(file);
    if (index > -1) {
      this.selectedFiles.splice(index, 1);
    }
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
    this.filteredData = this.companies.filter(
      (company) =>
        company.name.toLowerCase().includes(this.filterValue.toLowerCase()) ||
        company.SPOC.toLowerCase().includes(this.filterValue.toLowerCase()) ||
        company.address.toLowerCase().includes(this.filterValue.toLowerCase())
    );
  }
}
