import { Component, OnInit } from '@angular/core';
import { GeneralService} from '../services/general.service';
import {config} from '../config';
import {Router} from '@angular/router';
import {privacyPolicy} from '../privacy/privacyPolicy';
import {Platform } from '@ionic/angular';

@Component({
	selector: 'app-terms-and-cond',
	templateUrl: './terms-and-cond.component.html',
	styleUrls: ['./terms-and-cond.component.scss'],
})
export class TermsAndCondComponent implements OnInit {
	privacyPolicy: any;
	error: any;
	loading: any;
	constructor(private platform: Platform, public _generalService: GeneralService, private router:Router) {
	}

	ngOnInit() {
		this.platform.backButton.subscribe(async () => {
            if(this.router.url.includes('terms')){
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
