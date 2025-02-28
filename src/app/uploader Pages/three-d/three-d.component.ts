import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ListResult } from '@angular/fire/compat/storage/interfaces';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import * as OV from 'online-3d-viewer';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AngularFirestore } from '@angular/fire/compat/firestore';
@Component({
  selector: 'app-three-d',
  templateUrl: './three-d.component.html',
  styleUrls: ['./three-d.component.scss'],
})
export class ThreeDComponent implements OnInit {
  extension: any;
  objFile: string | null = null;
  mtlFile: string | null = null;
  jpgFiles: string[] = [];
  items$!: Observable<ListResult>;
  projectTitle: any;
  fbxFile: string | null = null;
  url: any;
  constructor(
    private storage: AngularFireStorage,
    private route: ActivatedRoute,
    private router: Router,
    private firestore: AngularFirestore,

    private ngxloader: NgxUiLoaderService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const taskTitle = params['taskTitle'];
      console.log(taskTitle);
      this.projectTitle = taskTitle;
      this.firestore
        .collection('Project')
        .doc(this.projectTitle)
        .valueChanges()
        .subscribe((data: any) => {
          this.url = data.url;
          this.url = this.url + '?autostart=1&preload=1&ui_hint=0';
          console.log(this.url);
          const iframe = document.querySelector('iframe');
          if (iframe) {
            iframe.src = this.url;
          }
        });
    });
    this.getFileUrls();
  }
  back() {
    this.route.queryParams.subscribe((params) => {
      const title = params['taskTitle'];
      this.router.navigate(['uploader-viewing'], { queryParams: { title } });
    });
  }
  async getFileUrlsInStorage(): Promise<{
    objFiles: string | null;
    mtlFiles: string | null;
    jpgFiles: string[];
    fbxFiles: string | null;
  }> {
    try {
      this.route.queryParams.subscribe((params) => {
        const taskTitle = params['taskTitle'];
        console.log(taskTitle);
        this.projectTitle = taskTitle;
      });

      const storageRef = this.storage.ref(
        `Project/${this.projectTitle}/3D View`
      );
      const files = await storageRef.listAll().toPromise();
      console.log(files?.items);

      if (files) {
        for (const fileRef of files.items) {
          const downloadURL = await fileRef.getDownloadURL();
          const fileExtension = await this.getFileExtension(downloadURL);

          if (fileExtension === 'obj') {
            this.objFile = downloadURL;
          } else if (fileExtension === 'mtl') {
            this.mtlFile = downloadURL;
          } else if (fileExtension === 'jpg') {
            this.jpgFiles.push(downloadURL);
          } else if (fileExtension === 'fbx') {
            this.fbxFile = downloadURL;
          }
        }
      }
      const objFiles = this.objFile;
      const mtlFiles = this.mtlFile;
      const jpgFiles = this.jpgFiles;
      const fbxFiles = this.fbxFile;
      console.log(fbxFiles);

      return {
        objFiles,
        mtlFiles,
        jpgFiles,
        fbxFiles,
      };
    } catch (error) {
      console.error('Error fetching file URLs:', error);
      return {
        objFiles: [] as any,
        mtlFiles: [] as any,
        jpgFiles: [],
        fbxFiles: [] as any,
      };
    }
  }

  getExtensionFromStorageLink(storageLink: string): string | null {
    const parts = storageLink.split('?');
    const extensionParts = parts[0].split('.');

    if (extensionParts.length > 1) {
      return extensionParts[extensionParts.length - 1];
    } else {
      return null;
    }
  }

  async getFileExtension(url: any): Promise<string | null> {
    const storageLink = url;
    this.extension = this.getExtensionFromStorageLink(storageLink);
    console.log('File extension:', this.extension);
    return this.extension;
  }

  async getFileUrls() {
    this.ngxloader.start();
    const { objFiles, mtlFiles, jpgFiles, fbxFiles } =
      await this.getFileUrlsInStorage();
    this.objFile = objFiles;
    this.mtlFile = mtlFiles;
    this.jpgFiles = jpgFiles;
    this.fbxFile = fbxFiles;
    // if (this.objFile && !this.fbxFile) {
    //   if (this.mtlFile && this.objFile) {
    //     // this.loadOBJWithTextures(this.mtlFile, this.objFile, this.jpgFiles);
    //     this.ngxloader.stop();
    //   } else {
    //     // Handle the case where this.mtlFile is null
    //     console.error('MTL file is null');
    //   }
    // } else {
    //   if (this.fbxFile) {
    //     // this.loadFBXWithTextures(this.fbxFile, this.jpgFiles);
    //     this.ngxloader.stop();
    //   } else {
    //     // Handle the case where this.mtlFile is null
    //     console.error('Error cannot load');
    //     this.ngxloader.stop();
    //   }
    // }
  }
  loadOBJWithTextures(mtlURL: string, objURL: string, textureURLs: string[]) {
    OV.SetExternalLibLocation('../../node_modules/online-3d-viewer/libs');

    let parentDiv = document.getElementById('scene-container');

    if (parentDiv) {
      try {
        let viewer = new OV.EmbeddedViewer(parentDiv, {
          backgroundColor: new OV.RGBAColor(0, 0, 0, 255),
          defaultColor: new OV.RGBColor(0, 0, 0),
          edgeSettings: new OV.EdgeSettings(false, new OV.RGBColor(0, 0, 0), 1),

          environmentSettings: new OV.EnvironmentSettings(textureURLs, false),
        });

        // Load a model providing model URLs
        viewer.LoadModelFromUrlList([objURL, mtlURL]);
      } catch (error) {
        console.error('Error creating or loading the viewer:', error);
      }
    } else {
      console.error('Parent container not found');
    }
  }
  loadFBXWithTextures(objURL: string, textureURLs: string[]) {
    OV.SetExternalLibLocation('../../node_modules/online-3d-viewer/libs');

    let parentDiv = document.getElementById('scene-container');
    textureURLs.push(objURL);
    if (parentDiv) {
      try {
        let viewer = new OV.EmbeddedViewer(parentDiv, {
          backgroundColor: new OV.RGBAColor(0, 0, 0, 255),
          defaultColor: new OV.RGBColor(0, 0, 0),
          edgeSettings: new OV.EdgeSettings(false, new OV.RGBColor(0, 0, 0), 1),

          environmentSettings: new OV.EnvironmentSettings(textureURLs, false),
        });

        // Load a model providing model URLs
        viewer.LoadModelFromUrlList(textureURLs);
      } catch (error) {
        console.error('Error creating or loading the viewer:', error);
      }
    } else {
      console.error('Parent container not found');
    }
  }
}
