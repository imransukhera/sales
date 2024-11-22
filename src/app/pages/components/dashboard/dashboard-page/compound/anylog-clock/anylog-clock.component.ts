import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';


@Component({
  selector: 'app-anylog-clock',
  standalone: true,
  imports: [CommonModule, ],
  templateUrl: './anylog-clock.component.html',
  styleUrl: './anylog-clock.component.scss'
})
export class AnylogClockComponent implements OnInit{
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef;

  constructor() { }

  ngOnInit(): void {
    this.drawClock();
  }

  ngAfterViewInit() {
    this.drawClock();
  }

  private drawClock() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext("2d");
    let radius = canvas.height / 4;
    ctx.translate(radius, radius);
    radius = radius * 1.80;

    setInterval(() => {
      ctx.clearRect(-radius, -radius, 2 * radius, 2 * radius);  // Clear the canvas before drawing new frame
      this.drawFace(ctx, radius);
      this.drawNumbers(ctx, radius);
      this.drawTime(ctx, radius);
    }, 1000);
  }

  private drawFace(ctx: CanvasRenderingContext2D, radius: number) {
    const grad = ctx.createRadialGradient(0, 0, radius * 0.95, 0, 0, radius * 1.05);
    grad.addColorStop(0, 'white ');
    grad.addColorStop(0.5, 'white');
    grad.addColorStop(1, 'white ');
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#1c4c74';
    ctx.fill();
    ctx.strokeStyle = grad;
    ctx.lineWidth = radius * 0.09;
    // ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.1, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
  }

  private drawNumbers(ctx: CanvasRenderingContext2D, radius: number) {
    ctx.font = radius * 0.19 + "px arial";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    for (let num = 1; num < 13; num++) {
      let ang = num * Math.PI / 6;
      ctx.rotate(ang);
      ctx.translate(0, -radius * 0.85);
      ctx.rotate(-ang);
      ctx.fillText(num.toString(), 0, 0);
      ctx.rotate(ang);
      ctx.translate(0, radius * 0.85);
      ctx.rotate(-ang);
    }
  }

  private drawTime(ctx: CanvasRenderingContext2D, radius: number) {
    const now = new Date();
    let hour = now.getHours();
    let minute = now.getMinutes();
    let second = now.getSeconds();

    // Hour
    hour = hour % 12;
    hour = (hour * Math.PI / 6) + (minute * Math.PI / (6 * 60)) + (second * Math.PI / (360 * 60));
    this.drawHand(ctx, hour, radius * 0.5, radius * 0.07);

    // Minute
    minute = (minute * Math.PI / 30) + (second * Math.PI / (30 * 60));
    this.drawHand(ctx, minute, radius * 0.8, radius * 0.07);

    // Second
    second = second * Math.PI / 30;
    this.drawHand(ctx, second, radius * 0.9, radius * 0.02);
  }

  private drawHand(ctx: CanvasRenderingContext2D, pos: number, length: number, width: number) {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.moveTo(0, 0);
    ctx.rotate(pos);
    ctx.lineTo(0, -length);
    ctx.stroke();
    ctx.rotate(-pos);
  }
 
}
