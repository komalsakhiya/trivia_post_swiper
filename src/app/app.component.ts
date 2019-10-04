import { Component, ViewChild } from '@angular/core';
import { Platform, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { BookmarksComponent } from './bookmarks/bookmarks.component';
import { HomePage } from './home/home.page';
import { SettingsComponent } from './settings/settings.component';
import { FCM } from '@ionic-native/fcm/ngx';
import { Router } from '@angular/router';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import {Observable} from 'rxjs/Observable';
import { ToastController,} from '@ionic/angular';

import 'rxjs/add/observable/fromEvent';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  hide:boolean = true;
  toast:any;
  constructor(
    public toastController: ToastController,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private fcm: FCM,
    private router: Router,
    protected deeplinks: Deeplinks,
    ){
    if(!localStorage.getItem('language')){
      localStorage.setItem('language', "English");
    }

    if(!localStorage.getItem('notification')){
      localStorage.setItem('notification', "false");      
    }
    this.initializeApp();
  }

  initializeApp(){
    const handleBranch = () => {
      this.platform.ready().then(() => {
        this.statusBar.backgroundColorByHexString('#000000');
        this.splashScreen.hide();
      });
    }
  }
}