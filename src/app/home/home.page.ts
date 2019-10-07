import { Component, AfterViewInit } from '@angular/core';
import { CategoryService } from '../services/category.service';
import { Category } from './category';
import { config } from '../config';
import { Router, ActivatedRoute } from '@angular/router';
import { NewsService } from '../services/news.service';
import { News } from './news';
import { FCM } from '@ionic-native/fcm/ngx';
declare var $: any;
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import { ToastController, Platform } from '@ionic/angular';
import * as _ from 'lodash';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';

@Component({
	selector: 'app-home',
	templateUrl: 'home.page.html',
	styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit {
	toast: any;
	newsArray: any = [];
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
	loading: boolean = false;
	currentPostId;
	data;
	mainSwiper;
	horizontalSwipers = [];
	isTextVisible = false;
	text;
	searchLength: any;
	isCalled = false;
	catTitle;
	bookMark: boolean = false;
	searchKey;
	appendedNews;
	constructor(private route: ActivatedRoute, private screenOrientation: ScreenOrientation, private platform: Platform, private socialSharing: SocialSharing, public toastController: ToastController, private deeplinks: Deeplinks, private fcm: FCM, public _newsService: NewsService, public _categoryService: CategoryService, private router: Router, public keyboard: Keyboard) {

	}

	ngAfterViewInit() {

	}

	ionViewWillEnter() {
		setTimeout(function () {
			console.log("ReInitializing swiper");
			$('#scriptid').remove();
			var script = document.createElement('script');
			script.setAttribute('id', 'scriptid');
			script.src = "assets/js/swiper.js";
			document.body.appendChild(script);
		}, 2000);
		this.notifyflag = localStorage.getItem('notification');
		this.language = localStorage.language;
		this.fcmToken();
		this.startCurrentPolling();
		console.log("this.language---------->", this.language);
		if (!this.notifyflag) {
			localStorage.setItem('notification', 'true');
		}
		this.fcm.onNotification().subscribe(data => {
			this.router.navigate(['home/single-news/' + data.newsId]);
			if (data.wasTapped) {
				console.log(data);
			} else {
			}
		});
		this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);

		//  Deeplinks
		this.deeplinks.route({
			'/': {},
			'/post/:id': { "post:": true }
		}).subscribe((match) => {
			this.router.navigate(['home/single-news/' + match.$args.id]);
		},
			(nomatch) => {
				alert("UnMatched" + nomatch);
			});

		this.tokenLocalStorage = localStorage.getItem('accessToken');
		// console.log("line 66", this.tokenLocalStorage);
		if (this.tokenLocalStorage) {
			var base64Url = this.tokenLocalStorage.split('.')[1];
			var base64 = base64Url.replace('-', '+').replace('_', '/');
			var decodedToken = JSON.parse(window.atob(base64));
			this.loggedInUser = decodedToken.user._id;
			// console.log("Decoded", this.loggedInUser);
		}

		// this.reInitializeSwiper();
	}



	ngOnInit() {

		this.loading = true;
		this.platform.backButton.subscribe(async () => {
			if (this.router.url.includes('home')) {
				navigator['app'].exitApp();
			}
		});
		console.log("in ngonoinit=============")
		this.startCurrentPolling();
		this.language = localStorage.language;
		this.height = this.platform.height();
		this.width = this.platform.width();
		this.route.params.subscribe(param => {
			if (this.router.url.includes('bookmark')) {
				this.bookMark = true
				this.bookmarkedNews();
			} else if (this.router.url.includes('category')) {
				this.catTitle = param.catTitle;
				this.catNews(param.id);
			} else if (this.router.url.includes('single-news')) {
				this.getSingleNews(param.id);
			} else if (this.router.url.includes('search-news')) {
				this.searchKey = param.key;
				this.searchNews(param.key);
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

	removeJs() {
		console.log("remove js calll============>");
		$('#scriptid').remove();
	}


	/**
	 * get Single news
	 */
	getSingleNews(id): void {
		console.log("this.id", id)
		this.loading = true;
		this.language = localStorage.language;
		this.checkForToken();
		var userId = this.loggedInUser;
		console.log(userId);
		this._newsService.getSingleNews(id).subscribe((res: any) => {
			console.log("this.single", res);
			this.newsArray = res;
			// this.loadNewsToPage(res, userId);
			this.getNews()
			// this.buildForSwiper();
			console.log("for-----------------", this.newsArray);
			console.log(this.newsArray);
		},
			(err) => {
				this.loading = false;
				this.error = err;
			});
	}

	/**
	 * Searched result
	 */

	searchNews(key) {
		this.loading = true;
		this.language = localStorage.getItem('language');
		this.checkForToken();
		var userId = this.loggedInUser;
		this._newsService.searchedNews(key).subscribe(
			(res: News[]) => {
				this.keyboard.hide();
				this.loadNewsToPage(res, userId);
			},
			(err) => {
				this.loading = false;
				this.error = err;
			});
	}



	bookmarkedNews(): void {
		this.loading = true;
		this.language = localStorage.getItem('language');
		this.checkForToken();
		this._newsService.getAllBookmarks().subscribe(
			(res) => {
				this.newsArray = [];
				this.loading = false;
				if (!res.post.length) {
					console.log("res in if=======>", res);
					this.isTextVisible = true
					this.text = "There are no news yet..."
				}
				this.newsArray = res.post;
				if (this.tokenLocalStorage) {
					_.forEach(this.newsArray, (save) => {
						save['bookmarkKey'] = true
						// console.log(save)
					})
				}
				console.log(this.newsArray);
				this.buildForSwiper();
			},
			(err) => {
				this.loading = false;
				this.error = err;
			});
	}

	catNews(id): void {
		this.loading = true;
		this.language = localStorage.getItem('language');
		this.checkForToken();
		var userId = this.loggedInUser;
		this._newsService.allCatNews(id).subscribe(
			(res: any) => {
				console.log("res of cat news", res)
				this.loadNewsToPage(res, userId);
			},
			(err) => {
				this.loading = false;
				this.error = err;
			});
	}

	//get all news
	getNews(): void {
		this.loading = true;
		this.language = localStorage.language;
		this.checkForToken();
		var userId = this.loggedInUser;
		this._newsService.getAllNews().subscribe(
			(res: any) => {
				this.route.params.subscribe(param => {
					if (!this.router.url.includes('single-news')) {
						console.log("in if condttion============>")
						this.loadNewsToPage(res, userId);
					} else {
						console.log("in else conditio")
						this.appendSinleNews(res, userId)
					}
				})
			},
			(err) => {
				this.loading = false;
				this.error = err;
			});
	}

	appendSinleNews(res, userId) {
		this.loading = false;
		if (!res.length) {
			console.log("res in if=======>", res);
			this.isTextVisible = true
			this.text = "There are no news yet..."
		}
		this.appendedNews = res;
		console.log("this.app", this.appendedNews, this.newsArray);
		// this.newsArray.push(...this.appendedNews);
		_.forEach(this.appendedNews, (news, index) => {
			console.log("id in foreach=========>", news.newsId);
			if (news.newsId == this.appendedNews.newsId) {
				this.appendedNews.splice(index, 1)
			}
		})
		this.newsArray = this.appendedNews;
		if (this.tokenLocalStorage) {
			_.forEach(this.newsArray, (save) => {
				console.log("in foreach======>", save)
				_.forEach(save.bookMark, (Id) => {
					if (Id == userId) {
						console.log("in loadNewsArray bookmark===========>", this.newsArray)
						save['bookmarkKey'] = true
					}
				})
			})

		}

		this.buildForSwiper();
	}
	checkForToken() {
		this.tokenLocalStorage = localStorage.getItem('accessToken');
		if (this.tokenLocalStorage) {
			var base64Url = this.tokenLocalStorage.split('.')[1];
			var base64 = base64Url.replace('-', '+').replace('_', '/');
			var decodedToken = JSON.parse(window.atob(base64));
			this.loggedInUser = decodedToken.user._id;
		}
	}
	loadNewsToPage(res, userId) {
		this.newsArray = [];
		this.loading = false;
		if (!res.length) {
			// console.log("res in if=======>", res);
			this.isTextVisible = true
			this.text = "There are no news yet..."
		}
		this.newsArray = res;
		if (this.tokenLocalStorage) {
			_.forEach(this.newsArray, (save) => {
				// console.log("in foreach======>", save)
				_.forEach(save.bookMark, (Id) => {
					if (Id == userId) {
						save['bookmarkKey'] = true
					}
				})
			})
		}

		this.buildForSwiper();
	}

	buildForSwiper() {
		console.log("in buildfunction========================")
		for (let i = 0; i < this.newsArray.length; i++) {
			console.log("Slider", "New news for building news letter ", i);
			$(function () {
				// console.log("in function of slider========")
				var window_height = $(document).height() * 0.66;
				//var window_height = $(document).height() - 180;
				var content_height = window_height;
				function buildNewsletter() {
					// console.log("in newsletter function");
					if ($('#sliderContent' + i).contents().length > 0) {
						console.log("Slider", "ENTERED INTO IF STATEMENT")
						let page = $("#page_slider" + i).clone().addClass("swiper-slide").css("display", "block");
						// console.log("Slider", "Page=", page);
						$(".swiper-container-h > #swiper-wrapper" + i).append(page);
						$(".swiper-container-h > #swiper-wrapper" + i + "> .page_slider:first-child").css("display", "none");
						$('#sliderContent' + i).columnize({
							columns: 1,
							target: "#swiper-wrapper" + i + " .swiper-slide:last .content",
							overflow: {
								height: content_height,
								id: "#sliderContent" + i,
								doneFunc: function () {
									buildNewsletter();
								}
							},
						});
					} else {
						console.log("in else condition================>");
						// buildNewsletter();
					}
				}
				setTimeout(buildNewsletter, 400);

			})
		}
		this.reInitializeSwiper();
	}

	reInitializeSwiper() {
		console.log("ReInitializing Swiper after 2 seconds");
		// setTimeout(function () {
		// 	console.log("ReInitializing swiper");
		// 	$('#scriptid').remove();
		// 	var script = document.createElement('script');
		// 	script.setAttribute('id', 'scriptid');
		// 	script.src = "assets/js/swiper.js";
		// 	document.body.appendChild(script);
		// }, 1800);
	}


	bookmark(index) {
		console.log("in book mark=========>", index, this.newsArray[index])
		this._newsService.bookmarkPost(this.newsArray[index].newsId).subscribe((res: any) => {
			console.log("res of bookmark================>", res)
			this.newsArray[index].bookmarkKey = !this.newsArray[index].bookmarkKey;
			console.log("bookmarkkey value", index, this.newsArray[index].bookmarkKey)
			this.toast = this.toastController.create({
				message: res.message,
				duration: 2000,
				color: 'success'
			}).then((toastData) => {
				toastData.present();
			});
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
		var message = "Check out this amazing news " + '" ' + newsTitle + ' "';
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
}










