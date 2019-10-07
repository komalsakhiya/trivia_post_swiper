import { Component, OnInit } from '@angular/core';
import {CategoryService} from '../services/category.service';
import {Category} from '../home/category';
import {config} from '../config';
import {Router, NavigationExtras} from '@angular/router';
import { ToastController } from '@ionic/angular';
import * as _ from 'lodash';
import {Platform } from '@ionic/angular';
@Component({
	selector: 'app-all-category',
	templateUrl: './all-category.component.html',
	styleUrls: ['./all-category.component.scss'],
})
export class AllCategoryComponent implements OnInit {
	category_array: any;
	toast: any;
	error = '';
	tokenLocalStorage: any;
	mediaPath = config.mediaApiUrl;
	loggedInUser: any;
	loading:any;
	language: string;
	constructor(public platform:Platform, public toastController: ToastController,public _categoryService: CategoryService, private router:Router){
		this.getCategories();
	}

	ngOnInit() {
		this.language = localStorage.getItem('language');
	}

	ionViewWillEnter(){
		this.platform.backButton.subscribe(async () => {
            if(this.router.url.includes('allcategory')){
                this.router.navigate(['home']);
            }
        });
		this.language = localStorage.getItem('language');
		console.log("language in all category",this.language)
		this.getCategories();
	}

	getCategories(){
		this.loading = true;
		this.tokenLocalStorage = localStorage.getItem('accessToken');
		if(this.tokenLocalStorage){
			var base64Url = this.tokenLocalStorage.split('.')[1];
			var base64 = base64Url.replace('-', '+').replace('_', '/');
			var decodedToken = JSON.parse(window.atob(base64));
			this.loggedInUser = decodedToken.user._id;
			console.log("Decoded",this.loggedInUser);
		}
		var userId =  this.loggedInUser;
		console.log(userId);
		this._categoryService.getAll().subscribe(
			(res: any) => {
				this.loading = false;
				this.category_array = res;
				_.forEach(res,(user)=>{
					_.forEach(user.notify,(Id)=>{
						if(Id == userId){
							user['isNotify'] = true
						}
					})
				})
			},
			(err) => {
				this.loading = false;
				this.error = err;
			});
	}

	search(){
		this.router.navigate(['searchBar']);
	}

	categoryNews(id){
		let navigationExtras: NavigationExtras = {
			state: {
				catId: id
			}
		};
		this.router.navigate(['catResult'], navigationExtras);
	}

	addNotify(catId){
		console.log("ts",catId);
		this._categoryService.notifyUser(catId).subscribe((res: any) => {
			console.log("res",res);
			this.toast = this.toastController.create({
				message: res.message,
				duration: 2000,
				color: 'success'
			}).then((toastData)=>{
				this.getCategories();
				console.log(toastData);
				toastData.present();
			});
		}, err => {
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
}