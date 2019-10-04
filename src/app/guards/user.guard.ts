import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, public _userService: UserService) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    // throw new Error("Method not implemented.");
    const currentUser = this._userService.currentUserValue;
    console.log("curruntUser in auth guard===========>", currentUser)
    if (currentUser) {
      // authorised so return true
      return true;
    } else {
      // not logged in so redirect to login page with the return url
      this.router.navigate(['login']);
      return false;
      // throw new Error("Method not implemented.");
    }

  }

}

export class LoginGuard implements CanActivate {
  constructor(private router: Router, public _userService: UserService) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    // throw new Error("Method not implemented.");
    const currentUser = this._userService.currentUserValue;
    console.log("curruntUser in auth guard===========>", currentUser)
    if (currentUser) {
      // authorised so return true
      return false;
    } else {
      // not logged in so redirect to login page with the return url
      // this.router.navigate(['login']);
      return true;
      // throw new Error("Method not implemented.");
    }

  }

}