import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../services/category.service';
import { Category } from './category';
import { config } from '../config';
import { Router, ActivatedRoute } from '@angular/router';
import { NewsService } from '../services/news.service';
import { News } from './news';
import { FCM } from '@ionic-native/fcm/ngx';
declare var jquery: any;
declare var $: any;
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import { ToastController, Platform } from '@ionic/angular';
import * as _ from 'lodash';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import Swiper from 'swiper';

@Component({
	selector: 'app-home',
	templateUrl: 'home.page.html',
	styleUrls: ['home.page.scss'],
})
export class HomePage {
	toast: any;
	newsArray: any;
	bookmarks: any;
	tokenLocalStorage: any;
	category_array: Category[];
	error = '';
	language: string;
	loggedInUser: any;
	height;
	width;
	isVisible = false;
	mediaPath = config.mediaApiUrl;
	notifyflag: any;
	loading: any;
	currentPostId;
	data;
	mainSwiper;
	horizontalSwipers = [];
	
	isCalled = false;
	constructor(private route: ActivatedRoute, private screenOrientation: ScreenOrientation, private platform: Platform, private socialSharing: SocialSharing, public toastController: ToastController, private deeplinks: Deeplinks, private fcm: FCM, public _newsService: NewsService, public _categoryService: CategoryService, private router: Router) {

	}

	ionViewWillEnter() {
		this.notifyflag = localStorage.getItem('notification');
		this.language = localStorage.language;
		this.fcmToken();
		this.startCurrentPolling();
		console.log("this.language---------->", this.language);
		if (!this.notifyflag) {
			localStorage.setItem('notification', 'true');
		}
		this.fcm.onNotification().subscribe(data => {
			this.router.navigate(['post/' + data.newsId]);
			if (data.wasTapped) {
				console.log(data);
			} else {
			}
		});
		// this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);

		this.deeplinks.route({
			'/': {},
			'/post/:id': { "post:": true }
		}).subscribe((match) => {
			this.router.navigate(['post/' + match.$args.id]);
		},
			(nomatch) => {
				alert("UnMatched" + nomatch);
			});

		this.tokenLocalStorage = localStorage.getItem('accessToken');
		console.log("line 66", this.tokenLocalStorage);
		if (this.tokenLocalStorage) {
			var base64Url = this.tokenLocalStorage.split('.')[1];
			var base64 = base64Url.replace('-', '+').replace('_', '/');
			var decodedToken = JSON.parse(window.atob(base64));
			this.loggedInUser = decodedToken.user._id;
			console.log("Decoded", this.loggedInUser);
		}

		this.reInitializeSwiper();
	}



	ngOnInit() {
		console.log("in ngonoinit=============")
		this.startCurrentPolling();
		this.language = localStorage.language;
		this.height = this.platform.height();
		this.width = this.platform.width();
		this.route.params.subscribe(param => {
			if (this.router.url.includes('bookmark')) {
				this.bookmarkedNews();
			} else if (this.router.url.includes('category')) {
				this.catNews(param.id);
			} else {
				this.getNews();
			}
		});
		console.log("Language = " + this.language);
		console.log("plateform======>", this.platform.platforms());
		console.log('Width=========: ' + this.platform.width());
		console.log('Height==: ' + this.platform.height(), this.language);
		console.log("newsArray==>", this.newsArray);
	}

	bookmarkedNews(): void {
		this.loading = true;
		this._newsService.getAllBookmarks().subscribe(
			(res) => {
				this.loading = false;
				this.newsArray = res.post;
			},
			(err) => {
				this.loading = false;
				this.error = err;
			});
	}

	catNews(id): void {
		this.loading = true;
		this.language = localStorage.getItem('language');
		this.tokenLocalStorage = localStorage.getItem('accessToken');
		console.log("line 66", this.tokenLocalStorage);
		if (this.tokenLocalStorage) {
			var base64Url = this.tokenLocalStorage.split('.')[1];
			var base64 = base64Url.replace('-', '+').replace('_', '/');
			var decodedToken = JSON.parse(window.atob(base64));
			this.loggedInUser = decodedToken.user._id;
			console.log("Decoded", this.loggedInUser);
		}
		var userId = this.loggedInUser;
		this._newsService.allCatNews(id).subscribe(
			(res: News[]) => {
				this.loading = false;
				this.newsArray = res;
				console.log(this.newsArray);
				if (this.tokenLocalStorage) {
					_.forEach(this.newsArray, (save) => {
						_.forEach(save.bookMark, (Id) => {
							if (Id == userId) {
								console.log(Id);
								save['bookmarkKey'] = true
							}
						})
					})
				}
				console.log(this.newsArray);
				this.reInitializeSwiper()
			},
			(err) => {
				this.loading = false;
				this.error = err;
			});
	}

	startCurrentPolling() {
		var that = this;
		setInterval(function () {
			if (that.currentPostId != localStorage.currentPostId) {
				that.currentPostId = localStorage.currentPostId;
				that.newPostView(that.currentPostId);
			}
		}, 500);
	}

	newPostView(postId) {
		console.log("Post Change Detected in home.page.ts", this.currentPostId);
		postId = this.currentPostId.split("-")[1];
		console.log("postId======>", postId)
		this.data = {
			postId: postId,
			postType: localStorage.language
		}
		console.log("data======>", this.data);
		this.newsCount(this.data);

	}
	newsCount(detail) {
		this._newsService.newsCount(detail).subscribe((res: any) => {
			console.log("res of viewcount", res)
		}, err => {
			console.log(err);
		})
	}

	fcmToken() {
		this.fcm.getToken().then(token => {
			console.log("Device", token);
			localStorage.setItem('deviceToken', token);
		});

		this.fcm.onTokenRefresh().subscribe(token => {
			console.log("Device", token);
			localStorage.setItem('deviceToken', token);
		});

		this.fcm.onNotification().subscribe(data => {
			this.router.navigate(['settings']);
			alert(JSON.stringify(data));
			if (data.wasTapped) {
				console.log('Received in background');
			} else {
				console.log('Received in foreground');
			}
		});
	}

	//get all news
	getNews(): void {
		this.language = localStorage.language;
		console.log("in getnews====================", this.language);
		console.log("newsArray = ",this.newsArray);
		if(this.isCalled == true)
		return;
		
		console.log("this.isCalled========>",this.isCalled)
		this.isCalled = true;
		this.loading = true;
		this.tokenLocalStorage = localStorage.getItem('accessToken');
		console.log("line 66", this.tokenLocalStorage);
		if (this.tokenLocalStorage) {
			var base64Url = this.tokenLocalStorage.split('.')[1];
			var base64 = base64Url.replace('-', '+').replace('_', '/');
			var decodedToken = JSON.parse(window.atob(base64));
			this.loggedInUser = decodedToken.user._id;
			console.log("Decoded", this.loggedInUser);
		}
		var userId = this.loggedInUser;
		this._newsService.getAllNews().subscribe(
			(res: any) => {
				this.newsArray = [];
				this.loading = false;
				this.newsArray = res;
				if (this.tokenLocalStorage) {
					console.log("in if====================")
					_.forEach(this.newsArray, (save) => {
						_.forEach(save.bookMark, (Id) => {
							if (Id == userId) {
								save['bookmarkKey'] = true
							}
						})
					})
				}
				for (let i = 0; i < this.newsArray.length; i++) {
					// console.log("Slider", "New news for building news letter ", i);
					$(function () {
						console.log("in function of slider========")
						var window_height = $(document).height() * 0.70;
						var content_height = window_height;
						function buildNewsletter() {
							console.log("in newsletter function");
							if ($('#sliderContent' + i).contents().length > 0) {
								console.log("Slider", "ENTERED INTO IF STATEMENT")
								let page = $("#page_slider" + i).clone().addClass("swiper-slide").css("display", "block");
								console.log("Slider", "Page=", page);
								$(".swiper-container-h > #swiper-wrapper" + i).append(page);
								$(".swiper-container-h > #swiper-wrapper" + i + "> .page_slider:first-child").css("display", "none");
								$('#sliderContent' + i).columnize({
									columns: 1,
									target: "#swiper-wrapper" + i + " .swiper-slide:last .content",
									overflow: {
										height: content_height,
										id: "#sliderContent" + i,
										doneFunc: function () {
											console.log("Slider", "Done!", "Requesting for recurring calling as overflow.");
											buildNewsletter();
										}
									},
								});
							}
						}
						setTimeout(buildNewsletter, 1000);
					})
				}
				this.reInitializeSwiper();

			},
			(err) => {
				this.loading = false;
				this.error = err;
			});
	}


	reInitializeSwiper(){
		console.log("ReInitializing Swiper after 2 seconds");
		setTimeout(function(){
			console.log("ReInitializing swiper")
			console.log("Initializing Main Swiper")
			this.mainSwiper = new Swiper('.swiper-container-v', {
				speed: 400,
				spaceBetween: 0,
				direction: "vertical"
			});
			console.log("Initializing Sub Swiper")
			new Swiper('.swiper-container-h',{
				direction: "horizontal"
			});
		},2000);

	}


	bookmark(index) {
		console.log("in book mark=========>", index, this.newsArray[index])
		this._newsService.bookmarkPost(this.newsArray[index].newsId).subscribe((res: any) => {
			// this.getNews();
			this.newsArray[index].bookmarkKey = !this.newsArray[index].bookmarkKey;
			console.log("bookmarkkey value", index, this.newsArray[index].bookmarkKey)
			this.toast = this.toastController.create({
				message: res.message,
				duration: 2000,
				color: 'success'
			}).then((toastData) => {
				toastData.present();
			});
			// this.router.navigate(['home']);
		}, err => {
			console.log('err===========>', err.error.message);
			this.toast = this.toastController.create({
				message: err.error.message,
				duration: 2000,
				color: 'danger'
			}).then((toastData) => {
				toastData.present();
			});
		})
	}

	sharePost(id, newsTitle) {
		console.log("in sharepost=========>", id, newsTitle)
		var message = "Check out this amazing news -->  " + newsTitle;
		var subject = "Trivia Post";
		var str = newsTitle;
		var url = 'https://triviapost.com/post/' + id;
		this.socialSharing.share(message, subject, null, url)
			.then((entries) => {
				console.log('success ' + JSON.stringify(entries));
			})
			.catch((error) => {
				alert('error ' + JSON.stringify(error));
			});
	}

	// displayFooter(){
	// 	console.log("===========================",this.isVisible);
	// 	if(this.isVisible == false){
	// 		document.getElementById("content").style.marginTop = "76px";
	// 	} else{
	// 		document.getElementById("content").style.marginTop = "0px";
	// 	}
	// 	this.isVisible = !this.isVisible;
	// }
}