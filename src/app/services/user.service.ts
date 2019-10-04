import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { config } from '../config';
// import * as CryptoJS from 'crypto-js';
import { Storage } from '@ionic/storage';
import { map, catchError } from 'rxjs/operators';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { Platform } from '@ionic/angular';
import {Category} from '../home/category';
@Injectable({
	providedIn: 'root'
})
export class UserService {
	private currentUserSubject: BehaviorSubject<any>;
	public currentUser: Observable<any>;
	categories: Category[];
	singleUser: any;
	constructor(private http: HttpClient, private storage: Storage, private plt: Platform) { 
		this.currentUserSubject = new BehaviorSubject<any>(localStorage.getItem('accessToken'));
		this.currentUser = this.currentUserSubject.asObservable();
	}

	private handleError(error: HttpErrorResponse) {
		return throwError('Error! something went wrong.');
	}

	public get currentUserValue(): any {
		return this.currentUserSubject.value;
	}

	googleLogin(token){
		var deviceToken = localStorage.getItem('deviceToken');
		const accessToken = {
			accessToken: token,
			deviceToken: deviceToken
		} 
		console.log('service google', accessToken);
		return this.http.post(config.baseApiUrl + "googleLogin", accessToken).
		pipe(map((user: any) => {
			console.log("login user with google=========>", user);
			// login successful if there's a jwt token in the response
			if (user && user.data.accessToken) {
				// store user details and jwt token in local storage to keep user logged in between page refreshes
				this.storage.set('accessToken', user.data.accessToken);
				localStorage.setItem('accessToken', user.data.accessToken);
				console.log("token in service", localStorage.getItem('accessToken'));
				this.storage.get('accessToken').then((val) => {
					console.log('accessToken', val);
				});
				this.currentUserSubject.next(user);
			}
			return user;
		}));
	}

	fbLogin(token){
		var deviceToken = localStorage.getItem('deviceToken');
		const accessToken = {
			accessToken: token,
			deviceToken: deviceToken
		}
		console.log('service facebook', accessToken);
		return this.http.post(config.baseApiUrl + "facebookLogin", accessToken).pipe(map((user: any) => {
			console.log("login user with fb=========>", user);
			if (user && user.data.accessToken) {
				// store user details and jwt token in local storage to keep user logged in between page refreshes
				localStorage.setItem('accessToken', user.data.accessToken);
				localStorage.getItem('accessToken');
				this.currentUserSubject.next(user);
			}
			return user;
		}));
	}

	logOut(){
		localStorage.setItem('notification','false');
		this.currentUserSubject.next(null);
		return this.http.put(config.baseApiUrl + 'user-logout',{});
	}

	signup(user){
		return this.http.post(config.baseApiUrl + "user", user);
	}

	customLogin(login){
		login.deviceToken = localStorage.getItem('deviceToken');
		console.log(login);
		return this.http.put(config.baseApiUrl + "user-login", login).pipe(map((user:any) => {
			if (user && user.data.accessToken) {
				// store user details and jwt token in local storage to keep user logged in between page refreshes
				localStorage.setItem('accessToken', JSON.stringify(user.data.accessToken));
				localStorage.getItem('accessToken');
				this.currentUserSubject.next(user);
			}
			return user;
		}));
	}

	userFeedbackFrom(feedback){
		return this.http.post(config.baseApiUrl + "feedback", feedback);	
	}

	notifyToggle(notify){
		return this.http.put(config.baseApiUrl + "allow-notify", {notification:notify});
	}

	getUserDetail(){
		return this.http.get(config.baseApiUrl + 'single-user').pipe(
			map((res) => {
				this.singleUser = res['data'];
				return this.singleUser;
			}),
			catchError(this.handleError));
	}

	passwordReset(email){
		return this.http.post(config.baseApiUrl + "forgotpassword", email);
	}
}