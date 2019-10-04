import { Component, OnInit,ViewChild, Directive, Renderer, ElementRef } from '@angular/core';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { ActivatedRoute, Router } from '@angular/router';
import {NewsService} from '../services/news.service';
import {News} from '../home/news';
import {config} from '../config';
@Component({
	selector: 'app-searchbar',
	templateUrl: './searchbar.component.html',
	styleUrls: ['./searchbar.component.scss'],
})

@Directive({
	selector: '[set-focuser]' // Attribute selector
})
export class SearchbarComponent implements OnInit {
	catId: any;
	search:string;
	newsArray: News[];
	error = '';
	language: string;
	mediaPath = config.mediaApiUrl;
	searchLength: any;
	loading: any;
	constructor(private router: Router ,public _newsService: NewsService,private renderer: Renderer, private elementRef: ElementRef, public keyboard: Keyboard) { }

	ngOnInit() {
		const element = this.elementRef.nativeElement.querySelector('ion-input');
		// to delay 
		setTimeout(() => {
			this.renderer.invokeElementMethod(element, 'focus', []);
			this.keyboard.show();
		}, 500);
		this.language = localStorage.getItem('language');

	}

	searchNews(){
		this.loading = true;
		console.log(this.search);
		this._newsService.searchedNews(this.search).subscribe(
			(res: News[]) => {
				this.loading = false;
				this.newsArray = res;
				this.searchLength = this.newsArray.length;
				console.log(this.newsArray);
			},
			(err) => {
				this.loading = false;
				this.error = err;
			});
	}

	getSingleSearch(id){
		this.router.navigate(['post/'+ id]);
	}

}
