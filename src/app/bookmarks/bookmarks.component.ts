import { Component, OnInit } from '@angular/core';
import {CategoryService} from '../services/category.service';
import {Category} from '../home/category';
import {config} from '../config';
import {Router} from '@angular/router';
import {NewsService} from '../services/news.service';
import {News} from '../home/news';
import { ActionSheetController,Platform } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
@Component({
	selector: 'app-bookmarks',
	templateUrl: './bookmarks.component.html',
	styleUrls: ['./bookmarks.component.scss'],
})
export class BookmarksComponent implements OnInit {
	newsArray: any;
	newsObj: any;
	category_array: Category[];
	error = '';
	language: string;
	mediaPath = config.mediaApiUrl;
	toast:any;
	bookmarkLength: any;
	loading:any;
	constructor(private platform: Platform, private socialSharing: SocialSharing,public toastController: ToastController,public actionSheetController: ActionSheetController,public _newsService: NewsService,public _categoryService: CategoryService, private router:Router) { }

	ngOnInit() {
		this.platform.backButton.subscribe(async () => {
            if(this.router.url.includes('bookmarks')){
                this.router.navigate(['settings']);
            }
        });
		this.bookmarkedNews();
		this.language = localStorage.getItem('language');
	}

	bookmarkedNews(): void{
		this.loading = true;
		this._newsService.getAllBookmarks().subscribe(
			(res) => {
				this.loading = false;
				this.newsObj = res;
				this.newsArray = this.newsObj.post;
				this.bookmarkLength = this.newsArray.length;
			},
			(err) => {
				this.loading = false;
				this.error = err;
			});
	}

	async bookmarkAction(id, title){
		console.log(id);
		const actionSheet = await this.actionSheetController.create({
			buttons: [{
				text: 'Remove',
				role: 'destructive',
				handler: () => {
					this._newsService.bookmarkPost(id).subscribe((res: any) => {
						console.log("res",res);
						this.toast = this.toastController.create({
							message: res.message,
							duration: 2000,
							color: 'success'
						}).then((toastData)=>{
							this.bookmarkedNews();
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
			}, {
				text: 'Share',
				handler: () => {
					var message = "Check out this amazing news " + '" ' + title + ' "';
					var subject = "Trivia Post";
					var url = 'https://triviapost.com/post/' + id; 
					this.socialSharing.share(message,subject, null , url)
					.then((entries) => {
						console.log('success ' + JSON.stringify(entries));
					})
					.catch((error) => {
					});	
				}
			}]
		});
		await actionSheet.present();
	}

	getSingleBookmark(id){
		this.router.navigate(['post/'+ id]);
	}
}

