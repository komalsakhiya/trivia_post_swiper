import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { ToastController, Platform } from '@ionic/angular';
import {config} from '../config';
import {NewsService} from '../services/news.service';
import * as _ from 'lodash';
import {News} from '../home/news';
import {Router} from '@angular/router';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
@Component({
	selector: 'app-single-news',
	templateUrl: './single-news.component.html',
	styleUrls: ['./single-news.component.scss'],
})
export class SingleNewsComponent implements OnInit {
	newsArray: any;
	mediaPath = config.mediaApiUrl;
	postId: any;
	tokenLocalStorage:any;
	loggedInUser:any;
	error:any;
	toast:any
	language:any;
	loading: any;
	constructor(private socialSharing: SocialSharing,private router: Router, private toastController:ToastController, private route: ActivatedRoute,private platform:Platform,public _newsService: NewsService) {
	}

	ngOnInit() {
		this.language = localStorage.getItem('language');
		this.tokenLocalStorage = localStorage.getItem('accessToken');
		if(this.tokenLocalStorage){
			var base64Url = this.tokenLocalStorage.split('.')[1];
			var base64 = base64Url.replace('-', '+').replace('_', '/');
			var decodedToken = JSON.parse(window.atob(base64));
			this.loggedInUser = decodedToken.user._id;
			console.log("Decoded",this.loggedInUser);
		}
		this.postId = this.route.snapshot.paramMap.get("id");
		this.getNews(this.postId);
	}

	getNews(id): void{
		this.loading = true;
		this.tokenLocalStorage = localStorage.getItem('accessToken');
		console.log("token------------",this.tokenLocalStorage);
		var userId =  this.loggedInUser;
		console.log(userId);
		this._newsService.getSingleNews(id).subscribe((res: any) => {
			this.loading = false;
			this.newsArray = res;
			if(this.tokenLocalStorage){
				console.log("Inside 1");
				_.forEach(this.newsArray,(save)=>{
					_.forEach(save.bookMark,(Id)=>{
						if(Id == userId){
							console.log(Id);
							save['bookmarkKey'] = true;
						}
					})
				})
			}
			console.log("for-----------------",this.newsArray);
			console.log(this.newsArray);
		},
		(err) => {
			this.loading = false;
			this.error = err;
		});
	}

	bookmark(id){
		this._newsService.bookmarkPost(id).subscribe((res: any) => {
			this.getNews(id);
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
}