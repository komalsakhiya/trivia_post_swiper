import { Component, OnInit } from '@angular/core';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import {UserService} from '../services/user.service'
import {Router} from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';
import {FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import {Platform } from '@ionic/angular';
@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
	toast: any;
	loading: any;
	constructor(public platform:Platform, public toastController: ToastController,private googlePlus: GooglePlus, public _userService: UserService, private router: Router, private fb: Facebook) {}
	ngOnInit() {
		this.platform.backButton.subscribe(async () => {
            if(this.router.url.includes('login')){
                this.router.navigate(['settings']);
            }
        });
		this.rememberMe();
	}

	signupForm = new FormGroup({
		userName: new FormControl('', Validators.required),
		email: new FormControl('', [Validators.required, Validators.email]),
		mobile: new FormControl('', Validators.required),
		password: new FormControl('', Validators.required),
	});

	loginForm = new FormGroup({
		userName: new FormControl('', Validators.required),
		password: new FormControl('', Validators.required),
	});

	forgotPassword = new FormGroup({
		email: new FormControl('', [Validators.required, Validators.email])
	});

	user = {
		userName: "",
		email: "",
		mobile: "",
		password: "",
	}

	login: any;

	forgot = {
		email: "",
	}
	rememberMe(){
		if(localStorage.getItem("remembered")){
			var login = JSON.parse(localStorage.getItem("remembered"));
			console.log(login);

			this.login = {
				userName: login.userName,
				password: login.password
			}
		}else{
			this.login = {
				userName: "",
				password: ""
			}
		}
	}
	doGoogleLogin() {
		console.log("in google login============")
		this.googlePlus.login({})
		.then((res) => {
			this.loading = true;
			console.log('res==of google==============>', res);
			this._userService.googleLogin(res.accessToken).subscribe((res: any) => {
				this.loading = false;
				this.router.navigate(['allcategory']);
			}, err => {
				this.loading = false;
				console.log('err==========>', err)
			})
		})
		.catch(err => console.error('err==============>', err));
	}

	async doFbLogin() {
		console.log("in facebook login============")
		let permissions = new Array<string>();
		//the permissions your facebook app needs from the user
		permissions = ["public_profile", "email"];
		this.fb.login(permissions)
		.then((response: FacebookLoginResponse) => {
			this.loading = true;
			console.log('response=============>', response)
			let accessToken = response.authResponse.accessToken;
			console.log('accessToken=============,accessToken', accessToken)
			this._userService.fbLogin(accessToken).subscribe((res: any) => {
				this.loading = false;
				this.router.navigate(['allcategory']);
			}, err => {
				this.loading = false;
				console.log('err===========>', err)
			})
		})
	}

	signup(user){
		this.loading = true;
		this._userService.signup(user).subscribe((res:any)=>{
			this.loading = false;
			this.toast = this.toastController.create({
				message: res.message,
				duration: 2000,
				color: 'success'
			}).then((toastData)=>{
				console.log(toastData);
				toastData.present();
			});
			this.signupForm.reset();
			this.router.navigate(['settings']);
			this.router.navigate(['login']);
		},
		err=>{
			this.loading = false;
			this.toast = this.toastController.create({
				message: err.message,
				duration: 2000,
				color: 'danger'
			}).then((toastData)=>{
				console.log(toastData);
				toastData.present();
			});
			console.log(err);
		})
	}

	userLogin(login){
		this.loading = true;
		const element = document.getElementById('remember') as HTMLInputElement;
		if(element.checked){
			localStorage.setItem("remembered", JSON.stringify(login));			
		}else{
			localStorage.removeItem('remembered');
		}
		console.log(login);
		this._userService.customLogin(login).subscribe((res: any) => {
			this.loading = false;
			this.toast = this.toastController.create({
				message: res.message,
				duration: 2000,
				color: 'success'
			}).then((toastData)=>{
				console.log(toastData);
				toastData.present();
			});
			this.router.navigate(['allcategory']);
		}, err => {
			this.loading = false;
			console.log('err===========>', err.error.message);
			this.toast = this.toastController.create({
				message: err.error.message,
				duration: 2000,
				color: 'danger'
			}).then((toastData)=>{
				console.log(toastData);
				toastData.present();
			});
		})
	}

	resetPassword(user){
		this.loading = true;
		this._userService.passwordReset(user).subscribe((res: any) => {
			this.loading = false;
			this.toast = this.toastController.create({
				message: res.message,
				duration: 2000,
				color: 'success'
			}).then((toastData)=>{
				console.log(toastData);
				toastData.present();
			});
			this.router.navigate(['settings']);
		}, err => {
			this.loading = false;
			console.log('err===========>', err.error.message);
			this.toast = this.toastController.create({
				message: err.error.message,
				duration: 2000,
				color: 'danger'
			}).then((toastData)=>{
				console.log(toastData);
				toastData.present();
			});
		})	
	}

	signUpClose(){
		this.signupForm.reset();
	}
}