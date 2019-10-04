import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { config } from '../config';
import { Storage } from '@ionic/storage';
import { map, catchError } from 'rxjs/operators';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { Platform } from '@ionic/angular';
import {privacyPolicy} from '../privacy/privacyPolicy';

@Injectable({
	providedIn: 'root'
})
export class GeneralService {
	privacy: privacyPolicy[];
	constructor(private http: HttpClient) { }

	private handleError(error: HttpErrorResponse) {
		return throwError('Error! something went wrong.');
	}

	//get all cateogries
	getPolicy(): Observable<privacyPolicy[]> {
		return this.http.get(config.baseApiUrl + "terms").pipe(
			map((res) => {
				this.privacy = res['data'];
				return this.privacy;
			}),
			catchError(this.handleError));
	}
}