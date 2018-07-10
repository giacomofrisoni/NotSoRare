import { Component, OnInit, Inject} from '@angular/core';
import { SimpleDialogType } from './simple-dialog-type.enum';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";

@Component({
  selector: 'app-simple-dialog',
  templateUrl: './simple-dialog.component.html',
  styleUrls: ['../../assets/styles/simple-dialog.component.scss']
})
export class SimpleDialogComponent implements OnInit {

  title: string;
  text: string;
  mainButtonText: string;
  alterButtonText: string;
  isAlterEnabled: boolean = false;
  type: SimpleDialogType;


  constructor(private dialogRef: MatDialogRef<SimpleDialogComponent>, @Inject(MAT_DIALOG_DATA) data) {
    this.title = data.title;
    this.text = data.text;
    this.isAlterEnabled = data.isAlterEnabled;
    this.type = data.type;
    this.mainButtonText = data.mainButtonText;
    this.alterButtonText = data.alterButtonText;
  }

  ngOnInit() {

  }

  onAlterClick() {
    this.dialogRef.close(null);
  }

  onMainClick() {
    this.dialogRef.close("OK");
  }

}
