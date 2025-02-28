import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
// import { first } from 'rxjs/operators';
import { FormBuilder } from '@angular/forms';
import { ServiceService } from 'src/app/service.service';
import emailjs from '@emailjs/browser';
import * as GeoTIFF from 'geotiff';
import JSZip from 'jszip';
// @ts-ignore
import { google } from 'googlemaps';
declare const google: any;
@Component({
  selector: 'app-task-page',
  templateUrl: './project-table.component.html',
  styleUrls: ['./project-table.component.scss'],
})
export class ProjectTableComponent implements OnInit {
  companies: any[] = [];
  searchTerm: string = '';
  filteredCompanies: any[] = [];
  ProjectForm: any;
  showEditPopup: boolean = false;
  selectedCompanies: any[] = [];
  selectedFiles: any[] = [];
  selectedFiles1: any[] = [];
  selectedFiles2: any[] = [];
  selectedFiles3: any[] = [];
  selectedFiles4: any[] = [];
  selectedFiles5: any[] = [];
  toggle: boolean = false;
  todayFormatted: any;
  threedzip: any;
  email: any;
  extension!: any;
  selectedTask: any;
  projects: any[] = [];
  showPopup: boolean = false;
  showPopup1: boolean = false;
  value: any;
  currentUserEmail: string | null = null;
  userName!: string;
  userType!: string;
  filteredData: any[] = [];
  date!: any;
  filterValue: string = '';
  img!: any;
  selectedCompany!: string;
  selectedSPOC: string[] = [];
  documentId: string[] = [];
  projectManagers: string[] = [];
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
    private cdr: ChangeDetectorRef,
    private afAuth: AngularFireAuth
  ) {
    this.getCompanyData();
    this.filteredCompanies = [...this.companies];
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    this.todayFormatted = `${year}-${month}-${day}`;
    console.log(this.todayFormatted);
  }
  toggling() {
    this.toggle = !this.toggle;
  }
  async ngOnInit() {
    await this.fetch();
    this.ProjectForm = this.formBuilder.group({
      title: '',
      SPOC: '',
      manager: '',
      company: '',
      ortho: '',
      dem: '',
      map: '',
      td: '',
      sd: '',
      url: '',
    });
    this.firestore
      .collection('Profile')
      .valueChanges()
      .subscribe((data: any) => {
        this.documentId = data.map((company: any) => company.name);
      });
    // Listen to changes in the 'company' field and fetch SPOC from Firestore
    this.ProjectForm.get('company').valueChanges.subscribe(
      (selectedCompany: string | undefined) => {
        if (selectedCompany) {
          this.firestore
            .collection('Profile')
            .ref.where('name', '==', selectedCompany)
            .get()
            .then((querySnapshot: any) => {
              if (!querySnapshot.empty) {
                const profile = querySnapshot.docs[0].data();
                if (profile && profile.SPOC) {
                  this.ProjectForm.patchValue({ SPOC: profile.SPOC });
                } else {
                  this.ProjectForm.patchValue({ SPOC: '' });
                }
              } else {
                // Handle the case where no matching documents were found
                this.ProjectForm.patchValue({ SPOC: '' });
              }
            })
            .catch((error: any) => {
              console.error('Error getting documents: ', error);
            });
        }
      }
    );
  }
  delete(task: any) {
    this.showDeletePopup = true;
    this.deleteselectedTask = task;
  }
  camceldelete() {
    this.showDeletePopup = false;
  }
  reTask(task: any) {
    this.showPopup1 = true;
    this.selectedTask = task;
    console.log(this.selectedTask.title);
    this.firestore
      .collection('Project')
      .doc(this.selectedTask.title)
      .valueChanges()
      .subscribe((data: any) => {
        this.value = data;
      });
  }
  closePopup1() {
    this.showPopup1 = false;
  }
  async deleteTask(task: any) {
    this.ngxLoader.start();
    await this.firestore.collection('Project').doc(task.title).delete();
    // Delete the folder and its contents
    const path = `Project/${task.title}`;
    await this.deleteFolder(path);
    setTimeout(() => {
      this.ngxLoader.stop();
      window.location.reload();
    }, 3000);
  }
  async deleteFolder(path: any) {
    try {
      const ref = this.storage.ref(path);
      const dir = ref.list() as any;
      const name = await dir.toPromise();
      console.log(name.items);
      await Promise.all(
        name.items.map(async (fileRef: any) => {
          const fileName = fileRef.name;
          console.log(fileName);
          await this.deleteFile(ref, fileName);
        })
      );
      await name.prefixes.map((folderRef: { fullPath: any }) =>
        this.deleteFolder(folderRef.fullPath)
      );
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
  }

  async deleteFile(ref: any, fileName: any) {
    const childRef = ref.child(fileName);
    await childRef.delete();
  }
  fetchSPOC() {
    if (this.selectedCompany) {
      // Replace 'yourCollectionName' with the actual name of your Firestore collection
      this.firestore
        .collection('Profile', (ref) =>
          ref.where('name', '==', this.selectedCompany)
        )
        .get()
        .subscribe((snapshot) => {
          // Cast the data to the expected type
          this.selectedSPOC = snapshot.docs.map((doc) => {
            const managerData = doc.data() as { SPOC: string }; // Cast to the expected type
            return managerData.SPOC;
          });
        });
      this.firestore
        .collection('Project Manager', (ref) =>
          ref.where('company', '==', this.selectedCompany)
        )
        .get()
        .subscribe((snapshot) => {
          this.projectManagers = snapshot.docs.map((doc) => {
            const managerData = doc.data() as { name: string }; // Cast to the expected type
            return managerData.name;
          });
        });
    } else {
      this.selectedSPOC = []; // Reset the SPOC if no company is selected
      this.projectManagers = []; // Reset the project managers if no company is selected
    }
  }
  profile() {
    this.router.navigate(['profile']);
  }
  async fetch() {
    this.firestore
      .collection('Project')
      .valueChanges()
      .subscribe((data) => {
        this.projects = data;
        console.log(this.projects);
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
  editTask(task: any) {
    this.selectedTask = task;
    this.showEditPopup = true;
    console.log(task);
    this.ProjectForm.patchValue({
      title: task.title,
      SPOC: task.SPOC,
      company: task.company,
      manager: task.manager,
    });
  }
  cancelEdit() {
    this.showEditPopup = false;
    this.ProjectForm.reset();
  }
  updateTask() {
    this.ngxLoader.start();
    this.firestore
      .collection('Project')
      .doc(this.ProjectForm.value.title)
      .update({
        SPOC: this.ProjectForm.value.SPOC,
        manager: this.ProjectForm.value.manager,
        company: this.ProjectForm.value.company,
        title: this.ProjectForm.value.title,
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
  async getUploadername(
    currentUserEmail: any
  ): Promise<{ userName: string; userType: string }[]> {
    if (currentUserEmail) {
      try {
        const querySnapshot = await this.firestore
          .collection('All Users')
          .ref.where('email', '==', currentUserEmail)
          .get();

        if (!querySnapshot.empty) {
          const userArray: { userName: string; userType: string }[] = [];

          querySnapshot.forEach((doc) => {
            const currentUserDoc = doc.data() as {
              name: string;
              email: string;
            };
            const userName = currentUserDoc.name;
            const userType = currentUserDoc.email;

            userArray.push({ userName, userType });

            console.log('Current User Name:', userName);
            console.log('Current User Type:', userType);
          });

          return userArray;
        } else {
          console.error('User document not found.');
          // Handle the case where the user document is not found.
          throw new Error('User document not found');
        }
      } catch (error) {
        console.error('Error fetching user document:', error);
        throw error;
      }
    } else {
      console.log('User is not logged in.');
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
  viewTask(title: string, name: any) {
    this.router.navigate(['view'], {
      queryParams: {
        title,
        name,
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
      console.log(user);

      const userName = user[0].userName;
      const userType = user[0].userType;
      console.log(this.selectedTask.title);
      const zip = new JSZip();
      const zip1 = new JSZip();
      const existingZip = new JSZip();
      if (userName && userType) {
        const uploadPromises: any[] = [];
        if (this.showPopup) {
          this.showPopup = false;
        } else if (this.showPopup1) {
          this.showPopup1 = false;
        }
        if (this.selectedFiles5.length > 0) {
          for (let file of this.selectedFiles5) {
            const filePath = `Project/${this.selectedTask.title}/Split/${file.name}`;
            const fileRef = this.storage.ref(filePath);
            const task = this.storage.upload(filePath, file);

            // Observe the upload progress
            task.percentageChanges().subscribe((percentage) => {
              console.log(`Upload progress: ${percentage}%`);
            });
            await task;
            const uploadPromise = await task.then((snapshot) => {
              // console.log(currentIndex);
              console.log('File uploaded:', file.name);
              // You can get the file's download URL if needed
            });
            uploadPromises.push(uploadPromise);
          }
        }
        const uploadFiles = async (
          files: any[],
          folderPath: string,
          currentIndex: number
        ) => {
          for (const file of files) {
            console.log(currentIndex);

            const filePath = `Project/${this.selectedTask.title}/${folderPath}/${file.name}`;
            const fileRef = this.storage.ref(filePath);
            const task = this.storage.upload(filePath, file);

            // Observe the upload progress
            task.percentageChanges().subscribe((percentage) => {
              console.log(`Upload progress: ${percentage}%`);
            });

            const uploadPromise = await task
              .then((snapshot) => {
                // console.log(currentIndex);
                console.log('File uploaded:', file.name);
                // You can get the file's download URL if needed
                return fileRef.getDownloadURL().toPromise();
              })
              .then(async (downloadURL) => {
                this.getFileExtension(downloadURL);
                if (folderPath === 'DEM' && this.extension === 'tif') {
                  this.firestore
                    .collection('Project')
                    .doc(this.selectedTask.title)
                    .update({ Downloadurl12: downloadURL });
                }
                // console.log(currentIndex);
                const downloadUrlField = `Downloadurl${currentIndex}`;
                // console.log(downloadUrlField);
                this.firestore
                  .collection('Project')
                  .doc(this.selectedTask.title)
                  .update({ [downloadUrlField]: downloadURL });
                console.log(downloadUrlField, ':', downloadURL);
                if (folderPath === 'Ortho') {
                  zip1.file(`1. Ortho Rectified Image/${file.name}`, file, {
                    createFolders: false,
                  });
                }
                if (folderPath === 'DEM') {
                  zip1.file(`3. DEM/${file.name}`, file, {
                    createFolders: false,
                  });
                }
                if (folderPath === 'Survey') {
                  zip1.file(`2. Survey Drawing/${file.name}`, file, {
                    createFolders: false,
                  });
                }
                if (folderPath === 'Map') {
                  zip1.file(`4. KML Files/${file.name}`, file, {
                    createFolders: false,
                  });
                }
                return downloadURL;
              })
              .catch((error) => {
                console.error('Error uploading file:', file.name, error);
                throw error;
              });

            uploadPromises.push(uploadPromise);

            currentIndex++;
          }
        };
        const uploadFile = async (
          files: any[],
          folderPath: string,
          currentIndex: number
        ) => {
          const uploadPromises: any[] = [];

          for (const file of files) {
            console.log(currentIndex);

            const filePath = `Project/${this.selectedTask.title}/${folderPath}/${file.name}`;
            const fileRef = this.storage.ref(filePath);
            const task = this.storage.upload(filePath, file);

            // Observe the upload progress
            task.percentageChanges().subscribe((percentage) => {
              console.log(`Upload progress: ${percentage}%`);
            });

            const uploadPromise = await task
              .then((snapshot) => {
                console.log('File uploaded:', file.name);
                return fileRef.getDownloadURL().toPromise();
              })
              .then((downloadURL) => {
                const downloadUrlField = `Downloadurl${currentIndex}`;
                console.log(downloadUrlField, ':', downloadURL);
                zip.file(`${folderPath}/${file.name}`, file, {
                  createFolders: false,
                });
                return downloadURL;
              })
              .catch((error) => {
                console.error('Error uploading file:', file.name, error);
                throw error;
              });

            uploadPromises.push(uploadPromise);

            currentIndex++;
          }

          // Generate a blob from the zip and upload it to Firebase Storage
          const zipBlob = await zip.generateAsync({ type: 'blob' });
          zip1.file(
            `5. 3D Model/3D file of ${this.selectedTask.title}.zip`,
            zipBlob,
            {
              createFolders: false,
            }
          );
          const zipPath = `Project/${this.selectedTask.title}/${folderPath}/3D Files of${folderPath}.zip`;
          const zipFileRef = this.storage.ref(zipPath);
          const zipUploadTask = this.storage.upload(zipPath, zipBlob);
          zipUploadTask.percentageChanges().subscribe((percentage) => {
            console.log(`Upload progress: ${percentage}%`);
          });
          // Wait for the zip file to be uploaded
          await zipUploadTask;

          // Get the download URL for the zip file
          const zipDownloadURL = await zipFileRef.getDownloadURL().toPromise();
          this.firestore
            .collection('Project')
            .doc(this.selectedTask.title)
            .update({
              Downloadurl7: zipDownloadURL,
            });
          console.log(`Downloadurl7:`, zipDownloadURL);

          console.log('Zip file uploaded:', zipPath);
          console.log('Zip file download URL:', zipDownloadURL);

          // Push the promise for the zip file upload to the array
          uploadPromises.push(zipUploadTask);
        };

        let currentIndex = 0;
        if (this.selectedFiles) {
          await uploadFiles(this.selectedFiles, 'Ortho', currentIndex);
        }
        let currentIndex1 = 3;
        if (this.selectedFiles1) {
          await uploadFiles(this.selectedFiles1, 'DEM', currentIndex1);
        }
        let currentIndex2 = 6;
        if (this.selectedFiles2) {
          await uploadFiles(this.selectedFiles2, 'Survey', currentIndex2);
        }
        let currentIndex3 = 7;
        if (this.selectedFiles3) {
          await uploadFile(this.selectedFiles3, '3D View', currentIndex3);
        }
        let currentIndex4 = 8;
        if (this.selectedFiles4) {
          await uploadFiles(this.selectedFiles4, 'Map', currentIndex4);
        }

        const allSelectedFiles = [
          ...this.selectedFiles,
          ...this.selectedFiles1,
          ...this.selectedFiles2,
          ...this.selectedFiles3,
          ...this.selectedFiles4,
        ];
        const zipBlob = await zip1.generateAsync({ type: 'blob' });
        const zipPath = `Project/${this.selectedTask.title}/All Files of ${this.selectedTask.title}.zip`;
        const zipFileRef = this.storage.ref(zipPath);
        const zipUploadTask = this.storage.upload(zipPath, zipBlob);
        zipUploadTask.percentageChanges().subscribe((percentage) => {
          console.log(`Upload progress: ${percentage}%`);
        });
        // Wait for the zip file to be uploaded
        await zipUploadTask;

        // Get the download URL for the zip file
        const zipDownloadURL = await zipFileRef.getDownloadURL().toPromise();
        this.firestore
          .collection('Project')
          .doc(this.selectedTask.title)
          .update({
            Downloadurl11: zipDownloadURL,
          });
        uploadPromises.push(zipUploadTask);
        Promise.all(uploadPromises)
          .then((downloadUrls) => {
            const filesInfo = allSelectedFiles.map((file) => ({
              name: file.name,
              size: file.size,
              type: file.type,
            }));

            return this.firestore
              .collection('Project')
              .doc(this.selectedTask.title)
              .update({
                status: 'In Approval',
                files: filesInfo,
                uploadedBy: userName,
                uploadedDate: this.todayFormatted,
                url: this.ProjectForm.value.url,
              })
              .then(async () => {
                console.log('Project status updated successfully.');
                this.ngxLoader.stop();
                setTimeout(() => {
                  window.location.reload();
                }, 3000);
              });
          })
          .catch((error) => {
            console.error('Error updating project status:', error);
            this.ngxLoader.stop();
            // setTimeout(() => {
            //   window.location.reload();
            // }, 3000);
          });
      }
    } catch (error) {
      console.log(error);
      this.ngxLoader.stop();
      // setTimeout(() => {
      //   window.location.reload();
      // }, 3000);
    }
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
  onFileSelected5(event: any) {
    const files: File[] = event.target.files;
    for (let i = 0; i < files.length; i++) {
      this.selectedFiles5.push(files[i]);
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
  onDelete5(file: File) {
    const index = this.selectedFiles5.indexOf(file);
    if (index > -1) {
      this.selectedFiles5.splice(index, 1);
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
  async approve(task: any) {
    this.selectedTask = task;
    console.log(this.selectedTask.uploadedBy);

    this.firestore
      .collection('Project')
      .doc(this.selectedTask.title)
      .update({ status: 'Completed' });
    await this.getCurrentUserEmail();

    console.log(this.currentUserEmail);
    const Name = await this.getUploadername(this.currentUserEmail);
    const userName = Name[0].userName;
    const userType = Name[0].userType;
    console.log(this.email);
    var Messagebody = {
      from: this.currentUserEmail,
      from_name: userName,
      to_name: this.selectedTask.uploadedBy,
      subject: 'Response for Approval',
      message: 'The Documents that you have Uploaded is Approved Successfully',
      mail_to: userType,
      reply_to: this.currentUserEmail,
      cc_to: 'adarsh@skyx.co.in,amarnath.vasu@skyx.co.in',
    };
    emailjs.init('PG28t0CWuuPLA-Kw1');
    emailjs.send('service_d13p9lv', 'template_27kljbp', Messagebody).then(
      (response) => {
        console.log('SUCCESS!', response.status, response.text);
        this.firestore
          .collection('All Users')
          .doc(this.selectedTask.uploadedBy)
          .get()
          .pipe()
          .subscribe((userDoc) => {
            if (userDoc.exists) {
              const userData = userDoc.data() as { email: any };
              console.log('Email:', userData.email);
              // Access specific fields if needed
              this.email = userData?.email;
            } else {
              console.error('User document not found.');
              this.router.navigate(['login']);
              // Handle the case where the user document is not found.
              throw new Error('User document not found');
            }
          });
        this.toastr.success('Email Sent!!!, Success!!!');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      },
      async (error) => {
        console.log('FAILED...', error);
        this.toastr.error(error, 'Error!!!');
        await this.firestore
          .collection('Project')
          .doc(this.selectedTask.title)
          .update({ status: 'In Approval' });
      }
    );
  }
  async deny(task: any) {
    this.selectedTask = task;
    console.log(this.selectedTask.uploadedBy);

    this.firestore
      .collection('Project')
      .doc(this.selectedTask.title)
      .update({ status: 'In Progress' });
    await this.getCurrentUserEmail();
    console.log(this.currentUserEmail);
    const Name = await this.getUploadername(this.currentUserEmail);
    const userName = Name[0].userName;
    const userType = Name[0].userType;
    var Messagebody = {
      from: this.currentUserEmail,
      from_name: userName,
      to_name: this.selectedTask.uploadedBy,
      subject: 'Response for Approval',
      message: 'The Documents that you have Uploaded is Denied',
      mail_to: userType,
      reply_to: this.currentUserEmail,
      cc_to: 'adarsh@skyx.co.in,amarnath.vasu@skyx.co.in',
    };
    emailjs.init('PG28t0CWuuPLA-Kw1');
    emailjs.send('service_d13p9lv', 'template_27kljbp', Messagebody).then(
      (response) => {
        console.log('SUCCESS!', response.status, response.text);
        this.firestore
          .collection('All Users')
          .doc(this.selectedTask.uploadedBy)
          .get()
          .pipe()
          .subscribe((userDoc) => {
            if (userDoc.exists) {
              const userData = userDoc.data() as { email: any };
              console.log('Email:', userData.email);
              // Access specific fields if needed
              this.email = userData.email;
            } else {
              console.error('User document not found.');
              this.router.navigate(['login']);
              // Handle the case where the user document is not found.
              throw new Error('User document not found');
            }
          });

        const path = `Project/${this.selectedTask.title}`;
        this.deleteFolder(path)
          .then(() => {
            console.log('Folder deleted successfully.');
          })
          .catch((error) => {
            console.error('Error deleting folder:', error);
          });
        this.toastr.success('Email Sent!!!, Success!!!');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      },
      async (error) => {
        console.log('FAILED...', error);
        this.toastr.error(error, 'Error!!!');
        await this.firestore
          .collection('Project')
          .doc(this.selectedTask.title)
          .update({ status: 'In Approval' });
      }
    );
  }
}
