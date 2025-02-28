import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapComponent } from './map.component';

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MapComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
// calculateBoundingBox(coordinates: google.maps.LatLngBounds[]): {
//   minLat: number;
//   maxLat: number;
//   minLng: number;
//   maxLng: number;
// } {
//   if (coordinates.length === 0) {
//     return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 };
//   }
//   console.log(coordinates);
//   const lat1 = coordinates[0].lat();
//   const lat2 = coordinates[1].lat();
//   const lat3 = coordinates[2].lat();
//   const lat4 = coordinates[3].lat();
//   const lng1 = coordinates[0].lat();
//   const lng2 = coordinates[1].lat();
//   const lng3 = coordinates[2].lat();
//   const lng4 = coordinates[3].lat();
//   console.log(lat1, lat2, lat3, lat4, lng1, lng2, lng3, lng4);

//   let minLat;
//   let maxLat;
//   let minLng;
//   let maxLng;
//   const latitude: any[] = [];
//   const longitude: any[] = [];
//   for (const coordinate of coordinates) {
//     const lat = coordinate.lat();
//     const lng = coordinate.lng();
//     latitude.push(lat);
//     longitude.push(lng);
//   }
//   // const lat2 = coordinates[1].lat();
//   // const lng2 = coordinates[1].lng();
//   // const lat3 = coordinates[2].lat();
//   // const lng3 = coordinates[2].lng();
//   // const lat4 = coordinates[3].lat();
//   // const lng4 = coordinates[3].lng();
//   // console.log(lat1, lng1, lat2, lng2, lat3, lng3, lat4, lng4);
//   // const minLat = Math.min(lat1, lat2, lat3, lat4);
//   // const maxLat = Math.max(lat1, lat2, lat3, lat4);
//   // const minLng = Math.min(lng1, lng2, lng3, lng4);
//   // const maxLng = Math.max(lng1, lng2, lng3, lng4);
//   // let minLat = Number.POSITIVE_INFINITY;
//   // let maxLat = Number.NEGATIVE_INFINITY;
//   // let minLng = Number.POSITIVE_INFINITY;
//   // let maxLng = Number.NEGATIVE_INFINITY;

//   // // Iterate over the rest of the coordinates
//   // for (const coord of coordinates) {
//   //   minLat = Math.min(minLat, coord.lat());
//   //   maxLat = Math.max(maxLat, coord.lat());
//   //   minLng = Math.min(minLng, coord.lng());
//   //   maxLng = Math.max(maxLng, coord.lng());
//   // }
//   minLat = Math.min(...latitude);
//   maxLat = Math.max(...latitude);
//   minLng = Math.min(...longitude);
//   maxLng = Math.max(...longitude);
//   console.log(minLat, maxLat, minLng, maxLng);
//   const markerPosition = new google.maps.LatLng(minLat, minLng);
//   const markerPosition1 = new google.maps.LatLng(maxLat, maxLng);
//   const marker = new google.maps.Marker({
//     position: markerPosition,
//     map: this.map, // Assuming 'map' is your Google Maps map object
//     title: `${minLat}-${minLng}`,
//   });
//   const marker1 = new google.maps.Marker({
//     position: markerPosition1,
//     map: this.map, // Assuming 'map' is your Google Maps map object
//     title: `${maxLat}-${maxLng}`,
//   });
//   marker.setMap(this.map);
//   marker1.setMap(this.map);
//   return { minLat, maxLat, minLng, maxLng };
// }
