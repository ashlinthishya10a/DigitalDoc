import { Injectable, signal } from "@angular/core";
import { tap } from "rxjs";
import { ApiService } from "./api.service";
import { AuthUser, Role } from "../../shared/models/types";

interface AuthResponse {
  token: string;
  user: AuthUser;
}

@Injectable({ providedIn: "root" })
export class AuthService {
  user = signal<AuthUser | null>(null);
  tokenKey = "staff_token";

  constructor(private api: ApiService) {}

  login(role: Role, identifier: string, password: string) {
    return this.api.post<AuthResponse>("/auth/login", { role, identifier, password }).pipe(
      tap((response) => {
        localStorage.setItem(this.tokenKey, response.token);
        this.user.set(response.user);
      })
    );
  }

  signup(role: "faculty" | "hod", identifier: string, password: string, extra: { name: string; email: string }) {
    return this.api.post<AuthResponse>("/auth/signup", { role, identifier, password, ...extra }).pipe(
      tap((response) => {
        localStorage.setItem(this.tokenKey, response.token);
        this.user.set(response.user);
      })
    );
  }

  hydrate() {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) return;
    this.api.get<{ user: AuthUser }>("/auth/me").subscribe({
      next: (response) => this.user.set(response.user),
      error: () => this.logout()
    });
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.user.set(null);
  }
}
