import { Component, OnInit } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
// import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
// @ts-ignore
import { google } from 'googlemaps';
declare const google: any;
@Component({
  selector: 'app-admin-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
})
export class ProjectsComponent implements OnInit {
  map!: google.maps.Map;
  marker!: google.maps.Marker;
  autocomplete!: google.maps.places.Autocomplete;
  insuranceForm: any;
  selectedCompany!: string;
  selectedSPOC: string[] = [];
  selectedVehicleType!: string;
  suggestions: string[] = [];
  selectedLocation: string = '';
  showPopup: boolean = false;
  selectedFiles: File[] = [];
  arrayValue: string[] = [];
  filteredCompanies: string[] = [];
  inputValue: string = '';
  newItem: any;
  documentId: any[] = [];
  currentUserEmail: string | null = null;
  userName!: string;
  userType!: string;
  projectManagers: string[] = [];
  showSearchInput: boolean = false;
  img!: any;
  constructor(
    private formBuilder: FormBuilder,
    private ngxLoader: NgxUiLoaderService,
    private toastr: ToastrService,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private router: Router,
    private http: HttpClient,
    private afAuth: AngularFireAuth
  ) {
    this.newItem = {};
  }

  async ngOnInit() {
    await this.fetch();
  }
  profile() {
    this.router.navigate(['admin-profile']);
  }
  async fetch() {
    this.insuranceForm = this.formBuilder.group({
      title: '',
      workorder: '',
      location: [''],
      SPOC: '',
      scope: '',
      manager: '',
      company: '',
      date: '',
      due: '',
      status: 'Pending',
      uploadedBy: 'Not Uploaded',
      uploadedDate: 'Not Uploaded',
    });
    this.fetchDocumentId().then((ids) => {
      this.documentId = ids;
    });

    await this.getCurrentUserEmail();
    const user = await this.getUsername(this.currentUserEmail);
    this.userName = user[0].userName;
    this.userType = user[0].userType;
    this.firestore
      .collection('Profile')
      .valueChanges()
      .subscribe((data: any) => {
        this.documentId = data.map((company: any) => company.name);
      });

    // Listen to changes in the 'company' field and fetch SPOC from Firestore
    // this.insuranceForm
    //   .get('company')
    //   .valueChanges.subscribe((selectedCompany: string | undefined) => {
    //     if (selectedCompany) {
    //       this.firestore
    //         .collection('Profile')
    //         .doc(selectedCompany)
    //         .valueChanges()
    //         .subscribe((profile: any) => {
    //           if (profile && profile.SPOC) {
    //             this.insuranceForm.patchValue({ SPOC: profile.SPOC });
    //           } else {
    //             this.insuranceForm.patchValue({ SPOC: '' });
    //           }
    //         });
    //     }
    //   });
    this.firestore
      .collection('All Users')
      .doc(this.userName)
      .valueChanges()
      .subscribe((data: any) => {
        console.log(data);

        this.img = data.url;
        console.log(this.img);
      });
    this.loadGoogleMaps();
  }
  loadGoogleMaps() {
    const script = document.createElement('script');
    script.src =
      'https://maps.googleapis.com/maps/api/js?key=AIzaSyDTI2DGMMAdm3AAN8AtnqcXr2h01mFkaLg&callback=initializeMap&libraries=drawing,geometry,places';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      this.initializeMap();
    };

    script.onerror = () => {
      console.error('Failed to load Google Maps script.');
    };

    document.head.appendChild(script);
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
  toggleSearchInput() {
    this.showSearchInput = !this.showSearchInput;
    if (!this.showSearchInput) {
      // Clear the search input and reset the filtered companies when hiding the input
      this.inputValue = '';
      this.filteredCompanies = this.documentId;
    }
  }
  initializeMap() {
    const mapOptions: google.maps.MapOptions = {
      center: { lat: 11.019889, lng: 76.964044 },
      zoom: 13,
    };
    const mapContainer = document.getElementById('map') as HTMLElement;
    this.map = new google.maps.Map(mapContainer, mapOptions);

    this.map.addListener('click', (event: google.maps.MouseEvent) => {
      this.updateMarker(event.latLng);
    });

    // Initialize autocomplete for location suggestions
    this.autocomplete = new google.maps.places.Autocomplete(
      document.getElementById('location') as HTMLInputElement
    );

    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete.getPlace();
      if (place.geometry) {
        this.updateMarker(place.geometry.location);
      }
    });
  }

  updateMarker(latlng: google.maps.LatLng) {
    if (this.marker) {
      this.marker.setMap(null);
    }

    this.marker = new google.maps.Marker({
      position: latlng,
      map: this.map,
    });

    this.map.panTo(latlng);

    // Perform reverse geocoding to get the location name
    this.reverseGeocode(latlng.lat(), latlng.lng()).subscribe(
      (locationName: string) => {
        this.selectedLocation = locationName;
        console.log(this.selectedLocation);
      }
    );
  }

  onLocationInput(event: any) {
    const query = (event.target as HTMLInputElement).value;
    this.suggestions = [];

    if (query.trim() !== '') {
      // Perform location suggestions based on the entered query
      this.getLocationSuggestions(query).subscribe((suggestions: string[]) => {
        this.suggestions = suggestions;

        // If there are no suggestions, directly geocode the entered query
        if (suggestions.length === 0) {
          this.geocodeAndSetMarker(query);
        }
      });
    }
  }

  geocodeAndSetMarker(location: string) {
    // Geocode the entered location and set a marker on the map
    this.geocode(location).subscribe((coordinates: google.maps.LatLng) => {
      // Assuming this.map is your Google Maps instance
      if (this.map) {
        if (this.marker) {
          this.marker.setMap(null);
        }
        this.marker = new google.maps.Marker({
          position: coordinates,
          map: this.map,
        });

        // Set the view to the marker's coordinates with a specific zoom level
        this.map.setCenter(coordinates);
        this.map.setZoom(14); // You can adjust the zoom level
      }
    });
  }
  selectSuggestion(selectedLocation: string) {
    // Update the input field and clear suggestions
    this.selectedLocation = selectedLocation;
    this.suggestions = [];

    // Perform geocoding to get the coordinates of the selected location
    this.geocode(selectedLocation).subscribe((latlng: google.maps.LatLng) => {
      this.updateMarker(latlng);
    });
  }
  // your-map.component.ts

  getLocationSuggestions(query: string): Observable<string[]> {
    const autocompleteService = new google.maps.places.AutocompleteService();
    const request = {
      input: query,
      types: ['geocode'], // You can adjust the types based on your requirements
    };

    return new Observable<string[]>((observer) => {
      autocompleteService.getPlacePredictions(
        request,
        (predictions: any[], status: any) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            const suggestions = predictions.map(
              (prediction: { description: any }) => prediction.description
            );
            observer.next(suggestions);
            observer.complete();
          } else {
            console.error('Error getting location suggestions:', status);
            observer.error([]);
          }
        }
      );
    });
  }

  geocode(location: string): Observable<google.maps.LatLng> {
    const geocoder = new google.maps.Geocoder();
    return new Observable((observer) => {
      geocoder.geocode(
        { address: location },
        (results: string | any[], status: any) => {
          if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
            const coordinates = results[0].geometry.location;
            this.updateMarker(coordinates);
            observer.next(coordinates);
            observer.complete();
          } else {
            console.error('Location not found');
            observer.error('Location not found');
          }
        }
      );
    });
  }

  addMarker(coordinates: google.maps.LatLng) {
    // Assuming this.map is your Google Maps instance
    if (this.map) {
      const marker = new google.maps.Marker({
        position: coordinates,
        map: this.map,
      });

      // Set the view to the marker's coordinates with a specific zoom level
      this.map.setCenter(coordinates);
      this.map.setZoom(14); // You can adjust the zoom level (14 is just an example)
    }
  }

  reverseGeocode(lat: number, lng: number): Observable<string> {
    const latlng = new google.maps.LatLng(lat, lng);
    const geocoder = new google.maps.Geocoder();

    return new Observable<string>((observer) => {
      geocoder.geocode(
        { location: latlng },
        (results: string | any[], status: any) => {
          if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
            const address = results[0].formatted_address;
            observer.next(address);
            observer.complete();
          } else {
            console.error('Error reverse geocoding:', status);
            observer.error('Location not found');
          }
        }
      );
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
  uploadfile() {
    for (const file of this.selectedFiles) {
      const filePath = `CompanyWorkOrder/${this.insuranceForm.value.title}/${file.name}`;
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
  submit() {
    this.ngxLoader.start();
    console.log(this.insuranceForm.value);
    const dataToSave = this.insuranceForm.value;
    this.firestore
      .collection('Project')
      .doc(this.insuranceForm.value.title)
      .set(dataToSave)
      .then(() => {
        console.log('Data saved successfully.');
        this.showPopup = true; // Show the popup when data is saved successfully
      })
      .catch((error) => {
        console.error('Error saving data:', error);
      });
    this.uploadfile();
    this.ngxLoader.stop();
    this.router.navigate(['admin-dashboard']);
  }

  closePopup() {
    this.showPopup = false;
  }
  onFileSelected(event: any) {
    const files: File[] = event.target.files;
    for (let i = 0; i < files.length; i++) {
      this.selectedFiles.push(files[i]);
      this.selectedFiles;
    }
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
  viewTask() {}
  fetchDocumentId() {
    const collectionRef: AngularFirestoreCollection<any> =
      this.firestore.collection('Profile');

    return collectionRef
      .get()
      .toPromise()
      .then((querySnapshot: any) => {
        const companyValues: any[] = [];

        querySnapshot.forEach((doc: { data: () => any }) => {
          const data = doc.data();
          if (data && data.name) {
            companyValues.push(data.name);
          }
        });

        return companyValues;
      });
  }
  async getUsername(
    currentUserEmail: any
  ): Promise<{ userName: string; userType: string }[]> {
    if (currentUserEmail) {
      try {
        const querySnapshot = await this.firestore
          .collection('Normal Admin')
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
  selectCompany(event: Event, company: string) {
    event.preventDefault(); // Prevents the default anchor link behavior
    this.selectedCompany = company;
    this.fetchSPOC();
  }
  filterCompanies() {
    console.log(this.inputValue);

    this.filteredCompanies = this.inputValue
      ? this.documentId.filter((company) =>
          company.toLowerCase().includes(this.inputValue.toLowerCase())
        )
      : this.documentId;
    console.log(this.filteredCompanies);
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
