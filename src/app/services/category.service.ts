import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { config } from '../config';
import { Storage } from '@ionic/storage';
import { map, catchError } from 'rxjs/operators';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { Platform } from '@ionic/angular';
import {Category} from '../home/category';

@Injectable({
	providedIn: 'root'
})
export class CategoryService {
	categories: Category[];

	constructor(private http: HttpClient) { }

	private handleError(error: HttpErrorResponse) {
		return throwError('Error! something went wrong.');
	}

	//get all cateogries
	getAll(): Observable<Category[]> {
		return this.http.get(config.baseApiUrl + "category").pipe(
			map((res) => {
				this.categories = res['data'];
				return this.categories;
			}),
			catchError(this.handleError));
	}

	notifyUser(catId){
		console.log(catId);
		return this.http.put(config.baseApiUrl + "category-notify", {categoryId:catId});
	}
}
