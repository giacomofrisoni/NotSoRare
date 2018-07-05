import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Http } from '@angular/http';
import { Observable, of, Subject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TranslatorService } from '../services/translator.service';
import { Language } from '../models/language';

@Component({
  selector: 'app-countries-selector',
  templateUrl: './countries-selector.component.html',
  styleUrls: ['../../assets/styles/countries-selector.component.scss']
})
export class CountriesSelectorComponent implements OnInit {

  @Output() onSelected: EventEmitter<any> = new EventEmitter();

  public items: Subject<any> = new Subject<any>();
  public selectedItem: any;


  constructor(private http: Http, private translatorService: TranslatorService) { 
    this.translatorService.getAllCountries(data => {
      this.items.next(data);
    }, error => {
      console.log("Reading languages was unsuccesfull");
      console.log(error);
    })
  }

  ngOnInit() {
  }


  searchFunction(term: string, item: any): boolean {
    return item.name.toLowerCase().includes(term.toLowerCase()) || item.translatedName.toLowerCase().includes(term.toLowerCase());
  }

  onItemSelected(): void {
    this.onSelected.emit([this.selectedItem]);
  }

}
