import { Component, OnInit } from '@angular/core';
import {UserService} from '../services/user.service'
import {Router} from '@angular/router';
import { ToastController } from '@ionic/angular';
import { ActionSheetController, Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Storage } from '@ionic/storage';
import { FCM } from '@ionic-native/fcm/ngx';
import { GeneralService} from '../services/general.service';
@Component({
	selector: 'app-settings',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
	toast: any;
	tokenLocalStorage: any;
	language: any;
	firstCharUser: any;
	notifyFlag: any;
	userData: any;
	error: any;
	privacyPolicy: any;
	constructor(public _generalService: GeneralService,private platform: Platform,private fcm: FCM,private storage: Storage,private socialSharing: SocialSharing,public actionSheetController: ActionSheetController,public _userService: UserService, private router: Router, public toastController: ToastController) { 
	}

	ngOnInit() {
		this.getUrl();
		this.platform.backButton.subscribeWithPriority(1, () => {
			this.router.navigate(['allcategory']);
		});

		this.tokenLocalStorage = localStorage.getItem('accessToken');
		this.notifyFlag = localStorage.getItem('notification');

		if(this.tokenLocalStorage){
			var base64Url = this.tokenLocalStorage.split('.')[1];
			var base64 = base64Url.replace('-', '+').replace('_', '/');
			var decodedToken = JSON.parse(window.atob(base64));
			if(decodedToken.user.email){
				this.firstCharUser = decodedToken.user.email.charAt(0).toUpperCase();
			}
		}
		this.language = localStorage.getItem('language');

		if(this.tokenLocalStorage){
			this.getUserDetail();
		}
	}

	getUrl(){
		this._generalService.getPolicy().subscribe(
			(res: any) => {
				this.privacyPolicy = res;
			},
			(err) => {
				this.error = err;
			});
	}
	async logout(){
		const actionSheet = await this.actionSheetController.create({
			buttons: [{
				text: 'Logout',
				role: 'destructive',
				handler: () => {
					this._userService.logOut();
					localStorage.removeItem('accessToken');
					this.fcm.getToken().then(token => {
						localStorage.setItem('deviceToken', token);
					});

					this.fcm.onTokenRefresh().subscribe(token => {
						localStorage.setItem('deviceToken', token);
					});
					this.router.navigate(['/allcategory']);
					this.toast = this.toastController.create({
						message: 'You have been logged out!',
						duration: 2000,
						color: 'primary'
					}).then((toastData)=>{
						toastData.present();
					});
				}
			}, {
				text: 'Cancel',
				handler: () => {
				}
			}]
		});
		localStorage.setItem('language', 'English');
		await actionSheet.present();
	}

	sendShare() {
		var message = "An awesome news app that is only you need!";
		var subject = "Install Trivia Post";
		var url = this.privacyPolicy[0].applink;
		this.socialSharing.share("Check out Trivia Post App. I found it best for reading news","Trivia Post App", null , url)
		.then((entries) => {
			console.log('success ' + JSON.stringify(entries));
		})
		.catch((error) => {
			alert('error ' + JSON.stringify(error));
		});
	}

	languageChange($event){
		var language = $event.target.value;
		localStorage.setItem('language', language);
	}

	notificationSwitch(e){
		localStorage.setItem('notification', e.target.checked);
		this._userService.notifyToggle(e.target.checked).subscribe((res: any) => {
			this.getUserDetail();
			this.toast = this.toastController.create({
				message: res.message,
				duration: 2000,
				color: 'success'
			}).then((toastData)=>{
				toastData.present();
			});
		}, err => {
			console.log('err===========>', err.error.message);
			this.toast = this.toastController.create({
				message: err.error.message,
				duration: 2000,
				color: 'danger'
			}).then((toastData)=>{
				toastData.present();
			});
		})
	}

	getUserDetail(): void{
		this._userService.getUserDetail().subscribe(
			(res: any) => {
				this.userData = res.notification;
			},
			(err) => {
				this.error = err;
			});
	}
}