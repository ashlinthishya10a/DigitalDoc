import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "statusLabel",
  standalone: true
})
export class StatusLabelPipe implements PipeTransform {
  transform(value: string): string {
    return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
  }
}
