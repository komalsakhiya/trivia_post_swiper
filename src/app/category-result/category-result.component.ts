import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {NewsService} from '../services/news.service';
import {News} from '../home/news';
import {config} from '../config';
import { ToastController, Platform } from '@ionic/angular';
import * as _ from 'lodash';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
@Component({
	selector: 'app-category-result',
	templateUrl: './category-result.component.html',
	styleUrls: ['./category-result.component.scss'],
})
export class CategoryResultComponent implements OnInit {
	catId: any;
	newsArray: News[];
	toast:any;	
	error = '';
	mediaPath = config.mediaApiUrl;
	tokenLocalStorage: string;
	loggedInUser: string;
	language:string;
	loading:any;
	constructor(public toastController: ToastController,private socialSharing: SocialSharing,public _newsService: NewsService,private route: ActivatedRoute, private router: Router,) { 
		this.route.queryParams.subscribe(params => {
			if (this.router.getCurrentNavigation().extras.state) {
				this.catId = this.router.getCurrentNavigation().extras.state.catId;
				console.log('data in edit profile=====>', this.catId);
				this.catNews(this.catId);
			}
		});
	}

	ngOnInit() {}

	catNews(id): void{
		this.loading = true;
		this.language = localStorage.getItem('language');
		this.tokenLocalStorage = localStorage.getItem('accessToken');
		console.log("line 66",this.tokenLocalStorage);
		if(this.tokenLocalStorage){
			var base64Url = this.tokenLocalStorage.split('.')[1];
			var base64 = base64Url.replace('-', '+').replace('_', '/');
			var decodedToken = JSON.parse(window.atob(base64));
			this.loggedInUser = decodedToken.user._id;
			console.log("Decoded",this.loggedInUser);
		}
		var userId =  this.loggedInUser;
		this._newsService.allCatNews(id).subscribe(
			(res: News[]) => {
				this.loading = false;
				this.newsArray = res;
				console.log(this.newsArray);
				if(this.tokenLocalStorage){
					_.forEach(this.newsArray,(save)=>{
						_.forEach(save.bookMark,(Id)=>{
							if(Id == userId){
								console.log(Id);
								save['bookmarkKey'] = true
							}
						})
					})
				}
				console.log(this.newsArray);
			},
			(err) => {
				this.loading = false;
				this.error = err;
			});
	}

	sharePost(id, newsTitle){
		var message = "Check out this amazing news -->  " + newsTitle;
		var subject = "Trivia Post";
		var str = newsTitle;
		var url = 'https://triviapost.com/post/' + id; 
		this.socialSharing.share(message,subject, null , url)
		.then((entries) => {
			console.log('success ' + JSON.stringify(entries));
		})
		.catch((error) => {
			alert('error ' + JSON.stringify(error));
		});	
	}

	bookmark(id){
		this._newsService.bookmarkPost(id).subscribe((res: any) => {
			this.catNews(id);
			this.toast = this.toastController.create({
				message: res.message,
				duration: 2000,
				color: 'success'
			}).then((toastData)=>{
				this.route.queryParams.subscribe(params => {
					if (this.router.getCurrentNavigation().extras.state){
						this.catId = this.router.getCurrentNavigation().extras.state.catId;
						console.log('data in edit profile=====>', this.catId);
						this.catNews(this.catId);
					}
				});
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
}