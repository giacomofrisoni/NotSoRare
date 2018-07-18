// Imported and 3rd-part component
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';              // ReactiveFormsModule for Angular Material
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';                          // Select
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';           // Translator
import { TranslateHttpLoader } from '@ngx-translate/http-loader';                 // Loader for translator
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';   // Angular Material Animations
import { MatCheckboxModule, MatAutocompleteModule, MatInputModule } from '@angular/material';           // Angular Material
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
import { DiseaseSearchComponent } from './pages/disease-search.component';
import { DiseaseComponent } from './pages/disease.component';
import { NotFoundComponent } from './pages/not-found.component';
import { OverviewComponent } from './pages/disease-pages/overview.component';
import { ExperiencesComponent } from './pages/disease-pages/experiences.component';
import { ExpertCentresComponent } from './pages/disease-pages/expert-centres.component';
import { ForumComponent } from './pages/disease-pages/forum.component';
import { ReferencesComponent } from './pages/disease-pages/references.component';
import { SearchBarComponent } from './components/search-bar.component';
import { ExperienceComponent } from './pages/disease-pages/experience.component';
import { ExperiencePreviewComponent } from './components/experience-preview.component';
import { ForumThreadComponent } from './pages/disease-pages/forum-thread.component';
import { ForumThreadViewComponent } from './components/forum-thread-view.component';
import { ProfileFollowedDiseasesComponent } from './pages/profile-pages/profile-followed-diseases.component';
import { ProfileThreadsComponent } from './pages/profile-pages/profile-threads.component';
import { ProfileExperiencesComponent } from './pages/profile-pages/profile-experiences.component';
import { NewExperienceComponent } from './pages/disease-pages/new-experience.component';
import { NewThreadComponent } from './pages/disease-pages/new-thread.component';
import { ModeratorLoginComponent } from './pages/moderator-login.component';

// Custom services
import { UserService } from './services/user.service';
import { DiseaseService } from './services/disease.service';
import { CookiesUtilsService } from './services/cookies-utils.service';
import { GlobalUtilsService } from './services/global-utils.service';
import { LanguageService } from './services/language.service';
import { DiseaseHolderService } from './services/disease-holder.service';
import { ExperiencesService } from './services/experiences.service';
import { ExpertCentresService } from './services/expert-centres.service';
import { ReferencesService } from './services/references.service';
import { ForumService } from './services/forum.service';
import { ProfileHolderService } from './services/profile-holder.service';
import { NotificatorService } from './services/notificator.service';


const appRoutes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'moderatorLogin', component: ModeratorLoginComponent },
  {
    path: 'profile/:id', component: ProfileComponent,
    children: [
      { path: '', redirectTo: 'followedDiseases', pathMatch: 'full' },
      { path: 'followedDiseases', component: ProfileFollowedDiseasesComponent },
      { path: 'threads', component: ProfileThreadsComponent },
      { path: 'experiences', component: ProfileExperiencesComponent }]
  },
  { path: 'disease-search', component: DiseaseSearchComponent },
  { path: 'disease-search/:id', component: DiseaseSearchComponent },
  {
    path: 'disease/:id', component: DiseaseComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: OverviewComponent },
      { path: 'expert-centres', component: ExpertCentresComponent },
      { path: 'experiences', component: ExperiencesComponent },
      { path: "newExperience", component: NewExperienceComponent },
      { path: 'experiences/:codUser', component: ExperienceComponent },
      { path: 'forum', component: ForumComponent },
      { path: 'forum/:codThread', component: ForumThreadComponent },
      { path: 'newForumThread', component: NewThreadComponent },
      { path: 'references', component: ReferencesComponent }]
  },
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
    OverviewComponent,
    ExperiencesComponent,
    ExpertCentresComponent,
    ForumComponent,
    ReferencesComponent,
    SearchBarComponent,
    ExperienceComponent,
    ExperiencePreviewComponent,
    ForumThreadComponent,
    ForumThreadViewComponent,
    ProfileFollowedDiseasesComponent,
    ProfileThreadsComponent,
    ProfileExperiencesComponent,
    NewExperienceComponent,
    NewThreadComponent,
    ModeratorLoginComponent,
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
    GlobalUtilsService,
    DiseaseHolderService,
    ProfileHolderService,
    ExperiencesService,
    ExpertCentresService,
    ReferencesService,
    ForumService,
    NotificatorService
  ],
  bootstrap: [RootComponent],
  entryComponents: [SimpleDialogComponent]    // Material Angular Dialog
})
export class AppModule { }
