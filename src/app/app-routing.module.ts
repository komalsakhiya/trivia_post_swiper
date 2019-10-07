import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import {SettingsComponent} from './settings/settings.component';
import {LoginComponent} from './login/login.component';
import {AllCategoryComponent} from './all-category/all-category.component';

import {CategoryResultComponent} from './category-result/category-result.component';
import {FeedbackComponent} from './feedback/feedback.component'; 
import {PrivacyComponent} from './privacy/privacy.component';
import {SearchbarComponent} from './searchbar/searchbar.component';
import {TermsAndCondComponent} from './terms-and-cond/terms-and-cond.component'; 
import {BookmarksComponent} from './bookmarks/bookmarks.component'; 
import { AuthGuard, LoginGuard } from './guards/user.guard';
const routes: Routes = [
{ 
	path: '', 
	redirectTo: 'home',
	pathMatch: 'full' 
},
{
    path: 'home/bookmark',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
},
{
    path: 'home/category/:id/:catTitle',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
},
{ 
	path: 'home', 
	loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
},
{ 
	path: 'home/single-news/:id', 
	loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
},

{ 
	path: 'home/search-news/:key', 
	loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
},
{ 
	path: 'settings',
	component: SettingsComponent
},
{ 
	path: 'login',
	component: LoginComponent,
	canActivate: [LoginGuard]
},
{ 
	path: 'allcategory',
	component: AllCategoryComponent
},
{ 
	path: 'catResult',
	component: CategoryResultComponent
},
{ 
	path: 'feedback',
	component: FeedbackComponent
},
{ 
	path: 'privacy',
	component: PrivacyComponent
},
{ 
	path: 'searchBar',
	component: SearchbarComponent
},
{ 
	path: 'terms',
	component: TermsAndCondComponent
},
{ 
	path: 'bookmarks',
	component: BookmarksComponent
}

];

@NgModule({
	imports: [
	RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
	],
	exports: [RouterModule]
})
export class AppRoutingModule { }
