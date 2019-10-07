import { Component, OnInit } from '@angular/core';
import { GeneralService} from '../services/general.service';
import {config} from '../config';
import {Router} from '@angular/router';
import {privacyPolicy} from './privacyPolicy';
import {Platform } from '@ionic/angular';
@Component({
	selector: 'app-privacy',
	templateUrl: './privacy.component.html',
	styleUrls: ['./privacy.component.scss'],
})
export class PrivacyComponent implements OnInit {
	privacyPolicy: any;
	error: any;
	loading: any;
	constructor(private platform:Platform, public _generalService: GeneralService, private router:Router) {
	}

	ngOnInit() {
		this.platform.backButton.subscribe(async () => {
            if(this.router.url.includes('privacy')){
                this.router.navigate(['settings']);
            }
        });
		this.getPrivacyPolicy();
	}

	getPrivacyPolicy(): void{
		this.loading = true;
		this._generalService.getPolicy().subscribe(
			(res: any) => {
				this.loading = false;
				this.privacyPolicy = res;
				console.log(this.privacyPolicy);
			},
			(err) => {
				this.loading = false;
				this.error = err;
			});
	}
}
