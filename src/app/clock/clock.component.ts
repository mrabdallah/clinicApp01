import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-clock',
  standalone: true,
  imports: [],
  templateUrl: './clock.component.html',
  styles: ``
})
export class ClockComponent implements OnInit {
  public hours!: string;
  public minutes!: string;
  public seconds!: string;
  public ampm!: string;
  public day!: string;
  public date?: string;
  private daysArray = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  // private date = new Date();

  ngOnInit() {

    let start = Date.now();
    setInterval(() => {
      let delta = Date.now() - start; // milliseconds elapsed since start
        
      // this.updateDate(Math.floor(delta / 1000));
      this.updateDate(new Date());
      this.day = this.daysArray[new Date().getDay()];
      this.date = `${new Date().getDate()} ${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`;
    }, 1000); // update about every second



    // setInterval(() => {
    //   const date = new Date();
    //   this.updateDate(date);
    // }, 1000 / 60);
  }
  
  private updateDate(date: Date){
    const gHours = date.getHours();
  
    this.ampm = gHours >= 12 ? 'PM' : 'AM';
  
    this.hours = `${gHours % 12}`;  // into 12 hours format
    this.hours = gHours % 12 ? this.hours : '12';  // if 0 => 12
  
    this.hours = this.hours.length > 1 ? this.hours : `0${this.hours}`;  // if single digit => add '0' infront
    
    const gMinutes = date.getMinutes();
    this.minutes = gMinutes < 10 ? `0${gMinutes}` : gMinutes.toString();
    
    const gSeconds = date.getSeconds();
    this.seconds = gSeconds < 10 ? `0${gSeconds}` : gSeconds.toString();
  }
}