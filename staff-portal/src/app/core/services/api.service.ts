import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: "root" })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  get<T>(url: string) {
    return this.http.get<T>(`${this.baseUrl}${url}`);
  }

  post<T>(url: string, body: unknown) {
    return this.http.post<T>(`${this.baseUrl}${url}`, body);
  }

  patch<T>(url: string, body: unknown) {
    return this.http.patch<T>(`${this.baseUrl}${url}`, body);
  }

  delete<T>(url: string) {
    return this.http.delete<T>(`${this.baseUrl}${url}`);
  }

  assetUrl(url: string) {
    return `${this.baseUrl.replace(/\/api$/, "")}${url}`;
  }
}
