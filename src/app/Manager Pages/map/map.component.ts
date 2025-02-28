import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import JSZip from 'jszip';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
// @ts-ignore
import { google } from 'googlemaps';
import * as GeoTIFF from 'geotiff';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import * as shapefile from 'shapefile';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage } from '@angular/fire/compat/storage';

declare const google: any;

@Component({
  selector: 'app-manager-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  sidebarExpanded = false;
  currentUserEmail: string | null = null;
  overlay!: any;
  map!: any;
  kmlLayer!: any;
  drawingManager1: any;
  drawingManager: any;
  tiffLayer!: any;
  geo: any;
  tiffLayer1!: any;
  extension!: any;
  length!: any;
  title: any;
  url!: any;
  url1!: any;
  url2!: string;
  url3!: string;
  url4!: string;
  url5!: string;
  tiff: any;
  height: any;
  pixels: any;
  response: any;
  image: any;
  arrayBuffer: any;
  bounds: any;
  drawControl!: any;
  drawnItems!: any;
  kmlCheckbox = false;
  shpCheckbox = false;
  zoomChangeListener: any;
  tifCheckbox!: boolean;
  tifCheckbox1!: boolean;
  objCheckbox = false;
  kmlCheckbox1 = false;
  divs: { div: any; lat: any; lng: any }[] = [];
  kmlCheckbox2!: boolean;
  referencePoint: null = null;
  secondPoint: null = null;
  heightDifference: number | undefined;
  currentElevation: any;
  referenceelevation: any;
  polygons: any;
  polygon: any;
  kmlData!: any;
  averageHeight: any;
  showPopup: boolean = false;
  kmlLayers: any[] = [];
  urls: any[] = [];
  constructor(
    private firestore: AngularFirestore,
    private route: ActivatedRoute,
    private ngxLoader: NgxUiLoaderService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private afAuth: AngularFireAuth,
    private storage: AngularFireStorage
  ) {}
  async ngOnInit() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('Tab is hidden, start loader...');
        this.ngxLoader.start();
      } else if (!document.hidden) {
        setTimeout(() => {
          this.ngxLoader.stop();
          console.log('Loader stopped.');
        }, 3000);
      }
    });
    await this.getCurrentUserEmail();
    const user = await this.getUsername(this.currentUserEmail);
    this.loadGoogleMaps();

    this.route.queryParams.subscribe((params) => {
      const taskTitle = params['taskTitle'];
      this.tifCheckbox = params['tifCheckbox'] === 'true';
      this.tifCheckbox1 = params['tifCheckbox1'] === 'true';
      this.kmlCheckbox2 = params['kmlCheckbox2'] === 'true';
      console.log(taskTitle); // Log the taskTitle
      console.log(this.tifCheckbox, this.tifCheckbox1, this.kmlCheckbox2); // Log the checkbox values
      this.cdr.detectChanges();
      this.firestore
        .collection('Project')
        .doc(taskTitle)
        .valueChanges()
        .subscribe(async (data: any) => {
          if (data) {
            this.ngxLoader.start();

            this.url = data.Downloadurl12;
            this.response = await fetch(this.url);
            this.arrayBuffer = await this.response.arrayBuffer();
            console.log('GeoTIFF arrayBuffer:', this.arrayBuffer);
            this.tiff = await GeoTIFF.fromArrayBuffer(this.arrayBuffer);
            console.log(this.tiff);
            this.image = await this.tiff.getImage();
            console.log(this.image);
            this.pixels = await this.image.readRasters();
            console.log(this.pixels);
            const bbox = this.image.getBoundingBox();
            console.log(bbox);
            this.bounds = new google.maps.LatLngBounds(
              new google.maps.LatLng(bbox[1], bbox[0]),
              new google.maps.LatLng(bbox[3], bbox[2])
            );
            console.log('Bounds:', this.bounds);

            if (this.tifCheckbox) {
              this.route.queryParams.subscribe((params) => {
                const taskTitle = params['taskTitle'];
                this.firestore
                  .collection('Project')
                  .doc(taskTitle)
                  .valueChanges()
                  .subscribe(async (data: any) => {
                    if (data) {
                      this.url = data.Downloadurl0;
                      this.url1 = data.Downloadurl1;

                      try {
                        const altitude = 0;

                        const tiffLayer = new google.maps.GroundOverlay(
                          this.url,
                          this.bounds,
                          {
                            altitude,
                            zIndex: 1,
                          }
                        );
                        this.tiffLayer = tiffLayer;
                        console.log(this.tiffLayer);

                        this.tiffLayer.setMap(this.map);
                        const img = new Image();

                        img.src = this.url;

                        img.addEventListener('load', () => {
                          console.log('Image loaded successfully!');
                          setTimeout(() => {
                            this.ngxLoader.stop();
                          }, 10000);
                        });
                        this.zoomChangeListener = () => {
                          setTimeout(() => {
                            this.ngxLoader.start();
                          }, 1000); // 5 seconds
                          setTimeout(() => {
                            this.ngxLoader.stop();
                          }, 1200);
                        };

                        // Add the listener
                        google.maps.event.addListener(
                          this.map,
                          'zoom_changed',
                          this.zoomChangeListener
                        );
                        setTimeout(() => {
                          this.ngxLoader.stop();
                        }, 45000);
                        this.map.fitBounds(this.bounds);
                        if (this.drawingManager1) {
                          this.drawingManager1.setMap(null);
                        }
                        this.drawingManager =
                          new google.maps.drawing.DrawingManager({
                            drawingMode:
                              google.maps.drawing.OverlayType.POLYGON,
                            drawingControl: true,
                            drawingControlOptions: {
                              position: google.maps.ControlPosition.TOP_CENTER,
                              drawingModes: [
                                google.maps.drawing.OverlayType.POLYGON,
                              ],
                            },
                            polygonOptions: {
                              strokeColor: '#FF0000',
                              strokeOpacity: 0.8,
                              strokeWeight: 2,
                              fillColor: '#FF0000',
                              fillOpacity: 0.35,
                            },
                          });

                        this.drawingManager.setMap(this.map);

                        google.maps.event.addListener(
                          this.drawingManager,
                          'overlaycomplete',
                          (event: { type: any; overlay: any }) => {
                            console.log('overlaycomplete');

                            if (
                              event.type ===
                              google.maps.drawing.OverlayType.POLYGON
                            ) {
                              this.polygons = event.overlay;
                              const bounds = this.calculatePolygonBounds(
                                this.polygons
                              );
                              const center = bounds.getCenter();
                              console.log(this.polygons);
                              console.log(center);

                              const length =
                                google.maps.geometry.spherical.computeLength(
                                  this.polygons.getPath()
                                );
                              const area =
                                google.maps.geometry.spherical.computeArea(
                                  this.polygons.getPath()
                                );
                              const contentString = `Length: ${length.toFixed(
                                2
                              )} meters<br>Area: ${area.toFixed(
                                2
                              )} square meters`;
                              const infowindow = new google.maps.InfoWindow({
                                content: contentString,
                                position: center,
                              });

                              infowindow.open(this.map);

                              this.drawingManager.setDrawingMode(null);
                            }
                          }
                        );
                      } catch (error) {
                        console.error('Error loading GeoTIFF:', error);
                        this.ngxLoader.stop();
                      }
                    }
                  });
              });
            } else if (this.tifCheckbox1) {
              this.route.queryParams.subscribe((params) => {
                const taskTitle = params['taskTitle'];
                this.firestore
                  .collection('Project')
                  .doc(taskTitle)
                  .valueChanges()
                  .subscribe(async (data: any) => {
                    if (data) {
                      this.url = data.Downloadurl3;
                      this.url2 = data.Downloadurl4;

                      try {
                        let secondPointInfoWindow: any;

                        let numRows = this.pixels.length;
                        let numCols = 0;
                        console.log(numRows);

                        if (numRows > 0) {
                          numCols = (this.pixels[0] as unknown as any[]).length;
                        }

                        const twoDArray: number[][] = new Array(numRows);

                        for (let i = 0; i < numRows; i++) {
                          twoDArray[i] = new Array(numCols);
                          for (let j = 0; j < numCols; j++) {
                            twoDArray[i][j] = (
                              this.pixels[i] as unknown as any[]
                            )[j];
                          }
                        }

                        console.log(this.pixels);
                        console.log(twoDArray);

                        const elevationdata = Array.from([this.pixels[0]]);
                        console.log(elevationdata);

                        const bbox = this.image.getBoundingBox();

                        const bounds = new google.maps.LatLngBounds(
                          new google.maps.LatLng(bbox[1], bbox[0]),
                          new google.maps.LatLng(bbox[3], bbox[2])
                        );
                        console.log('Bounds:', bounds);

                        const altitude = 0;

                        const tiffLayer = new google.maps.GroundOverlay(
                          this.url,
                          bounds,
                          {
                            altitude,
                            zIndex: 0,
                          }
                        );
                        console.log(tiffLayer);
                        tiffLayer.setMap(this.map);
                        this.tiffLayer1 = tiffLayer;
                        const img = new Image();

                        img.src = this.url;

                        img.addEventListener('load', () => {
                          console.log('Image loaded successfully!');
                          setTimeout(() => {
                            this.ngxLoader.stop();
                          }, 10000);
                        });
                        setTimeout(() => {
                          this.ngxLoader.stop();
                        }, 15000);

                        this.map.fitBounds(bounds);

                        google.maps.event.addListener(
                          tiffLayer,
                          'click',
                          async (event: { latLng: any; mapPoint: any }) => {
                            const latLng = event.latLng;
                            if (latLng && latLng.lat && latLng.lng) {
                              if (!this.referencePoint) {
                                this.referencePoint = latLng;
                                const lat = latLng.lat();
                                const lng = latLng.lng();
                                console.log(lat, lng);

                                console.log(this.referencePoint);
                                this.referenceelevation =
                                  await this.getElevationForPoint(lat, lng);
                                console.log(this.referenceelevation);

                                const contentString = `Latitude: ${latLng
                                  .lat()
                                  .toFixed(6)}<br>Longitude: ${latLng
                                  .lng()
                                  .toFixed(6)}<br>Height: ${
                                  this.referenceelevation
                                } meters`;
                                const infowindow = new google.maps.InfoWindow({
                                  content: contentString,
                                  position: latLng,
                                });

                                infowindow.open(this.map);
                              } else if (!this.secondPoint) {
                                this.secondPoint = latLng;
                                this.currentElevation =
                                  await this.getElevationForPoint(
                                    latLng.lat(),
                                    latLng.lng()
                                  );

                                const heightDifference = this.HeightDifference(
                                  this.referenceelevation,
                                  this.currentElevation
                                );
                                if (heightDifference) {
                                  const contentString = `Latitude: ${latLng
                                    .lat()
                                    .toFixed(6)}<br>Longitude: ${latLng
                                    .lng()
                                    .toFixed(6)}<br>Height:${
                                    this.currentElevation
                                  }<br>Height Difference: ${heightDifference} meters`;
                                  const infowindow = new google.maps.InfoWindow(
                                    {
                                      content: contentString,
                                      position: latLng,
                                    }
                                  );

                                  infowindow.open(this.map);
                                  secondPointInfoWindow = infowindow;
                                }
                              } else {
                                if (secondPointInfoWindow) {
                                  secondPointInfoWindow.close();
                                  secondPointInfoWindow = null;
                                }

                                this.secondPoint = latLng;
                                this.currentElevation =
                                  await this.getElevationForPoint(
                                    latLng.lat(),
                                    latLng.lng()
                                  );
                                const heightDifference = this.HeightDifference(
                                  this.referenceelevation,
                                  this.currentElevation
                                );
                                if (heightDifference) {
                                  const contentString = `Latitude: ${latLng
                                    .lat()
                                    .toFixed(6)}<br>Longitude: ${latLng
                                    .lng()
                                    .toFixed(6)}<br>Height:${
                                    this.currentElevation
                                  }<br>Height Difference: ${heightDifference} meters`;
                                  const infowindow = new google.maps.InfoWindow(
                                    {
                                      content: contentString,
                                      position: latLng,
                                    }
                                  );

                                  infowindow.open(this.map);
                                  secondPointInfoWindow = infowindow;
                                }
                              }
                            } else {
                              console.error('LatLng is undefined.');
                            }
                          }
                        );
                        if (this.drawingManager) {
                          this.drawingManager.setMap(null);
                        }
                        this.drawingManager1 =
                          new google.maps.drawing.DrawingManager({
                            drawingMode:
                              google.maps.drawing.OverlayType.POLYGON,
                            drawingControl: true,
                            drawingControlOptions: {
                              position: google.maps.ControlPosition.TOP_CENTER,
                              drawingModes: [
                                google.maps.drawing.OverlayType.POLYGON,
                              ],
                            },
                            polygonOptions: {
                              strokeColor: '#FF0000',
                              strokeOpacity: 0.8,
                              strokeWeight: 2,
                              fillColor: '#FF0000',
                              fillOpacity: 0.35,
                            },
                          });

                        this.drawingManager1.setMap(this.map);

                        google.maps.event.addListener(
                          this.drawingManager1,
                          'overlaycomplete',
                          async (event: { type: any; overlay: any }) => {
                            console.log('overlaycomplete');

                            if (
                              event.type ===
                              google.maps.drawing.OverlayType.POLYGON
                            ) {
                              this.polygons = event.overlay;
                              console.log(this.polygons);

                              const bounds = this.calculatePolygonBounds(
                                this.polygons
                              );
                              const center = bounds.getCenter();
                              const length =
                                google.maps.geometry.spherical.computeLength(
                                  this.polygons.getPath()
                                );
                              const area =
                                google.maps.geometry.spherical.computeArea(
                                  this.polygons.getPath()
                                );
                              this.averageHeight =
                                await this.getelevationfrompoly(this.polygons);

                              const volume = this.CalculateVolume(
                                area,
                                this.averageHeight
                              );

                              const contentString = `Length: ${length.toFixed(
                                2
                              )} meters<br>Area: ${area.toFixed(
                                2
                              )} square meters<br>Volume: ${volume.toFixed(
                                2
                              )} cubic meters`;
                              const infowindow = new google.maps.InfoWindow({
                                content: contentString,
                                position: center,
                              });

                              infowindow.open(this.map);

                              this.drawingManager1.setDrawingMode(null);
                            }
                          }
                        );
                      } catch (error) {
                        console.error('Error loading GeoTIFF:', error);
                        this.ngxLoader.stop();
                      }
                    }
                  });
              });
            } else if (this.kmlCheckbox2) {
              this.route.queryParams.subscribe((params) => {
                const taskTitle = params['taskTitle'];
                this.title = taskTitle;
                this.firestore
                  .collection('Project')
                  .doc(taskTitle)
                  .valueChanges()
                  .subscribe((data: any) => {
                    if (data) {
                      this.url = data.Downloadurl10;
                      this.getFileExtension(this.url);

                      if (this.extension === 'kml') {
                        const src = this.url;
                        var kmlLayer = new google.maps.KmlLayer(src, {
                          suppressInfoWindows: true,
                          preserveViewport: false,
                          map: this.map,
                        });
                        this.ngxLoader.stop();
                        kmlLayer.addListener('status_changed', async () => {
                          if (kmlLayer.getStatus() === 'OK') {
                            // The KML layer has finished loading

                            // Extract and parse KML data from the KMZ file
                            const response = await fetch(this.url);
                            const kmlData = await response.text();
                            this.parseKMLData(kmlData);
                          }
                        });
                        kmlLayer.addListener(
                          'click',
                          (event: {
                            latLng: any;
                            featureData: {
                              name: string;
                              description: string;
                              viewUrl: string;
                            };
                          }) => {
                            var name = event.featureData.name;
                            var description = event.featureData
                              .description as any;
                            var viewUrl = event.featureData.viewUrl;
                            var measurement =
                              /<td>Measuremen<\/td>\s*<td>(.*?)<\/td>/;
                            var value = description.match(measurement);
                            if (value) {
                              // Extracted Measuremen value
                              var measuremenValue = value[1];
                              this.length = measuremenValue;
                              // Log the Measuremen value
                              console.log('Measuremen:', measuremenValue);
                            } else {
                              console.error(
                                'Measuremen value not found in the table.'
                              );
                            }
                            var contentString = `
              <div>
              <h3>${name}</h3>
              <p>${description}</p>
              <a href="${viewUrl}" target="_blank">View Place</a>
              // <p>${description.measurement}</p>
              </div>
            `;

                            const infoWindow = new google.maps.InfoWindow({
                              content: contentString,
                              position: event.latLng,
                            });

                            infoWindow.open(this.map);
                          }
                        );
                      } else {
                        if (this.urls.length > 0) {
                          for (let i = 0; i < this.urls.length; i++) {
                            console.log(this.urls[i]);
                            fetch(this.urls[i])
                              .then((response) => response.arrayBuffer())
                              .then((arrayBuffer) => {
                                this.unzip(arrayBuffer)
                                  .then((unzipped) => {
                                    this.deleteFileFromZip(
                                      unzipped,
                                      'legend0.png'
                                    );

                                    unzipped
                                      .generateAsync({
                                        type: 'uint8array',
                                      })
                                      .then((data) => {
                                        const kmlBlob = new Blob([data], {
                                          type: 'application/vnd.google-earth.kml+xml',
                                        });

                                        const kmlDataUrl =
                                          URL.createObjectURL(kmlBlob);
                                        console.log(kmlDataUrl);

                                        const kmlLayer =
                                          new google.maps.KmlLayer(
                                            this.urls[i],
                                            {
                                              suppressInfoWindows: true,
                                              preserveViewport: false,
                                              map: this.map,
                                            }
                                          );
                                        this.kmlLayers[i] = kmlLayer;
                                        console.log(this.kmlLayer);
                                        this.ngxLoader.stop();

                                        if (i === 0) {
                                          kmlLayer.addListener(
                                            'status_changed',
                                            () => {
                                              if (
                                                kmlLayer.getStatus() === 'OK'
                                              ) {
                                                // The KML layer has finished loading

                                                // Extract and parse KML data from the KMZ file

                                                this.extractAndParseKMLFromKMZ(
                                                  this.urls[0]
                                                );
                                              }
                                            }
                                          );
                                        }

                                        const self = this;
                                        kmlLayer.addListener(
                                          'click',
                                          (event: {
                                            latLng: any;
                                            featureData: {
                                              name: string;
                                              description: string;
                                              viewUrl: string;
                                            };
                                          }) => {
                                            var name = event.featureData.name;
                                            var description =
                                              event.featureData.description;
                                            var measurement =
                                              /<td>Measuremen<\/td>\s*<td>(.*?)<\/td>/;
                                            var value =
                                              description.match(measurement);
                                            if (value) {
                                              // Extracted Measuremen value
                                              var measuremenValue = value[1];
                                              this.length = measuremenValue;
                                              // Log the Measuremen value
                                              console.log(
                                                'Measuremen:',
                                                measuremenValue
                                              );
                                            } else {
                                              console.error(
                                                'Measuremen value not found in the table.'
                                              );
                                            }
                                            var contentString = `
                                <div>
                                  <h3>${name}</h3>
                                  <p>${description}</p>
                                 </div>
                                `;

                                            const infoWindow =
                                              new google.maps.InfoWindow({
                                                content: contentString,
                                                position: event.latLng,
                                              });

                                            infoWindow.open(self.map);
                                          }
                                        );
                                      });
                                  })
                                  .catch((error) => {
                                    console.error(
                                      'Error unzipping the KMZ file:',
                                      error
                                    );
                                  });
                              })
                              .catch((error) => {
                                console.error(
                                  'Error fetching the KMZ file:',
                                  error
                                );
                              });
                          }
                        } else {
                          fetch(this.url)
                            .then((response) => response.arrayBuffer())
                            .then((arrayBuffer) => {
                              this.unzip(arrayBuffer)
                                .then((unzipped) => {
                                  this.deleteFileFromZip(
                                    unzipped,
                                    'legend0.png'
                                  );

                                  unzipped
                                    .generateAsync({ type: 'uint8array' })
                                    .then((data) => {
                                      const kmlBlob = new Blob([data], {
                                        type: 'application/vnd.google-earth.kml+xml',
                                      });

                                      const kmlDataUrl =
                                        URL.createObjectURL(kmlBlob);
                                      console.log(kmlDataUrl);

                                      const kmlLayer = new google.maps.KmlLayer(
                                        this.url,
                                        {
                                          suppressInfoWindows: true,
                                          preserveViewport: false,
                                          map: this.map,
                                        }
                                      );
                                      this.kmlLayer = kmlLayer;
                                      this.ngxLoader.stop();
                                      kmlLayer.addListener(
                                        'status_changed',
                                        () => {
                                          if (kmlLayer.getStatus() === 'OK') {
                                            // The KML layer has finished loading

                                            // Extract and parse KML data from the KMZ file
                                            this.extractAndParseKMLFromKMZ(
                                              this.url
                                            );
                                          }
                                        }
                                      );
                                      const self = this;
                                      kmlLayer.addListener(
                                        'click',
                                        (event: {
                                          latLng: any;
                                          featureData: {
                                            name: string;
                                            description: string;
                                            viewUrl: string;
                                          };
                                        }) => {
                                          var name = event.featureData.name;
                                          var description =
                                            event.featureData.description;
                                          var measurement =
                                            /<td>Measuremen<\/td>\s*<td>(.*?)<\/td>/;
                                          var value =
                                            description.match(measurement);
                                          if (value) {
                                            // Extracted Measuremen value
                                            var measuremenValue = value[1];
                                            this.length = measuremenValue;
                                            // Log the Measuremen value
                                            console.log(
                                              'Measuremen:',
                                              measuremenValue
                                            );
                                          } else {
                                            console.error(
                                              'Measuremen value not found in the table.'
                                            );
                                          }
                                          var contentString = `
                                <div>
                                  <h3>${name}</h3>
                                  <p>${description}</p>
                                 </div>
                                `;

                                          const infoWindow =
                                            new google.maps.InfoWindow({
                                              content: contentString,
                                              position: event.latLng,
                                            });

                                          infoWindow.open(self.map);
                                        }
                                      );
                                    });
                                })
                                .catch((error) => {
                                  console.error(
                                    'Error unzipping the KMZ file:',
                                    error
                                  );
                                });
                            })
                            .catch((error) => {
                              console.error(
                                'Error fetching the KMZ file:',
                                error
                              );
                            });
                        }
                      }
                    }
                  });
              });
            }
          }
        });
    });
  }
  showpopup() {
    this.showPopup = true;
  }
  closePopup() {
    this.showPopup = false;
  }
  back() {
    this.route.queryParams.subscribe((params) => {
      const title = params['taskTitle'];
      this.router.navigate(['manager-viewing'], { queryParams: { title } });
    });
  }
  toggleSidebar() {
    this.sidebarExpanded = !this.sidebarExpanded;
  }
  loadGoogleMaps() {
    const script = document.createElement('script');
    script.src =
      'https://maps.googleapis.com/maps/api/js?key=AIzaSyDTI2DGMMAdm3AAN8AtnqcXr2h01mFkaLg&callback=initMap&libraries=drawing,geometry';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      this.initMap();
    };

    script.onerror = () => {
      console.error('Failed to load Google Maps script.');
    };

    document.head.appendChild(script);
  }
  async initMap() {
    this.kmlCheckbox = false;
    this.shpCheckbox = false;
    // this.tifCheckbox = false;
    // this.tifCheckbox1 = false;
    this.objCheckbox = false;
    this.kmlCheckbox1 = false;
    // this.kmlCheckbox2 = false;
    const map = new google.maps.Map(
      document.getElementById('map') as HTMLElement,
      {
        center: {
          lat: 11.019889,
          lng: 76.964044,
        },
        zoom: 40,
        heading: 320,
        tilt: 47.5,
        mapId: '90f87356969d889c',
      }
    );
    this.map = map;
    console.log(this.map);

    const buttons = [
      ['Rotate Left', 'rotate', 20, google.maps.ControlPosition.LEFT_CENTER],
      ['Rotate Right', 'rotate', -20, google.maps.ControlPosition.RIGHT_CENTER],
      ['Tilt Down', 'tilt', 20, google.maps.ControlPosition.TOP_CENTER],
      ['Tilt Up', 'tilt', -20, google.maps.ControlPosition.BOTTOM_CENTER],
    ];
    const clearPolygonButton = document.createElement('button');
    clearPolygonButton.innerHTML = 'Clear Polygon';
    clearPolygonButton.style.position = 'absolute';
    clearPolygonButton.style.top = '50px';
    clearPolygonButton.style.right = '10px';
    clearPolygonButton.onclick = () => {
      if (this.polygons) {
        this.polygons.setMap(null);
      }
    };
    this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(
      clearPolygonButton
    );
    const clearReferenceButton = document.createElement('button');
    clearReferenceButton.innerHTML = 'Clear Reference';
    clearReferenceButton.style.position = 'absolute';
    clearReferenceButton.style.top = '10px';
    clearReferenceButton.style.right = '10px';
    clearReferenceButton.onclick = () => {
      if (this.referencePoint) {
        this.referencePoint = null;
        this.secondPoint = null;
        this.heightDifference = 0;
      }
    };
    this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(
      clearReferenceButton
    );
    buttons.forEach(([text, mode, amount, position]) => {
      const controlDiv = document.createElement('div');
      const controlUI = document.createElement('button');

      controlUI.classList.add('ui-button');
      controlUI.innerText = `${text}`;
      controlUI.addEventListener('click', () => {
        adjustMap(mode, amount);
      });
      controlDiv.appendChild(controlUI);
      map.controls[position].push(controlDiv);
    });

    const adjustMap = function (mode: string, amount: number) {
      switch (mode) {
        case 'tilt':
          map.setTilt(map.getTilt()! + amount);
          break;
        case 'rotate':
          map.setHeading(map.getHeading()! + amount);
          break;
        default:
          break;
      }
    };
  }
  combineBuffers(shpBuffer: any, shxBuffer: any, dbfBuffer: any) {
    console.log('Original Buffers:');
    console.log(shpBuffer, shxBuffer, dbfBuffer);

    const totalLength =
      shpBuffer.byteLength + shxBuffer.byteLength + dbfBuffer.byteLength;
    console.log(totalLength);

    const combinedBuffer = new Uint8Array(totalLength);
    console.log(combinedBuffer);

    let offset = shpBuffer.buffer;
    combinedBuffer.set(new Uint8Array(shpBuffer));
    console.log('After setting shpBuffer:');
    console.log(combinedBuffer.buffer);

    if (shxBuffer) {
      combinedBuffer.set(new Uint8Array(shxBuffer), offset);
      console.log('After setting shxBuffer:');
      console.log(combinedBuffer.buffer);
    }

    if (dbfBuffer) {
      combinedBuffer.set(new Uint8Array(dbfBuffer), offset);
      console.log('After setting dbfBuffer:');
      console.log(combinedBuffer.buffer);
    }

    return combinedBuffer.buffer;
  }

  async convertZipToKML(zipFilePath: string) {
    const zip = new JSZip();

    try {
      const response = await fetch(zipFilePath);
      const zipData = await response.arrayBuffer();
    } catch (error) {
      throw error;
    }
  }
  async shpBufferToKML(shpBuffer: ArrayBuffer): Promise<string> {
    try {
      const geojson = await shapefile.read(shpBuffer);

      const kml = this.toKML(geojson);

      return kml;
    } catch (error) {
      throw new Error(`Error converting SHP to KML: ${error}`);
    }
  }

  toKML(geojson: any): string {
    const coordinates = geojson.features[0].geometry.coordinates;
    console.log(coordinates);

    const kml = `
      <?xml version="1.0" encoding="utf-8"?><kml><Document><Schema id="temp"><SimpleField name="Id" type="int" /></Schema><Placemark><ExtendedData><SchemaData schemaUrl="#temp"><SimpleData name="Id">0</SimpleData></SchemaData></ExtendedData><LineString><coordinates>80.17904313661708,13.022845244021557,0 80.17901160875873,13.022843459425827,0 80.17895985548185,13.02283394158168,0 80.17894795817685,13.022830372390175,0 80.17892654302787,13.022836915907886,0 80.17888966138223,13.022842269695175,0 80.17885218487145,13.022840485099454,0 80.17884088243157,13.022823234007163,0 80.17883314918343,13.022807172645471,0 80.17882720053083,13.022783378035298,0 80.178818277552,13.022758393694815,0 80.17878674969361,13.022720322318735,0 80.17875998075742,13.022678681751088,0 80.17878793942428,13.0226364463182,0 80.17883493377914,13.02259242628965,0 80.17886765136801,13.022569226544771,0 80.17885159000613,13.022543647338988,0 80.17882779539615,13.022526396246702,0 80.17881292376475,13.0225347243602,0 80.17881078224984,13.02253217833693,0 80.17880250172547,13.022532321104693,0 80.17879807592797,13.022523469509636,0 80.1788012168166,13.022516188359035,0 80.17879821869573,13.022510049349549,0 80.1787895098685,13.022509478278906,0 80.178784227465,13.022500626684078,0 80.17878822495962,13.022494344907,0 80.17878665451522,13.022490632947733,0 80.17880235895795,13.022482495191143,0 80.17880064574597,13.022454512729626,0 80.17878539340094,13.022425792635445,0 80.17876076597945,13.02243650020979,0 80.17873328320482,13.022445780107901,0 80.1787068711877,13.022451847733418,0 80.1786708223534,13.022456130763162,0 80.1786351304384,13.022457558439797,0 80.1786216864836,13.022433049991395,0 80.1786131204241,13.022413062518876,0 80.1786045543644,13.02238688844779,0 80.17859979544248,13.022369756328613,0 80.17857933207776,13.022348817071887,0 80.17854173659389,13.02229551714528,0 80.1785693383416,13.02225601809256,0 80.17860169901131,13.022221753854197,0 80.17861193069346,13.022191772645343,0 80.1786219244298,13.022169167765819,0 80.17863168021994,13.022149418239522,0 80.17863977038722,13.022135141473441,0 80.17866879981162,13.022137045042276,0 80.17869806718203,13.022140852179819,0 80.17873018990552,13.02214870440129,0 80.17874732202469,13.022153820242368,0 80.1787676664163,13.022145254182659,0 80.1788279857528,13.022142755748703,0 80.17885725312321,13.022209499629883,0 80.17885297009347,13.022216281093803,0 80.17887367140422,13.022235911647174,0 80.178894729634,13.022259468310965,0 80.17891614478314,13.022291947953773,0 80.17892114165129,13.0223015847708,0 80.17890400953192,13.022327282949687,0 80.17888366514033,13.02235298112858,0 80.17886189307227,13.022374039358354,0 80.17885189933597,13.022383676175606,0 80.17885511160834,13.022386174609563,0 80.17886570020981,13.022377846496072,0 80.1788802744084,13.022370113247764,0 80.17889722806818,13.022360595403782,0 80.17890912537318,13.022366544056194,0 80.17891864321714,13.02237516960254,0 80.17892072524556,13.022378143928748,0 80.17887432575597,13.022402235971423,0 80.1788704591318,13.022406697460733,0 80.17887521805372,13.02241413327643,0 80.17891299199736,13.02239123096423,0 80.17897872460746,13.022356728779654,0 80.17899032448,13.022366246623745,0 80.17901173962893,13.022388851503322,0 80.17902482666459,13.022419189631037,0 80.1790298830192,13.022445661134796,0 80.17892786362857,13.022502173333649,0 80.17893113538744,13.022513178340843,0 80.17894570958597,13.02250247076627,0 80.1789816989339,13.022483137645578,0 80.1789852681254,13.022494737517961,0 80.1789837809623,13.022507824553559,0 80.17898110406853,13.022512880908168,0 80.17896236581315,13.022522398752143,0 80.17895552486274,13.022519126993261,0 80.17894838647973,13.022522101319634,0 80.17895195567124,13.022528049972056,0 80.17893946350094,13.022534890922445,0 80.17893857120315,13.022538757546627,0 80.17895046850815,13.022534890922445,0 80.17897128879194,13.022529834567834,0 80.17899210907579,13.02252537307852,0 80.17902125747308,13.022522696184765,0 80.17903821113269,13.022521803887019,0 80.17904802640946,13.022522398752143,0 80.17905843655136,13.022541731872835,0 80.17906735952998,13.022561659858821,0 80.17907420048037,13.022579803248915,0 80.17908424180585,13.022614888401463,0 80.17908871519249,13.022617553397893,0 80.17910165946037,13.022630402487337,0 80.17911847035258,13.022650663597814,0 80.1791392906362,13.022685165782391,0 80.17913274711864,13.022696468222263,0 80.17912025494834,13.022714314179677,0 80.1791041935865,13.022734837030853,0 80.17908545533109,13.022752385555762,0 80.1790798041112,13.022760118804124,0 80.17907266572811,13.02278629287521,0 80.17906612221041,13.02279997477599,0 80.17905779409692,13.02282020019449,0 80.17904313661708,13.022845244021557,0</coordinates></LineString></Placemark><Placemark><ExtendedData><SchemaData schemaUrl="#temp"><SimpleData name="Id">0</SimpleData></SchemaData></ExtendedData><LineString><coordinates>80.17888403395696,13.023217094290217,0 80.17866607532872,13.023158083657346,0 80.17863752179657,13.02325040674431,0 80.1785423433565,13.023227563918754,0 80.17851569339324,13.023320838790095,0 80.17841670781529,13.023296092395652,0 80.17839291320522,13.023393174404774,0 80.1782967829806,13.02336366908817,0 80.17823682056336,13.023578772363138,0 80.17845668276019,13.023636831211673,0 80.17848238093909,13.023541652771444,0 80.17857851116375,13.02356830273477,0 80.17860420934265,13.023473124294483,0 80.17869938778288,13.02350072604226,0 80.17872794131488,13.023405547602026,0 80.17882407153955,13.023432197565127,0 80.17888403395696,13.023217094290217,0</coordinates></LineString></Placemark><Placemark><ExtendedData><SchemaData schemaUrl="#temp"><SimpleData name="Id">0</SimpleData></SchemaData></ExtendedData><LineString><coordinates>80.17807102864343,13.02382816714119,0 80.17816620708365,13.023775818999194,0 80.17810005806761,13.023718236042853,0 80.17811576251032,13.0236939655406,0 80.1781215089085,13.023677987459859,0 80.17812528035425,13.023659820274945,0 80.1781257562465,13.023620678141539,0 80.1781114794804,13.023574992490138,0 80.1780838777328,13.023526451485692,0 80.1780503630245,13.023490438343359,0 80.17801371932504,13.023467952436887,0 80.17798837806531,13.023459743296327,0 80.17797279259564,13.023457006916328,0 80.17796204932931,13.02345744711654,0 80.17794328727926,13.023459505350287,0 80.17792746386361,13.02346521605672,0 80.1779152096393,13.023472711358878,0 80.17790521590318,13.023482586122116,0 80.1778916172835,13.023500753306806,0 80.17788257533178,13.023527403270139,0 80.1778797199785,13.02357118535265,0 80.17788685836152,13.023602594237916,0 80.17789827977434,13.023637334368473,0 80.1779273091987,13.023680640558963,0 80.17795395916185,13.02371062176759,0 80.1779834644784,13.023727753886773,0 80.1780115421182,13.023741078868412,0 80.17803432545729,13.023743422637507,0 80.17805693386256,13.023743128630047,0 80.17807102864343,13.02382816714119,0</coordinates></LineString></Placemark></Document></kml>
    `;

    return kml;
  }

  async convertZipToGeoJSON(zipFilePath: string) {
    const zip = new JSZip();

    try {
      const response = await fetch(zipFilePath);
      const zipData = await response.arrayBuffer();

      const zipFile = await zip.loadAsync(zipData);
      const geojsonData: any[] = [];
      console.log(zipFile);

      for (const [filePath, file] of Object.entries(zipFile.files)) {
        if (filePath.endsWith('.shp')) {
          const shpBuffer = await file.async('arraybuffer');
          const shxFile = zipFile.file(filePath.replace('.shp', '.shx'));
          const shxBuffer = shxFile
            ? await shxFile.async('arraybuffer')
            : undefined;
          const dbfFile = zipFile.file(filePath.replace('.shp', '.dbf'));
          let dbfBuffer;
          if (dbfFile) {
            dbfBuffer = await dbfFile.async('arraybuffer');
            console.log(dbfBuffer);
          }

          const combinedBuffer = this.combineBuffers(
            shpBuffer,
            shxBuffer,
            dbfBuffer
          );

          const source = await shapefile.open(combinedBuffer);
          console.log(source);

          const features: any[] = [];
          let result;
          while ((result = await source.read())) {
            if (result.done) break;
            features.push(result.value);
            console.log(features);
            const featureCollection = {
              type: 'FeatureCollection',
              features: features,
              properties: {
                bbox: source.bbox,
                dbf: source.dbf,
              },
            };
            geojsonData.push(featureCollection);
          }
        }
      }
      const geojsonLayer = new google.maps.Data({
        map: this.map,
      });
      geojsonData.forEach((featureCollection) => {
        featureCollection.features.forEach((feature: any) => {
          geojsonLayer.addGeoJson(feature);
        });
      });
    } catch (error) {
      throw error;
    }
  }
  toggleSHP() {
    this.shpCheckbox = !this.shpCheckbox;

    if (this.shpCheckbox) {
      this.route.queryParams.subscribe((params) => {
        const taskTitle = params['taskTitle'];
        this.firestore
          .collection('Project')
          .doc(taskTitle)
          .valueChanges()
          .subscribe(async (data: any) => {
            if (data) {
              this.url = data.Downloadurl4;
              this.map.fitBounds(this.bounds);
            }
          });
      });
    }
  }

  getPropertyColor(propertyValue: string) {
    if (propertyValue === 'value1') {
      return 'blue';
    } else if (propertyValue === 'value2') {
      return 'red';
    } else if (propertyValue === 'undefined') {
      return 'brown';
    } else {
      return 'defaultColor';
    }
  }
  async toggleTIF() {
    this.tifCheckbox = !this.tifCheckbox;
    this.closePopup();
    if (this.tifCheckbox) {
      this.route.queryParams.subscribe((params) => {
        const taskTitle = params['taskTitle'];
        this.firestore
          .collection('Project')
          .doc(taskTitle)
          .valueChanges()
          .subscribe(async (data: any) => {
            if (data) {
              this.ngxLoader.start();
              this.url = data.Downloadurl0;
              this.url1 = data.Downloadurl1;

              try {
                const altitude = 0;

                const tiffLayer = new google.maps.GroundOverlay(
                  this.url,
                  this.bounds,
                  {
                    altitude,
                    zIndex: 1,
                  }
                );
                console.log(tiffLayer);
                this.tiffLayer = tiffLayer;
                this.tiffLayer.setMap(this.map);
                const img = new Image();

                img.src = this.url;

                img.addEventListener('load', () => {
                  console.log('Image loaded successfully!');
                  setTimeout(() => {
                    this.ngxLoader.stop();
                  }, 5000);
                });
                this.zoomChangeListener = () => {
                  setTimeout(() => {
                    this.ngxLoader.start();
                  }, 1000); // 5 seconds
                  setTimeout(() => {
                    this.ngxLoader.stop();
                  }, 1200);
                };

                // Add the listener
                google.maps.event.addListener(
                  this.map,
                  'zoom_changed',
                  this.zoomChangeListener
                );
                this.ngxLoader.stop();
                this.map.fitBounds(this.bounds);
                if (this.drawingManager1) {
                  this.drawingManager1.setMap(null);
                }
                this.drawingManager = new google.maps.drawing.DrawingManager({
                  drawingMode: google.maps.drawing.OverlayType.POLYGON,
                  drawingControl: true,
                  drawingControlOptions: {
                    position: google.maps.ControlPosition.TOP_CENTER,
                    drawingModes: [google.maps.drawing.OverlayType.POLYGON],
                  },
                  polygonOptions: {
                    strokeColor: '#FF0000',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#FF0000',
                    fillOpacity: 0.35,
                  },
                });

                this.drawingManager.setMap(this.map);

                google.maps.event.addListener(
                  this.drawingManager,
                  'overlaycomplete',
                  (event: { type: any; overlay: any }) => {
                    console.log('overlaycomplete');

                    if (
                      event.type === google.maps.drawing.OverlayType.POLYGON
                    ) {
                      this.polygons = event.overlay;
                      const bounds = this.calculatePolygonBounds(this.polygons);
                      const center = bounds.getCenter();
                      console.log(this.polygons);
                      console.log(center);

                      const length =
                        google.maps.geometry.spherical.computeLength(
                          this.polygons.getPath()
                        );
                      const area = google.maps.geometry.spherical.computeArea(
                        this.polygons.getPath()
                      );
                      const contentString = `Length: ${length.toFixed(
                        2
                      )} meters<br>Area: ${area.toFixed(2)} square meters`;
                      const infowindow = new google.maps.InfoWindow({
                        content: contentString,
                        position: center,
                      });

                      infowindow.open(this.map);

                      this.drawingManager.setDrawingMode(null);
                    }
                  }
                );
              } catch (error) {
                console.error('Error loading GeoTIFF:', error);
              }
            }
          });
      });
    } else if (!this.tifCheckbox) {
      this.closePopup();
      this.tiffLayer.setMap(null);
      this.tiffLayer = null;
      if (this.tifCheckbox1) {
        this.drawingManager1.setMap(this.map);
      }
      this.drawingManager.setMap(null);
      google.maps.event.clearListeners(
        this.map,
        'zoom_changed',
        this.zoomChangeListener
      );
      if (this.polygons) {
        this.polygons.setMap(null);
      }
    }
  }

  async toggleTIF1() {
    this.tifCheckbox1 = !this.tifCheckbox1;
    this.closePopup();
    if (this.tifCheckbox1) {
      this.route.queryParams.subscribe((params) => {
        const taskTitle = params['taskTitle'];
        this.firestore
          .collection('Project')
          .doc(taskTitle)
          .valueChanges()
          .subscribe(async (data: any) => {
            if (data) {
              this.ngxLoader.start();
              this.url = data.Downloadurl3;
              this.url2 = data.Downloadurl4;

              try {
                let secondPointInfoWindow: any;

                let numRows = this.pixels.length;
                let numCols = 0;
                console.log(numRows);

                if (numRows > 0) {
                  numCols = (this.pixels[0] as unknown as any[]).length;
                }

                const twoDArray: number[][] = new Array(numRows);

                for (let i = 0; i < numRows; i++) {
                  twoDArray[i] = new Array(numCols);
                  for (let j = 0; j < numCols; j++) {
                    twoDArray[i][j] = (this.pixels[i] as unknown as any[])[j];
                  }
                }

                console.log(this.pixels);
                console.log(twoDArray);

                const elevationdata = Array.from([this.pixels[0]]);
                console.log(elevationdata);

                const bbox = this.image.getBoundingBox();

                const bounds = new google.maps.LatLngBounds(
                  new google.maps.LatLng(bbox[1], bbox[0]),
                  new google.maps.LatLng(bbox[3], bbox[2])
                );
                console.log('Bounds:', bounds);

                const altitude = 0;

                const tiffLayer = new google.maps.GroundOverlay(
                  this.url,
                  bounds,
                  {
                    altitude,
                    zIndex: 0,
                  }
                );
                console.log(tiffLayer);
                this.tiffLayer1 = tiffLayer;

                this.tiffLayer1.setMap(this.map);
                const img = new Image();

                img.src = this.url;

                img.addEventListener('load', () => {
                  console.log('Image loaded successfully!');
                  setTimeout(() => {
                    this.ngxLoader.stop();
                  }, 3000);
                });
                this.map.fitBounds(bounds);

                google.maps.event.addListener(
                  tiffLayer,
                  'click',
                  async (event: { latLng: any; mapPoint: any }) => {
                    const latLng = event.latLng;
                    if (latLng && latLng.lat && latLng.lng) {
                      if (!this.referencePoint) {
                        this.referencePoint = latLng;
                        const lat = latLng.lat();
                        const lng = latLng.lng();
                        console.log(lat, lng);

                        console.log(this.referencePoint);
                        this.referenceelevation =
                          await this.getElevationForPoint(lat, lng);
                        console.log(this.referenceelevation);

                        const contentString = `Latitude: ${latLng
                          .lat()
                          .toFixed(6)}<br>Longitude: ${latLng
                          .lng()
                          .toFixed(6)}<br>Height: ${
                          this.referenceelevation
                        } meters`;
                        const infowindow = new google.maps.InfoWindow({
                          content: contentString,
                          position: latLng,
                        });

                        infowindow.open(this.map);
                      } else if (!this.secondPoint) {
                        this.secondPoint = latLng;
                        this.currentElevation = await this.getElevationForPoint(
                          latLng.lat(),
                          latLng.lng()
                        );

                        const heightDifference = this.HeightDifference(
                          this.referenceelevation,
                          this.currentElevation
                        );
                        if (heightDifference) {
                          const contentString = `Latitude: ${latLng
                            .lat()
                            .toFixed(6)}<br>Longitude: ${latLng
                            .lng()
                            .toFixed(6)}<br>Height:${
                            this.currentElevation
                          }<br>Height Difference: ${heightDifference} meters`;
                          const infowindow = new google.maps.InfoWindow({
                            content: contentString,
                            position: latLng,
                          });

                          infowindow.open(this.map);
                          secondPointInfoWindow = infowindow;
                        }
                      } else {
                        if (secondPointInfoWindow) {
                          secondPointInfoWindow.close();
                          secondPointInfoWindow = null;
                        }

                        this.secondPoint = latLng;
                        this.currentElevation = await this.getElevationForPoint(
                          latLng.lat(),
                          latLng.lng()
                        );
                        const heightDifference = this.HeightDifference(
                          this.referenceelevation,
                          this.currentElevation
                        );
                        if (heightDifference) {
                          const contentString = `Latitude: ${latLng
                            .lat()
                            .toFixed(6)}<br>Longitude: ${latLng
                            .lng()
                            .toFixed(6)}<br>Height:${
                            this.currentElevation
                          }<br>Height Difference: ${heightDifference} meters`;
                          const infowindow = new google.maps.InfoWindow({
                            content: contentString,
                            position: latLng,
                          });

                          infowindow.open(this.map);
                          secondPointInfoWindow = infowindow;
                        }
                      }
                    } else {
                      console.error('LatLng is undefined.');
                    }
                  }
                );
                if (this.drawingManager) {
                  this.drawingManager.setMap(null);
                }
                this.drawingManager1 = new google.maps.drawing.DrawingManager({
                  drawingMode: google.maps.drawing.OverlayType.POLYGON,
                  drawingControl: true,
                  drawingControlOptions: {
                    position: google.maps.ControlPosition.TOP_CENTER,
                    drawingModes: [google.maps.drawing.OverlayType.POLYGON],
                  },
                  polygonOptions: {
                    strokeColor: '#FF0000',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#FF0000',
                    fillOpacity: 0.35,
                  },
                });

                this.drawingManager1.setMap(this.map);

                google.maps.event.addListener(
                  this.drawingManager1,
                  'overlaycomplete',
                  async (event: { type: any; overlay: any }) => {
                    console.log('overlaycomplete');

                    if (
                      event.type === google.maps.drawing.OverlayType.POLYGON
                    ) {
                      this.polygons = event.overlay;
                      console.log(this.polygons);

                      const bounds = this.calculatePolygonBounds(this.polygons);
                      const center = bounds.getCenter();
                      const length =
                        google.maps.geometry.spherical.computeLength(
                          this.polygons.getPath()
                        );
                      const area = google.maps.geometry.spherical.computeArea(
                        this.polygons.getPath()
                      );
                      this.averageHeight = await this.getelevationfrompoly(
                        this.polygons
                      );

                      const volume = this.CalculateVolume(
                        area,
                        this.averageHeight
                      );

                      const contentString = `Length: ${length.toFixed(
                        2
                      )} meters<br>Area: ${area.toFixed(
                        2
                      )} square meters<br>Volume: ${volume.toFixed(
                        2
                      )} cubic meters`;
                      const infowindow = new google.maps.InfoWindow({
                        content: contentString,
                        position: center,
                      });

                      infowindow.open(this.map);

                      this.drawingManager1.setDrawingMode(null);
                    }
                  }
                );
              } catch (error) {
                console.error('Error loading GeoTIFF:', error);
              }
            }
          });
      });
    } else if (!this.tifCheckbox1) {
      this.closePopup();
      this.tiffLayer1.setMap(null);
      this.tiffLayer1 = null;
      if (this.tifCheckbox) {
        this.drawingManager.setMap(this.map);
      }
      this.drawingManager1.setMap(null);
      this.polygons.setMap(null);
    }
  }
  HeightDifference(reference: any, current: any) {
    return reference - current;
  }

  calculatePolygonBounds(polygon: { getPath: () => any }) {
    const path = polygon.getPath();
    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;

    path.forEach(function (latLng: { lat: () => any; lng: () => any }) {
      const lat = latLng.lat();
      const lng = latLng.lng();

      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    });

    return new google.maps.LatLngBounds(
      new google.maps.LatLng(minLat, minLng),
      new google.maps.LatLng(maxLat, maxLng)
    );
  }

  async toggleKML2() {
    this.kmlCheckbox2 = !this.kmlCheckbox2;
    this.closePopup();
    if (this.kmlCheckbox2) {
      this.route.queryParams.subscribe((params) => {
        const taskTitle = params['taskTitle'];
        this.title = taskTitle;
        this.firestore
          .collection('Project')
          .doc(taskTitle)
          .valueChanges()
          .subscribe((data: any) => {
            if (data) {
              this.ngxLoader.start();
              this.url = data.Downloadurl10;
              this.getFileExtension(this.url);

              if (this.extension === 'kml') {
                const src = this.url;
                var kmlLayer = new google.maps.KmlLayer(src, {
                  suppressInfoWindows: true,
                  preserveViewport: true,
                  map: this.map,
                });
                setTimeout(() => {
                  this.ngxLoader.stop();
                }, 5000);
                kmlLayer.addListener('status_changed', async () => {
                  if (kmlLayer.getStatus() === 'OK') {
                    // The KML layer has finished loading

                    // Extract and parse KML data from the KMZ file
                    const response = await fetch(this.url);
                    const kmlData = await response.text();
                    this.parseKMLData(kmlData);
                  }
                });
                kmlLayer.addListener(
                  'click',
                  (event: {
                    latLng: any;
                    featureData: {
                      name: string;
                      description: string;
                      viewUrl: string;
                    };
                  }) => {
                    var name = event.featureData.name;
                    var description = event.featureData.description as any;
                    var viewUrl = event.featureData.viewUrl;
                    var measurement = /<td>Measuremen<\/td>\s*<td>(.*?)<\/td>/;
                    var value = description.match(measurement);
                    if (value) {
                      // Extracted Measuremen value
                      var measuremenValue = value[1];
                      this.length = measuremenValue;
                      // Log the Measuremen value
                      console.log('Measuremen:', measuremenValue);
                    } else {
                      console.error('Measuremen value not found in the table.');
                    }
                    var contentString = `
              <div>
              <h3>${name}</h3>
              <p>${description}</p>
              <a href="${viewUrl}" target="_blank">View Place</a>
              // <p>${description.measurement}</p>
              </div>
            `;

                    const infoWindow = new google.maps.InfoWindow({
                      content: contentString,
                      position: event.latLng,
                    });

                    infoWindow.open(this.map);
                  }
                );
              } else {
                if (this.urls.length > 0) {
                  for (let i = 0; i < this.urls.length; i++) {
                    console.log(this.urls[i]);
                    fetch(this.urls[i])
                      .then((response) => response.arrayBuffer())
                      .then((arrayBuffer) => {
                        this.unzip(arrayBuffer)
                          .then((unzipped) => {
                            this.deleteFileFromZip(unzipped, 'legend0.png');

                            unzipped
                              .generateAsync({
                                type: 'uint8array',
                              })
                              .then((data) => {
                                const kmlBlob = new Blob([data], {
                                  type: 'application/vnd.google-earth.kml+xml',
                                });

                                const kmlDataUrl = URL.createObjectURL(kmlBlob);
                                console.log(kmlDataUrl);

                                const kmlLayer = new google.maps.KmlLayer(
                                  this.urls[i],
                                  {
                                    suppressInfoWindows: true,
                                    preserveViewport: false,
                                    map: this.map,
                                  }
                                );
                                this.kmlLayers[i] = kmlLayer;
                                console.log(this.kmlLayer);
                                this.ngxLoader.stop();

                                if (i === 0) {
                                  kmlLayer.addListener('status_changed', () => {
                                    if (kmlLayer.getStatus() === 'OK') {
                                      // The KML layer has finished loading

                                      // Extract and parse KML data from the KMZ file

                                      this.extractAndParseKMLFromKMZ(
                                        this.urls[0]
                                      );
                                    }
                                  });
                                }

                                const self = this;
                                kmlLayer.addListener(
                                  'click',
                                  (event: {
                                    latLng: any;
                                    featureData: {
                                      name: string;
                                      description: string;
                                      viewUrl: string;
                                    };
                                  }) => {
                                    var name = event.featureData.name;
                                    var description =
                                      event.featureData.description;
                                    var measurement =
                                      /<td>Measuremen<\/td>\s*<td>(.*?)<\/td>/;
                                    var value = description.match(measurement);
                                    if (value) {
                                      // Extracted Measuremen value
                                      var measuremenValue = value[1];
                                      this.length = measuremenValue;
                                      // Log the Measuremen value
                                      console.log(
                                        'Measuremen:',
                                        measuremenValue
                                      );
                                    } else {
                                      console.error(
                                        'Measuremen value not found in the table.'
                                      );
                                    }
                                    var contentString = `
                                <div>
                                  <h3>${name}</h3>
                                  <p>${description}</p>
                                 </div>
                                `;

                                    const infoWindow =
                                      new google.maps.InfoWindow({
                                        content: contentString,
                                        position: event.latLng,
                                      });

                                    infoWindow.open(self.map);
                                  }
                                );
                              });
                          })
                          .catch((error) => {
                            console.error(
                              'Error unzipping the KMZ file:',
                              error
                            );
                          });
                      })
                      .catch((error) => {
                        console.error('Error fetching the KMZ file:', error);
                      });
                  }
                } else {
                  fetch(this.url)
                    .then((response) => response.arrayBuffer())
                    .then((arrayBuffer) => {
                      this.unzip(arrayBuffer)
                        .then((unzipped) => {
                          this.deleteFileFromZip(unzipped, 'legend0.png');

                          unzipped
                            .generateAsync({ type: 'uint8array' })
                            .then((data) => {
                              const kmlBlob = new Blob([data], {
                                type: 'application/vnd.google-earth.kml+xml',
                              });

                              const kmlDataUrl = URL.createObjectURL(kmlBlob);
                              console.log(kmlDataUrl);

                              const kmlLayer = new google.maps.KmlLayer(
                                this.url,
                                {
                                  suppressInfoWindows: true,
                                  preserveViewport: false,
                                  map: this.map,
                                }
                              );
                              this.kmlLayer = kmlLayer;
                              this.ngxLoader.stop();
                              kmlLayer.addListener('status_changed', () => {
                                if (kmlLayer.getStatus() === 'OK') {
                                  // The KML layer has finished loading

                                  // Extract and parse KML data from the KMZ file
                                  this.extractAndParseKMLFromKMZ(this.url);
                                }
                              });
                              const self = this;
                              kmlLayer.addListener(
                                'click',
                                (event: {
                                  latLng: any;
                                  featureData: {
                                    name: string;
                                    description: string;
                                    viewUrl: string;
                                  };
                                }) => {
                                  var name = event.featureData.name;
                                  var description =
                                    event.featureData.description;
                                  var measurement =
                                    /<td>Measuremen<\/td>\s*<td>(.*?)<\/td>/;
                                  var value = description.match(measurement);
                                  if (value) {
                                    // Extracted Measuremen value
                                    var measuremenValue = value[1];
                                    this.length = measuremenValue;
                                    // Log the Measuremen value
                                    console.log('Measuremen:', measuremenValue);
                                  } else {
                                    console.error(
                                      'Measuremen value not found in the table.'
                                    );
                                  }
                                  var contentString = `
                                <div>
                                  <h3>${name}</h3>
                                  <p>${description}</p>
                                 </div>
                                `;

                                  const infoWindow = new google.maps.InfoWindow(
                                    {
                                      content: contentString,
                                      position: event.latLng,
                                    }
                                  );

                                  infoWindow.open(self.map);
                                }
                              );
                            });
                        })
                        .catch((error) => {
                          console.error('Error unzipping the KMZ file:', error);
                        });
                    })
                    .catch((error) => {
                      console.error('Error fetching the KMZ file:', error);
                    });
                }
              }
            }
          });
      });
    } else {
      if (!this.kmlCheckbox2) {
        this.closePopup();
        if (this.urls.length === 0) {
          this.kmlLayer.setMap(null);
          this.kmlLayer = null;
        }
        console.log(this.overlay);
        if (this.urls.length > 0) {
          for (let i = 0; i < this.urls.length; i++) {
            this.kmlLayers[i].setMap(null);
            this.kmlLayers[i] = null;
          }
        }
        this.parseKMLData('123');
      }
    }
  }
  extractAndParseKMLFromKMZ(kmzUrl: string) {
    fetch(kmzUrl)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => {
        // Use a library like JSZip to extract KML data from the KMZ file
        // Note: You may need to include JSZip in your project
        JSZip.loadAsync(arrayBuffer).then((zip) => {
          zip.forEach((relativePath, zipEntry) => {
            if (relativePath.endsWith('.kml')) {
              zipEntry.async('string').then((kmlData) => {
                // Now you have the KML data, you can parse it as needed
                this.parseKMLData(kmlData);
              });
            }
          });
        });
      })
      .catch((error) => {
        console.error('Error extracting KML from KMZ:', error);
      });
  }

  parseKMLData(kmlData: string) {
    console.log(kmlData);
    const overlay = new google.maps.OverlayView();
    let divs: { div: any; lat: any; lng: any }[] = [];
    if (this.kmlCheckbox2) {
      // Extract all name values
      var namePattern = /<Placemark.*?>\s*<name>(.*?)<\/name>/gs;
      var nameMatches = Array.from(kmlData.matchAll(namePattern));
      var nameValues = nameMatches.map((match) => match[1].trim());

      // Extract all coordinates
      var coordinatesPattern = /<coordinates>(.*?)<\/coordinates>/g;
      var coordinatesMatches = Array.from(kmlData.matchAll(coordinatesPattern));

      // Use a single OverlayView for all points

      const bounds = new google.maps.LatLngBounds();

      overlay.onAdd = function () {
        const panes = this.getPanes();

        for (let i = 0; i < coordinatesMatches.length; i++) {
          var coordinates = coordinatesMatches[i][1].trim().split(',');
          const lng = parseFloat(coordinates[0]);
          const lat = parseFloat(coordinates[1]);
          bounds.extend(new google.maps.LatLng(lat, lng));
          // Check if the name is "0", skip it
          if (nameValues[i] !== '0') {
            console.log(123);

            const div = document.createElement('div');
            div.style.position = 'absolute';
            div.style.fontWeight = 'bold';
            div.style.fontSize = '10px'; // Adjust the font size as needed
            div.style.zIndex = '1000';
            div.style.color = 'red';
            // Use the specific placemark name or a default name
            div.innerHTML = nameValues[i] || 'Default Name';

            // Append div to overlayMouseTarget for better positioning
            panes.overlayMouseTarget.appendChild(div);
            divs.push({ div, lat, lng });
          }
        }
        this.divs = divs;
      };
      google.maps.event.addListener(this.map, 'zoom_changed', () => {
        const overlayProjection = overlay.getProjection();
        const currentZoom = this.map.getZoom();
        for (let i = 0; i < divs.length; i++) {
          const { div, lat, lng } = divs[i];
          const fontSize = currentZoom - 5; // You can adjust this formula as needed
          div.style.fontSize = fontSize + 'px';
          console.log(div.style.fontSize);
          const position = overlayProjection.fromLatLngToDivPixel(
            new google.maps.LatLng(lat, lng)
          );
          const position1 = new google.maps.LatLng(lat, lng);
          div.style.left = position.x + 'px';
          div.style.top = position.y + 'px';
        }
      });
      google.maps.event.addListener(this.map, 'projection_changed', () => {
        const overlayProjection = overlay.getProjection();
        for (let i = 0; i < divs.length; i++) {
          const { div, lat, lng } = divs[i];
          const position = overlayProjection.fromLatLngToDivPixel(
            new google.maps.LatLng(lat, lng)
          );
          div.style.left = position.x + 'px';
          div.style.top = position.y + 'px';
        }
      });
      google.maps.event.addListener(this.map, 'bounds_changed', () => {
        const overlayProjection = overlay.getProjection();
        for (let i = 0; i < divs.length; i++) {
          const { div, lat, lng } = divs[i];
          const position = overlayProjection.fromLatLngToDivPixel(
            new google.maps.LatLng(lat, lng)
          );
          div.style.left = position.x + 'px';
          div.style.top = position.y + 'px';
        }
      });
      google.maps.event.addListener(this.map, 'center_changed', () => {
        const overlayProjection = overlay.getProjection();
        for (let i = 0; i < divs.length; i++) {
          const { div, lat, lng } = divs[i];
          const position = overlayProjection.fromLatLngToDivPixel(
            new google.maps.LatLng(lat, lng)
          );
          div.style.left = position.x + 'px';
          div.style.top = position.y + 'px';
        }
      });
      google.maps.event.addListener(this.map, 'tilesloaded', () => {
        const overlayProjection = overlay.getProjection();
        for (let i = 0; i < divs.length; i++) {
          const { div, lat, lng } = divs[i];
          const position = overlayProjection.fromLatLngToDivPixel(
            new google.maps.LatLng(lat, lng)
          );
          div.style.left = position.x + 'px';
          div.style.top = position.y + 'px';
        }
      });
      google.maps.event.addListenerOnce(this.map, 'idle', () => {
        const overlayProjection = overlay.getProjection();
        console.log(overlayProjection);

        for (let i = 0; i < divs.length; i++) {
          const { div, lat, lng } = divs[i];
          console.log(div.innerHTML);

          const position = overlayProjection.fromLatLngToDivPixel(
            new google.maps.LatLng(lat, lng)
          );
          console.log(position);
          console.log(window.screen.width, window.screen.height);
          div.style.left = position.x + 'px';
          div.style.top = position.y + 'px';
        }
        // overlay.fitBounds(this.bounds);
      });
      google.maps.event.addListener(this.map, 'maptypeid_changed', () => {
        for (let i = 0; i < divs.length; i++) {
          const mapType = this.map.getMapTypeId();
          const div = divs[i].div;
          if (mapType === 'roadmap') {
            div.style.color = 'green';
          } else if (mapType === 'satellite') {
            div.style.color = 'white';
          } else {
            div.style.color = 'red';
          }
          console.log(mapType);
        }
      });
      this.overlay = overlay;
      this.map.fitBounds(this.bounds);
      this.overlay.setMap(this.map);
      console.log(this.overlay);
    } else if (kmlData === '123') {
      console.log(kmlData, this.overlay.divs);
      for (let i = 0; i < this.overlay.divs.length; i++) {
        const div = this.overlay.divs[i].div;
        console.log(div.innerHTML);
        div.style.display = 'none'; // Remove div from the DOM
      }
      divs = [];
      // overlay.setMap(this.map);
    }
  }

  getExtensionFromStorageLink(storageLink: string): string | null {
    console.log(storageLink);

    const parts = storageLink.split('?');

    const extensionParts = parts[0].split('.');

    if (extensionParts.length > 1) {
      return extensionParts[extensionParts.length - 1];
    } else {
      return null;
    }
  }
  getFileExtension(url: any) {
    const storageLink = url;
    console.log(storageLink);

    this.extension = this.getExtensionFromStorageLink(storageLink);
    console.log('File extension:', this.extension);
  }
  deleteFileFromZip(zip: JSZip, fileName: string) {
    if (zip.file(fileName)) {
      zip.remove(fileName);
      console.log('removed');
    }
  }

  unzip(
    zipData:
      | string
      | ArrayBuffer
      | number[]
      | Uint8Array
      | Blob
      | NodeJS.ReadableStream
      | Promise<
          | string
          | ArrayBuffer
          | number[]
          | Uint8Array
          | Blob
          | NodeJS.ReadableStream
        >
  ) {
    console.log(JSZip.loadAsync(zipData));

    return JSZip.loadAsync(zipData);
  }
  calculateElevationDataInPolygon(
    elevationData:
      | string
      | any[]
      | (Uint8Array & GeoTIFF.Dimensions)
      | (Int8Array & GeoTIFF.Dimensions)
      | (Uint16Array & GeoTIFF.Dimensions)
      | (Int16Array & GeoTIFF.Dimensions)
      | (Uint32Array & GeoTIFF.Dimensions)
      | (Int32Array & GeoTIFF.Dimensions)
      | (Float32Array & GeoTIFF.Dimensions)
      | (Float64Array & GeoTIFF.Dimensions),
    polygon: any
  ) {
    const elevationDataInPolygon = [];

    const minY = polygon.getSouthWest().lat();
    const maxY = polygon.getNorthEast().lat();
    const minX = polygon.getSouthWest().lng();
    const maxX = polygon.getNorthEast().lng();

    for (let y = 0; y < elevationData.length; y++) {
      for (let x = 0; x < elevationData[y].length; x++) {
        elevationDataInPolygon.push(elevationData[y][x]);
      }
    }

    return elevationDataInPolygon;
  }
  async getElevationForPoint(latitude: number, longitude: number) {
    const origin = this.image.getOrigin();
    const pixelSize = this.image.getFileDirectory().ModelPixelScale;
    const col = Math.floor((longitude - origin[0]) / pixelSize[0]);
    const row = Math.floor((origin[1] - latitude) / pixelSize[1]);
    const elevationDatas = await this.image.readRasters({
      samples: [0],
      window: [col, row, col + 1, row + 1],
    });
    this.height = elevationDatas[0][0];
    return this.height;
  }

  calculateAverageAltitude(elevationDataInPolygon: any[]) {
    const sumAltitude = elevationDataInPolygon.reduce(
      (acc, elevation) => acc + elevation,
      0
    );
    const averageAltitude = sumAltitude / elevationDataInPolygon.length;
    return averageAltitude;
  }
  CalculateVolume(
    area: any | (number | GeoTIFF.TypedArray)[],
    averageAltitude: number
  ) {
    const volume = area * averageAltitude;
    return volume;
  }
  async getelevationfrompoly(polygonCoordinates: any) {
    console.log(polygonCoordinates.getPath().getArray());

    const boundingBox = this.calculateBoundingBox(
      polygonCoordinates.getPath().getArray()
    );
    const origin = this.image.getOrigin();
    console.log('Origin--', origin);

    const pixelSize = this.image.getFileDirectory().ModelPixelScale;
    console.log(pixelSize);

    const minCol = Math.floor((boundingBox.minLng - origin[0]) / pixelSize[0]);
    const maxCol = Math.floor((boundingBox.maxLng - origin[0]) / pixelSize[0]);
    const minRow = Math.floor((origin[1] - boundingBox.maxLat) / pixelSize[1]);
    const maxRow = Math.floor((origin[1] - boundingBox.minLat) / pixelSize[1]);
    console.log(minCol, minRow, maxCol, maxRow);

    const elevationData = await this.image.readRasters({
      window: [minCol, minRow, maxCol, maxRow],
    });
    console.log(elevationData);

    const allElevationValues: number[] = [];

    elevationData.forEach((row: number[]) => {
      row.forEach((elevation: number) => {
        allElevationValues.push(elevation);
      });
    });
    const latLngArray = [];

    for (let row = minRow + 1; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const latitude = origin[1] - row * pixelSize[1];
        const longitude = origin[0] + col * pixelSize[0];

        latLngArray.push([latitude, longitude]);
      }
    }

    let minHeight = Number.POSITIVE_INFINITY;
    let maxHeight = Number.NEGATIVE_INFINITY;
    for (const elevation of allElevationValues) {
      if (elevation < minHeight) {
        minHeight = elevation;
      }
      if (elevation > maxHeight) {
        maxHeight = elevation;
      }
    }

    console.log(`Min Height: ${minHeight}`);
    console.log(`Max Height: ${maxHeight}`);

    const sumElevation = allElevationValues.reduce(
      (acc: any, elevation: any) => acc + elevation,
      0
    );
    console.log(sumElevation);

    const averageElevation = sumElevation / allElevationValues.length;
    console.log('1', averageElevation);

    console.log(elevationData[0][0]);
    let mini = Number.MAX_VALUE;
    let maxi = Number.MIN_VALUE;
    for (const coord of polygonCoordinates.getPath().getArray()) {
      let height: any;
      height = await this.getElevationForPoint(coord.lat(), coord.lng());
      // console.log(height);
      if (height < mini) {
        mini = height;
      } else {
        // console.log(1);
        maxi = height;
      }
    }
    console.log(minHeight);
    // console.log('mini', mini);
    console.log('maxi', maxi);
    let average = (maxi - minHeight) / 2;
    console.log('Average', average);
    if (averageElevation > maxi) {
      console.log(123);
      return averageElevation - maxi;
    } else {
      return (maxi - minHeight + average) / 2;
    }
  }
  async getelevationfrompoly1(polygonCoordinates: any) {
    const width = this.image.getWidth();
    const height = this.image.getHeight();
    const origin = this.image.getOrigin();
    console.log('Origin--', origin);

    const pixelSize = this.image.getFileDirectory().ModelPixelScale;

    const path = polygonCoordinates.getPath();
    const elevationDataPromises = path.getArray().map(async (latLng: any) => {
      const minCol = Math.floor((latLng.lng() - origin[0]) / pixelSize[0]);
      const maxRow = Math.floor((origin[1] - latLng.lat()) / pixelSize[1]);

      if (minCol >= 0 && minCol < width && maxRow >= 0 && maxRow < height) {
        const elevationDataRow = await this.image.readRasters({
          window: [minCol, maxRow, minCol + 1, maxRow + 1],
        });

        return elevationDataRow[0][0];
      } else {
        return null;
      }
    });

    const allElevationValues = await Promise.all(elevationDataPromises);
    console.log(allElevationValues);

    let minHeight = Number.POSITIVE_INFINITY;
    let maxHeight = Number.NEGATIVE_INFINITY;
    let sumElevation = 0;

    allElevationValues.forEach((elevation: any) => {
      if (elevation !== null) {
        sumElevation += elevation;
        minHeight = Math.min(minHeight, elevation);
        maxHeight = Math.max(maxHeight, elevation);
      }
    });

    const averageElevation = sumElevation / allElevationValues.length;
    console.log(`Min Height: ${minHeight}`);
    console.log(`Max Height: ${maxHeight}`);
    console.log(`Average Height: ${averageElevation}`);

    const maxElevationIndex = allElevationValues.indexOf(maxHeight);

    if (maxElevationIndex !== -1) {
      const maxElevationLatLng = path.getAt(
        maxElevationIndex % path.getLength()
      );
      console.log(maxElevationLatLng);

      if (maxElevationLatLng) {
      } else {
        console.error('Invalid index for max elevation.');
      }
    } else {
      console.error('Max elevation not found in the elevationData array.');
    }
    console.log(maxHeight - minHeight);

    return maxHeight - minHeight;
  }

  calculateBoundingBox(coordinates: google.maps.LatLngBounds[]): {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  } {
    if (coordinates.length === 0) {
      return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 };
    }

    let minLat = Number.POSITIVE_INFINITY;
    let maxLat = Number.NEGATIVE_INFINITY;
    let minLng = Number.POSITIVE_INFINITY;
    let maxLng = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < coordinates.length; i++) {
      const lat = coordinates[i].lat();
      const lng = coordinates[i].lng();

      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    }

    console.log(minLat, maxLat, minLng, maxLng);

    return { minLat, maxLat, minLng, maxLng };
  }
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
}
