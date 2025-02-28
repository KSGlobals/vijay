import { Component, OnInit, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ServiceService } from 'src/app/service.service';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import emailjs from '@emailjs/browser';
declare var google: any;
declare var Tiff: any;
@Component({
  selector: 'app-manager-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
})
export class ViewComponent implements OnInit {
  taskTitle!: string;
  showPopup: boolean = false;
  viewForm!: FormGroup;
  url1!: any;
  url2!: string;
  url3!: string;
  url4!: string;
  url5!: string;
  url6!: string;
  url8!: string;
  url9!: string;
  url10!: string;
  url11!: string;
  url12!: string;
  url13!: string;
  url14!: string;
  data!: any;
  img!: any;
  showPopup1 = false;
  showPopup2 = false;
  showPopup3 = false;
  showPopup4 = false;
  showPopup5 = false;
  showPopup6 = false;
  showPopup7 = false;
  url7!: string;
  tifCheckbox = false;
  tifCheckbox1 = false;
  kmlCheckbox2 = false;
  searchTerm: string = '';
  itemsToSearch: string = '';
  searchResults: string = '';
  allItems: string = '';
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private objLoader!: OBJLoader;
  currentUserEmail: string | null = null;
  userName!: string;
  userType!: string;
  extension!: any;

  constructor(
    private route: ActivatedRoute,
    private downloadUrlService: ServiceService,
    private firestore: AngularFirestore,
    private ngZone: NgZone,
    private afAuth: AngularFireAuth,
    private router: Router,
    private storage: AngularFireStorage,
    private fb: FormBuilder,
    private ngxloader: NgxUiLoaderService,
    private toastr: ToastrService
  ) {}
  async ngOnInit() {
    await this.fetch();
    this.viewForm = this.fb.group({ comments: '' });
  }
  profile() {
    this.router.navigate(['manager-profile']);
  }
  delete1() {
    this.ngxloader.start();
    this.showPopup3 = false;
    this.route.queryParams.subscribe(async (params) => {
      const taskTitle = params['title'];
      const name = params['name'];
      await this.getCurrentUserEmail();
      const user = await this.getUsername(this.currentUserEmail);
      const userName = user[0].userType;

      console.log(taskTitle);

      var Messagebody = {
        from: this.currentUserEmail,
        from_name: userName,
        to_name: name,
        subject: 'Delete Request for OrthoFiles',
        message: `Ortho Files Delete Request`,
        mail_to: 'amarnath.vasu@skyx.co.in',
        reply_to: 'amarnath.vasu@skyx.co.in',
        cc_to: 'adarsh@skyx.co.in,amarnath.vasu@skyx.co.in',
      };
      emailjs.init('PG28t0CWuuPLA-Kw1');
      emailjs.send('service_d13p9lv', 'template_27kljbp', Messagebody).then(
        (response) => {
          console.log('SUCCESS!', response.status, response.text);
          this.toastr.success('Email Sent!!!, Success!!!');
          this.firestore.collection('Project').doc(taskTitle).update({
            Downloadurl0: '',
            Downloadurl1: '',
            Downloadurl2: '',
            status: 'Delete Request',
          });
          this.ngxloader.stop();
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        },
        async (error) => {
          console.log('FAILED...', error);
          this.toastr.error(error, 'Error!!!');
          this.ngxloader.stop();
        }
      );
    });
  }
  delete2() {
    this.ngxloader.start();
    this.showPopup4 = false;
    this.route.queryParams.subscribe(async (params) => {
      const taskTitle = params['title'];
      const name = params['name'];
      await this.getCurrentUserEmail();
      const user = await this.getUsername(this.currentUserEmail);
      const userName = user[0].userType;

      console.log(taskTitle);
      var Messagebody = {
        from: this.currentUserEmail,
        from_name: userName,
        to_name: name,
        subject: 'Delete Request for Demfiles',
        message: `Dem files Delete Request`,
        reply_to: 'amarnath.vasu@skyx.co.in',
        cc_to: 'adarsh@skyx.co.in,amarnath.vasu@skyx.co.in',
        mail_to: 'amarnath.vasu@skyx.co.in',
      };
      emailjs.init('PG28t0CWuuPLA-Kw1');
      emailjs.send('service_d13p9lv', 'template_27kljbp', Messagebody).then(
        (response) => {
          console.log('SUCCESS!', response.status, response.text);
          this.toastr.success('Email Sent!!!, Success!!!');
          this.firestore.collection('Project').doc(taskTitle).update({
            Downloadurl3: '',
            Downloadurl4: '',
            Downloadurl5: '',
            status: 'Delete Request',
          });
          this.ngxloader.stop();
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        },
        async (error) => {
          console.log('FAILED...', error);
          this.toastr.error(error, 'Error!!!');
          this.ngxloader.stop();
        }
      );
    });
  }
  delete3() {
    this.ngxloader.start();
    this.showPopup5 = false;
    this.route.queryParams.subscribe(async (params) => {
      const taskTitle = params['title'];
      const name = params['name'];
      await this.getCurrentUserEmail();
      const user = await this.getUsername(this.currentUserEmail);
      const userName = user[0].userType;

      console.log(taskTitle);
      var Messagebody = {
        from: this.currentUserEmail,
        from_name: userName,
        to_name: name,
        subject: 'Delete Request for Survey Files',
        message: `Survey Files Delete Request`,
        reply_to: 'amarnath.vasu@skyx.co.in',
        cc_to: 'adarsh@skyx.co.in,amarnath.vasu@skyx.co.in',
        mail_to: 'amarnath.vasu@skyx.co.in',
      };
      emailjs.init('PG28t0CWuuPLA-Kw1');
      emailjs.send('service_d13p9lv', 'template_27kljbp', Messagebody).then(
        (response) => {
          this.toastr.success('Email Sent!!!, Success!!!');
          this.firestore
            .collection('Project')
            .doc(taskTitle)
            .update({ Downloadurl6: '', status: 'Delete Request' });
          this.ngxloader.stop();
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        },
        async (error) => {
          console.log('FAILED...', error);
          this.toastr.error(error, 'Error!!!');
          this.ngxloader.stop();
        }
      );
    });
  }
  delete4() {
    this.ngxloader.start();
    this.showPopup6 = false;
    this.route.queryParams.subscribe(async (params) => {
      const taskTitle = params['title'];
      const name = params['name'];
      await this.getCurrentUserEmail();
      const user = await this.getUsername(this.currentUserEmail);
      const userName = user[0].userType;

      console.log(taskTitle);
      var Messagebody = {
        from: this.currentUserEmail,
        from_name: userName,
        to_name: name,
        subject: 'Delete Request for 3d files',
        message: `3d files Delete Request`,
        reply_to: 'amarnath.vasu@skyx.co.in',
        cc_to: 'adarsh@skyx.co.in,amarnath.vasu@skyx.co.in',
        mail_to: 'amarnath.vasu@skyx.co.in',
      };
      emailjs.init('PG28t0CWuuPLA-Kw1');
      emailjs.send('service_d13p9lv', 'template_27kljbp', Messagebody).then(
        (response) => {
          console.log('SUCCESS!', response.status, response.text);
          this.toastr.success('Email Sent!!!, Success!!!');
          this.firestore
            .collection('Project')
            .doc(taskTitle)
            .update({ Downloadurl7: '', status: 'Delete Request' });
          this.ngxloader.stop();
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        },
        async (error) => {
          console.log('FAILED...', error);
          this.toastr.error(error, 'Error!!!');
          this.ngxloader.stop();
        }
      );
    });
  }
  delete5() {
    this.ngxloader.start();
    this.showPopup7 = false;
    this.route.queryParams.subscribe(async (params) => {
      const taskTitle = params['title'];
      const name = params['name'];
      await this.getCurrentUserEmail();
      const user = await this.getUsername(this.currentUserEmail);
      const userName = user[0].userType;

      console.log(taskTitle);
      var Messagebody = {
        from: this.currentUserEmail,
        from_name: userName,
        to_name: name,
        subject: 'Delete Request for KMZ files',
        message: `KMZ files Delete Request`,
        reply_to: 'amarnath.vasu@skyx.co.in',
        cc_to: 'adarsh@skyx.co.in,amarnath.vasu@skyx.co.in',
        mail_to: 'amarnath.vasu@skyx.co.in',
      };
      emailjs.init('PG28t0CWuuPLA-Kw1');
      emailjs.send('service_d13p9lv', 'template_27kljbp', Messagebody).then(
        (response) => {
          console.log('SUCCESS!', response.status, response.text);
          this.toastr.success('Email Sent!!!, Success!!!');
          this.firestore.collection('Project').doc(taskTitle).update({
            Downloadurl8: '',
            Downloadurl9: '',
            Downloadurl10: '',
            status: 'Delete Request',
          });
          this.ngxloader.stop();
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        },
        async (error) => {
          console.log('FAILED...', error);
          this.toastr.error(error, 'Error!!!');
          this.ngxloader.stop();
        }
      );
    });
  }
  async fetch() {
    await this.getCurrentUserEmail();
    const user = await this.getUsername(this.currentUserEmail);
    this.userName = user[0].userName;
    this.userType = user[0].userType;
    this.route.queryParams.subscribe((params) => {
      const taskTitle = params['title'];
      console.log(taskTitle);
      this.taskTitle = taskTitle;
      this.firestore
        .collection('Project')
        .doc(taskTitle)
        .valueChanges()
        .subscribe((data: any) => {
          console.log(data);
          this.data = data;
          if (data) {
            this.url1 = data.Downloadurl1; // orth0
            this.url2 = data.Downloadurl4; //dem
            this.url3 = data.Downloadurl6; //sur
            this.url4 = data.Downloadurl7; //3d
            this.url5 = data.Downloadurl8; //map
            this.url6 = data.Downloadurl9;
            this.url7 = data.Downloadurl10;
            this.url8 = data.Downloadurl2;
            this.url9 = data.Downloadurl5;
            this.url10 = data.Downloadurl0;
            this.url11 = data.Downloadurl3;
            this.url12 = data.Downloadurl7;
            this.url13 = data.Downloadurl9;
            this.url14 = data.Downloadurl13;
          }
        });
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
  back() {
    this.router.navigate(['manager-project-view']);
  }
  closePopup() {
    this.showPopup = false;
  }
  showpopup() {
    this.showPopup = true;
  }
  closePopup1() {
    this.showPopup1 = false;
  }
  closePopup2() {
    this.showPopup2 = false;
  }

  showpopup1() {
    this.showPopup1 = true;
  }
  showpopup2() {
    this.showPopup2 = true;
  }
  showpopup3() {
    this.showPopup3 = true;
  }
  showpopup4() {
    this.showPopup4 = true;
  }
  showpopup5() {
    this.showPopup5 = true;
  }
  showpopup6() {
    this.showPopup6 = true;
  }
  showpopup7() {
    this.showPopup7 = true;
  }
  closePopup3() {
    this.showPopup3 = false;
  }
  closePopup4() {
    this.showPopup4 = false;
  }
  closePopup5() {
    this.showPopup5 = false;
  }
  closePopup6() {
    this.showPopup6 = false;
  }
  closePopup7() {
    this.showPopup7 = false;
  }
  download1(url: string) {
    this.downloadFile(url);
  }

  download2(url: string) {
    this.downloadFile(url);
  }

  download3(url: string) {
    this.downloadFile(url);
  }

  download4(url: string) {
    this.downloadFile(url);
  }

  download(url: string) {
    this.downloadFile(url);
  }

  downloadFile(downloadUrl: any) {
    console.log(downloadUrl);

    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.target = '_blank';
      link.click();
    } else {
      console.error('Download URL not available.');
    }
  }
  view1() {
    const tifCheckbox: boolean = false;
    const tifCheckbox1: boolean = false;
    const kmlCheckbox2: boolean = true;
    this.route.queryParams.subscribe((params) => {
      const taskTitle = params['title'];
      this.firestore
        .collection('Project')
        .doc(taskTitle)
        .valueChanges()
        .subscribe((data: any) => {
          if (data) {
            this.router.navigate(['manager-map'], {
              queryParams: {
                taskTitle,
                tifCheckbox,
                tifCheckbox1,
                kmlCheckbox2,
              },
            });
          }
        });
    });
  }
  view2() {
    this.route.queryParams.subscribe((params) => {
      const taskTitle = params['title'];
      this.firestore
        .collection('Project')
        .doc(taskTitle)
        .valueChanges()
        .subscribe((data: any) => {
          if (data) {
            this.router.navigate(['manager-3d'], {
              queryParams: {
                taskTitle,
              },
            });
          }
        });
    });
  }
  view3() {
    const tifCheckbox: boolean = true;
    const tifCheckbox1: boolean = false;
    const kmlCheckbox2: boolean = false;
    this.route.queryParams.subscribe((params) => {
      const taskTitle = params['title'];
      this.firestore
        .collection('Project')
        .doc(taskTitle)
        .valueChanges()
        .subscribe((data: any) => {
          if (data) {
            const tiffFileUrl = data.Downloadurl1; // URL for the TIFF file in Firestore
            this.getFileExtension(tiffFileUrl);
            console.log(this.extension);

            if (this.extension === 'pdf') {
              window.open(tiffFileUrl);
            } else {
              this.router.navigate(['manager-map'], {
                queryParams: {
                  taskTitle,
                  tifCheckbox,
                  tifCheckbox1,
                  kmlCheckbox2,
                },
              });
            }
          }
        });
    });
  }
  view4() {
    const tifCheckbox1: boolean = true;
    const tifCheckbox: boolean = false;
    const kmlCheckbox2: boolean = false;
    this.route.queryParams.subscribe((params) => {
      const taskTitle = params['title'];
      this.firestore
        .collection('Project')
        .doc(taskTitle)
        .valueChanges()
        .subscribe((data: any) => {
          if (data) {
            const tiffFileUrl = data.Downloadurl4;
            this.getFileExtension(tiffFileUrl);
            console.log(this.extension);

            if (this.extension === 'pdf') {
              window.open(tiffFileUrl);
            } else {
              this.router.navigate(['manager-map'], {
                queryParams: {
                  taskTitle,
                  tifCheckbox,
                  tifCheckbox1,
                  kmlCheckbox2,
                },
              });
            }
          }
        });
    });
  }
  view5() {
    this.route.queryParams.subscribe((params) => {
      const taskTitle = params['title'];
      this.firestore
        .collection('Project')
        .doc(taskTitle)
        .valueChanges()
        .subscribe((data: any) => {
          if (data) {
            const tiffFileUrl = data.Downloadurl6;
            this.getFileExtension(tiffFileUrl);
            console.log(this.extension);

            if (this.extension === 'pdf') {
              window.open(tiffFileUrl);
            } else {
              this.router.navigate(['manager-map'], {
                queryParams: {
                  taskTitle,
                },
              });
            }
          }
        });
    });
  }
  // openTiffInNewTab(tiffFileUrl: string) {
  //   if (tiffFileUrl) {
  //     const xhr = new XMLHttpRequest();
  //     xhr.responseType = 'arraybuffer';
  //     xhr.open('GET', tiffFileUrl);
  //     xhr.onload = (e) => {
  //       const tiff = new Tiff({ buffer: xhr.response });
  //       const canvas = tiff.toCanvas();

  //       // Create a new HTML document in a new tab
  //       const newTab = window.open();
  //       if (newTab) {
  //         // Create an HTML document in the new tab
  //         const newDoc = newTab.document;
  //         newDoc.open();
  //         newDoc.write(
  //           '<html><head><title>TIFF Viewer</title></head><body></body></html>'
  //         );

  //         // Append the canvas to the body of the new document
  //         newDoc.body.appendChild(canvas);
  //         console.log(canvas);

  //         // Close the document for writing and display it
  //         newDoc.close();
  //       } else {
  //         console.error('Failed to open a new tab.');
  //       }
  //     };
  //     xhr.send();
  //   } else {
  //     console.error('TIFF file URL not available.');
  //   }
  // }
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
// async toggleTIF1() {
//   this.tifCheckbox1 = !this.tifCheckbox1;

//   if (this.tifCheckbox1) {
//     this.route.queryParams.subscribe((params) => {
//       const taskTitle = params['taskTitle'];
//       this.firestore
//         .collection('Project')
//         .doc(taskTitle)
//         .valueChanges()
//         .subscribe((data: any) => {
//           if (data) {
//             this.url =
//               'https://firebasestorage.googleapis.com/v0/b/insco-f6c09.appspot.com/o/DEM_Palette.tif?alt=media&token=0518d3f1-e300-4b53-a753-5e58c172755a';
//           }
//         });
//     });

//     try {
//       const response = await fetch(this.url);
//       const arrayBuffer = await response.arrayBuffer();

//       const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
//       const image = await tiff.getImage();

//       const bbox = image.getBoundingBox();

//       // Create a polygon using the bounding box coordinates
//       this.tifLayer1 = L.polygon([
//         [bbox[1], bbox[0]], // Upper-left corner
//         [bbox[3], bbox[0]], // Upper-right corner
//         [bbox[3], bbox[2]], // Lower-right corner
//         [bbox[1], bbox[2]], // Lower-left corner
//         [bbox[1], bbox[0]],
//       ]);

//       // Add the polygon to the map
//       this.tifLayer1.addTo(this.map);

//       // Fit the map to the polygon bounds
//       this.map.fitBounds(this.tifLayer1.getBounds());

//       // Create a bounding box polygon
//       const boundingBoxPolygon = L.polygon([
//         [bbox[1], bbox[0]], // Upper-left corner
//         [bbox[3], bbox[0]], // Upper-right corner
//         [bbox[3], bbox[2]], // Lower-right corner
//         [bbox[1], bbox[2]], // Lower-left corner
//         [bbox[1], bbox[0]],
//       ]);

//       this.drawnItems = new L.FeatureGroup();
//       this.map.addLayer(this.drawnItems);

//       this.drawControl = new L.Control.Draw({
//         edit: {
//           featureGroup: this.drawnItems,
//         },
//         draw: {
//           polygon: false,
//           polyline: {
//             shapeOptions: {
//               color: 'blue',
//               weight: 4,
//             },
//             icon: new L.DivIcon({
//               className: 'leaflet-div-icon',
//               iconSize: [0, 0],
//             }),
//           },
//           circle: false,
//           rectangle: false,
//           marker: false,
//         },
//       });

//       this.map.addControl(this.drawControl);
//       let volumeCalculated = false;
//       this.map.on(L.Draw.Event.CREATED, (e: any) => {
//         let layer = e.layer;
//         let height: number = 0;

//         // Check if the drawn item is within the bounding box
//         if (boundingBoxPolygon.getBounds().contains(layer.getBounds())) {
//           this.drawnItems.addLayer(layer);

//           // Calculate and display the length of the drawn line
//           const latLngs = layer.getLatLngs();
//           const lengthInMeters = L.GeometryUtil.length(latLngs);
//           layer
//             .bindPopup(`Length: ${lengthInMeters.toFixed(2)} meters`)
//             .openPopup();

//           // Calculate and display the area
//           const areaInSquareMeters = L.GeometryUtil.geodesicArea(latLngs);
//           layer
//             .bindPopup(
//               `Length: ${lengthInMeters.toFixed(
//                 2
//               )} meters<br>Area: ${areaInSquareMeters.toFixed(
//                 2
//               )} square meters`
//             )
//             .openPopup();

//           // After the area popup is shown, listen for a new line drawn
//           layer.on('popupopen', () => {
//             this.map.on(L.Draw.Event.CREATED, (e: any) => {
//               const newLayer = e.layer;
//               const newLatLngs = newLayer.getLatLngs();

//               // Calculate the length of the new line (in the Z-axis)
//               const newLengthInMeters = L.GeometryUtil.length(newLatLngs);
//               // Save the height to the 'height' variable
//               height = newLengthInMeters;
//               const volume = areaInSquareMeters * height;
//               layer.bindPopup(`Volume: ${volume.toFixed(2)}`).openPopup();
//               // Enable drawing for the next line
//               volumeCalculated = true; // Mark volume calculation as done

//               // Disable drawing after volume calculation
//               this.drawControl._toolbars.draw._modes.polyline.handler.disable();
//             });

//             // Enable the draw control for drawing a new line
//             this.drawControl.setDrawingOptions({
//               polyline: {
//                 shapeOptions: {
//                   color: 'blue',
//                   weight: 4,
//                 },
//                 icon: new L.DivIcon({
//                   className: 'leaflet-div-icon',
//                   iconSize: [0, 0],
//                 }),
//               },
//             });
//             this.drawControl._toolbars.draw._modes.polyline.handler.enable();

//             // Calculate and display the volume
//           });
//         } else {
//           // If the drawn item is outside the bounding box, remove it
//           this.map.removeLayer(layer);
//         }
//       });
//     } catch (error) {
//       console.error('Error loading GeoTIFF:', error);
//     }
//   } else if (!this.tifCheckbox1) {
//     // Remove the polygon and drawn items from the map
//     this.map.removeLayer(this.tifLayer1);
//     this.map.eachLayer((layer) => {
//       if (layer instanceof L.FeatureGroup) {
//         this.map.removeLayer(layer);
//       }
//     });

//     // Remove the draw control
//     this.map.removeControl(this.drawControl);
//   }
// }
