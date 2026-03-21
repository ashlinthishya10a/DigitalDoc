import { AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-signature-pad",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="signature-pad">
      <canvas
        #canvas
        width="360"
        height="150"
        (mousedown)="start($event)"
        (mousemove)="move($event)"
        (mouseup)="end()"
        (mouseleave)="end()"
        (touchstart)="start($event)"
        (touchmove)="move($event)"
        (touchend)="end()"
      ></canvas>
      <button type="button" class="outline-btn" (click)="clear()">Clear</button>
    </div>
  `
})
export class SignaturePadComponent implements AfterViewInit {
  @ViewChild("canvas", { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Output() changed = new EventEmitter<string>();
  private drawing = false;

  ngAfterViewInit() {
    const ctx = this.canvasRef.nativeElement.getContext("2d")!;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
  }

  private point(event: MouseEvent | TouchEvent) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const touch = event instanceof TouchEvent ? event.touches[0] : undefined;
    const clientX = touch ? touch.clientX : (event as MouseEvent).clientX;
    const clientY = touch ? touch.clientY : (event as MouseEvent).clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  start(event: MouseEvent | TouchEvent) {
    this.drawing = true;
    const ctx = this.canvasRef.nativeElement.getContext("2d")!;
    const { x, y } = this.point(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  move(event: MouseEvent | TouchEvent) {
    if (!this.drawing) return;
    const ctx = this.canvasRef.nativeElement.getContext("2d")!;
    const { x, y } = this.point(event);
    ctx.lineTo(x, y);
    ctx.stroke();
    this.changed.emit(this.canvasRef.nativeElement.toDataURL("image/png"));
  }

  end() {
    this.drawing = false;
  }

  clear() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.changed.emit("");
  }
}
