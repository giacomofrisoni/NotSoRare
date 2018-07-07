import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';



//import { HeroesComponent } from './components/heroes.component';
//import { HeroService } from './services/hero.service';
import { HomeComponent } from './pages/home.component';
import { TopBarComponent } from './components/top-bar.component';
import { DivbuttonComponent } from './components/divbutton.component';
import { RootComponent } from './pages/root.component';
import { MenubuttonComponent } from './components/menubutton.component';
import { RegisterComponent } from './pages/register.component';
import { RadiogroupComponent } from './components/radiogroup.component';
import { CountriesSelectorComponent } from './components/countries-selector.component';
import { UserService } from './services/user.service';
import { LoginComponent } from './pages/login.component';
import { ProfileComponent } from './pages/profile.component';
import { LanguageService } from './services/language.service';
import { CookiesUtilsService } from './services/cookies-utils.service';
import { DiseaseService } from './services/disease.service';

const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: ProfileComponent }
];

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    HomeComponent,
    TopBarComponent,
    DivbuttonComponent,
    RootComponent,
    MenubuttonComponent,
    RegisterComponent,
    RadiogroupComponent,
    CountriesSelectorComponent,
    LoginComponent,
    ProfileComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    HttpClientModule,
    NgSelectModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false }    //TRUE to debug routes
    )
  ],
  providers: [
    UserService, 
    LanguageService,
    CookiesUtilsService,
    DiseaseService
  ],
  bootstrap: [RootComponent]
})
export class AppModule { }
