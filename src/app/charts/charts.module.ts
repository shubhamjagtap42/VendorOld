import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChartsRoutingModule } from './charts-routing.module';
import { ChartComponent } from './chart/chart.component';
import {ChartModule} from 'primeng/chart';
import { ChartService } from 'src/Services/chart.service';
import {CardModule} from 'primeng/card';
import {DropdownModule} from 'primeng/dropdown';
import {FormsModule} from '@angular/forms';








@NgModule({
  declarations: [
    ChartComponent
  ],
  imports: [
    CommonModule,
    ChartsRoutingModule,
    ChartModule,
    CardModule,
    DropdownModule,
    FormsModule,
  ],
  providers: [ChartService],
})
export class ChartsModule { }
