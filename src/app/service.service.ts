import { ChangeDetectorRef, Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { DataClass } from './data-class';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import JSZip from 'jszip';
import { HttpClient } from '@angular/common/http';
import { NotifierService } from 'angular-notifier';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  private notificationSubject = new Subject<{
    type: string;
    message: string;
  }>();
  private dataCollection: AngularFirestoreCollection<DataClass>;
  private firestore!: firebase.firestore.Firestore;
  private downloadUrlsSubject: any[] = [];
  private downloadUrlsSubjects: any[] = [];
  private downloadsUrlsSubject: any[] = [];
  private downloadUrlSubject: any[] = [];
  private downloadsUrlsSubjects: any[] = [];
  tableDatas: any[] = [];
  constructor(
    private db: AngularFirestore,
    private http: HttpClient // private notifier: NotifierService
  ) {
    // this.firestore = firebase.firestore();
    this.dataCollection = this.db.collection<DataClass>('taskmanagement'); // Replace 'data' with your desired collection name
  }

  setDownloadUrls(urls: any[]): void {
    this.downloadUrlsSubject = urls;
    console.log(this.downloadUrlsSubject);
    const downloadedUrls = this.getDownloadUrls();
    console.log(downloadedUrls);
  }

  getDownloadUrls(): any[] {
    console.log(this.downloadUrlsSubject);
    return this.downloadUrlsSubject;
  }

  setDownloadUrl(urls: any[]): void {
    this.downloadsUrlsSubject = urls;
  }

  getDownloadUrl(): any[] {
    return this.downloadsUrlsSubject;
  }
  setDownloadUrlss(urls: any[]): void {
    this.downloadsUrlsSubjects = urls;
  }

  getDownloadUrlss(): any[] {
    return this.downloadsUrlsSubjects;
  }
  setDownloadsUrls(urls: any[]): void {
    this.downloadUrlsSubjects = urls;
  }

  getDownloadsUrls(): any[] {
    return this.downloadUrlsSubjects;
  }
  setsDownloadUrls(urls: any[]): void {
    this.downloadUrlSubject = urls;
  }

  getsDownloadUrls(): any[] {
    return this.downloadUrlSubject;
  }
  // Example method to fetch data from Firebase
  getData(): Observable<DataClass[]> {
    return this.dataCollection.valueChanges();
  }

  // Example method to add data to Firebase
  addData(data: DataClass): Promise<void> {
    const id = this.db.createId();
    return this.dataCollection.doc(id).set({ ...data });
  }

  //cross check ///
  private checkDatabaseConnection(): void {
    this.firestore
      .enableNetwork()
      .then(() => {
        console.log('Firestore database connection established.');
      })
      .catch((error) => {
        console.log('Firestore database connection failed:', error);
      });
  }
  setDatas(newItems: any): void {
    this.tableDatas.push(newItems);
    localStorage.setItem('tableDatas', JSON.stringify(this.tableDatas));
  }
  async convertKmzToKml(downloadUrl: string): Promise<string> {
    try {
      // Download the KMZ file from Firestore
      const kmzBlob = await this.downloadKmzFile(downloadUrl);

      if (kmzBlob) {
        // Read the KMZ file and extract KML
        const kmlContent = await this.extractKmlFromKmz(kmzBlob);
        return kmlContent;
      } else {
        throw new Error('Failed to download KMZ file.');
      }
    } catch (error) {
      console.error('Error converting KMZ to KML:', error);
      throw error;
    }
  }

  private async downloadKmzFile(
    downloadUrl: string
  ): Promise<Blob | undefined> {
    try {
      const response = await this.http
        .get(downloadUrl, { responseType: 'blob' })
        .toPromise();
      return response;
    } catch (error) {
      console.error('Error downloading KMZ file:', error);
      return undefined; // Return undefined if the download fails
    }
  }

  private async extractKmlFromKmz(kmzBlob: Blob): Promise<string> {
    try {
      const kmz = new JSZip();
      await kmz.loadAsync(kmzBlob);

      const kmlFile = kmz.file(/\.kml$/i)[0];
      if (kmlFile) {
        const kmlContent = await kmlFile.async('text');
        return kmlContent;
      } else {
        throw new Error('No KML file found in the KMZ archive.');
      }
    } catch (error) {
      console.error('Error extracting KML from KMZ:', error);
      throw error;
    }
  }
  getNotification() {
    return this.notificationSubject.asObservable();
  }

  showNotification(type: string, message: string): void {
    this.notificationSubject.next({ type, message });
  }
}
