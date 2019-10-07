import { Injectable } from '@angular/core';
import {Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { from as observableFrom } from 'rxjs';
import {config} from '../config';
import {News} from '../home/news';
@Injectable({
	providedIn: 'root'
})
export class NewsService {
	authorization = localStorage.getItem('accessToken');
	newsArray: any;
	singleNews: any;


	private handleError(error: HttpErrorResponse) {
		return throwError('Error! something went wrong.');
	}

	constructor(private http: HttpClient) { }

	//fetch all news
	getAllNews(){
		return this.http.get(config.baseApiUrl + 'news?isApproved=APPROVED').pipe(
			map((res) => {
				this.newsArray = res['data'];
				return this.newsArray;
			}),
			catchError(this.handleError));
	}

	allCatNews(id){
		return this.http.get(config.baseApiUrl + 'news?isApproved=APPROVED&categoryId='+id).pipe(
			map((res) => {
				this.newsArray = res['data'];
				return this.newsArray;
			}),
			catchError(this.handleError));
	}

	searchedNews(searchKey){
		return this.http.get(config.baseApiUrl + 'news?isApproved=APPROVED&keyword='+ searchKey).pipe(
			map((res) => {
				this.newsArray = res['data'];
				return this.newsArray;
			}),
			catchError(this.handleError));
	}

	getAllBookmarks(){
		console.log("Hello");
		return this.http.get(config.baseApiUrl + 'bookmark').pipe(
			map((res) => {
				this.newsArray = res['data'];
				return this.newsArray;
			}),
			catchError(this.handleError));
	}

	bookmarkPost(id){
		return this.http.post(config.baseApiUrl + "bookmark", {postId:id});
	}

	//get single news
	getSingleNews(id): Observable<News[]> {
		console.log('service',id);
		http://192.168.1.83:5000/api/single-news?postId=5d92fae2ec36d35216e159a6
		return this.http.get(config.baseApiUrl + 'single-news?postId=' + id).pipe(
			map((res) => {
				this.singleNews = res['data'];
				console.log("ser",this.singleNews);
				return this.singleNews;
			}),
			catchError(this.handleError));
	}

	newsCount(data) {
		console.log(data);
		return this.http.put(config.baseApiUrl + 'post-views',data);
	}
}