// Imported and 3rd-part component
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';              // ReactiveFormsModule for Angular Material
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';                          // Select
import { TranslateModule, TranslateLoader, TranslateService} from '@ngx-translate/core';           // Translator
import { TranslateHttpLoader} from '@ngx-translate/http-loader';                 // Loader for translator
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';   // Angular Material Animations
import { MatCheckboxModule, MatAutocompleteModule, MatInputModule} from '@angular/material';           // Angular Material
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';


// Custom Components
import { HomeComponent } from './pages/home.component';
import { TopBarComponent } from './components/top-bar.component';
import { DivbuttonComponent } from './components/divbutton.component';
import { RootComponent } from './pages/root.component';
import { MenubuttonComponent } from './components/menubutton.component';
import { RegisterComponent } from './pages/register.component';
import { RadiogroupComponent } from './components/radiogroup.component';
import { CountriesSelectorComponent } from './components/countries-selector.component';
import { LoginComponent } from './pages/login.component';
import { ProfileComponent } from './pages/profile.component';
import { SimpleDialogComponent } from './dialogs/simple-dialog.component';

import { UserService } from './services/user.service';
import { DiseaseService } from './services/disease.service';
import { CookiesUtilsService } from './services/cookies-utils.service';
import { GlobalUtilsService } from './services/global-utils.service';
import { LanguageService } from './services/language.service';
import { DiseaseSearchComponent } from './pages/disease-search.component';
import { DiseaseComponent } from './pages/disease.component';
import { NotFoundComponent } from './pages/not-found.component';

const appRoutes: Routes = [
  { path: '',   redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'disease-search', component: DiseaseSearchComponent },
  { path: 'disease/:id', component: DiseaseComponent },
  { path: '**', component: NotFoundComponent }
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
    SimpleDialogComponent,
    DiseaseSearchComponent,
    DiseaseComponent,
    NotFoundComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    HttpClientModule,
    NgSelectModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatInputModule,
    MatDialogModule,
    ReactiveFormsModule,
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
    DiseaseService,
    GlobalUtilsService
  ],
  bootstrap: [RootComponent],
  entryComponents: [SimpleDialogComponent]    // Material Angular Dialog
})
export class AppModule { }
