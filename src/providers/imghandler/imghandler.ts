import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file';
import { FileChooser } from '@ionic-native/file-chooser';
import { FilePath } from '@ionic-native/file-path';
import { Camera, CameraOptions } from '@ionic-native/camera';
import firebase from 'firebase';
/*
  Generated class for the ImghandlerProvider provider.
  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class ImghandlerProvider {
  loadingCtrl: any;
  nativepath: any;
  firestore = firebase.storage();
  constructor(public camera: Camera,public filechooser: FileChooser,) {
  }

  
 /*
 
 For uploading an image to firebase storage.
 Called from - profilepic.ts
 Inputs - None.
 Outputs - The image url of the stored image. 
  
  */
  uploadimage() {
    let loader = this.loadingCtrl.create({
    content: 'Please wait'
    });
    const options: CameraOptions = {
    quality: 100,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
    }
    var promise = new Promise((resolve, reject) => {
    //alert("1");
    
    this.camera.getPicture(options).then((imageData) => {
    loader.present();
    var imageStore = this.firestore.ref('/profileimages').child(firebase.auth().currentUser.uid);
    imageStore.putString(imageData, 'base64').then((res) => {
    this.firestore.ref('/profileimages').child(firebase.auth().currentUser.uid).getDownloadURL().then((url) => {
    loader.dismiss()
    resolve(url);
    }).catch((err) => {
    reject(err);
    })
    }).catch((err) => {
    reject(err);
    })
    
    }, (err) => {
    }).catch((err) => {
    reject(err);
    });
    loader.dismiss();
    })
    return promise;
    }

picmsgstore() {
  var promise = new Promise((resolve, reject) => {
      this.filechooser.open().then((url) => {
        (<any>window).FilePath.resolveNativePath(url, (result) => {
          this.nativepath = result;
          (<any>window).resolveLocalFileSystemURL(this.nativepath, (res) => {
            res.file((resFile) => {
              var reader = new FileReader();
              reader.readAsArrayBuffer(resFile);
              reader.onloadend = (evt: any) => {
                var imgBlob = new Blob([evt.target.result], { type: 'image/jpeg' });
                var uuid = this.guid();
                var imageStore = this.firestore.ref('/picmsgs').child(firebase.auth().currentUser.uid).child('picmsg' + uuid);
                imageStore.put(imgBlob).then((res) => {
                    resolve(res.downloadURL);
                  }).catch((err) => {
                      reject(err);
                  })
                .catch((err) => {
                  reject(err);
                })
              }
            })
          })
        })
    })
  })    
   return promise;   
}

guid() {
function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}
return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
  s4() + '-' + s4() + s4() + s4();
}

}