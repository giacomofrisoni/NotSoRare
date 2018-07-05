import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { Observable, of, Subject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-countries-selector',
  templateUrl: './countries-selector.component.html',
  styleUrls: ['../../assets/styles/countries-selector.component.scss']
})
export class CountriesSelectorComponent implements OnInit {

  public items: Subject<any> = new Subject<any>();


  constructor(private http: Http) { 
    this.readJSON().subscribe(
      data => {
        var realData = [];
        data.forEach(element => {
          //Get known objects
          var code = element.cca3.toLowerCase();
          var name = element.name.common;

          //Try to get real state name
          var translatedName = "";
          for (var prop in element.name.native) {
            if (prop === code) {
              translatedName = element.name.native[prop].common;
            }
          }

          //Push all the data
          realData.push({
            id: code,
            name: name,
            translatedName: translatedName,
            icon: '../../assets/countries/flags/' + element.cca3.toLowerCase() + '.svg'
          });
        });

        //Reload
        this.items.next(realData);
      }
    );
  }

  ngOnInit() {
  }

  readJSON(): Observable<any> {
    return this.http.get("../../assets/countries/countries.json").pipe(
      map((res:any) => res.json()),
      catchError(err => of('Something went wrong: ' + err))
    );              
  }

  searchFunction(term: string, item: any): boolean {
    return item.name.toLowerCase().includes(term.toLowerCase()) || item.translatedName.toLowerCase().includes(term.toLowerCase());
  }

}
