import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { User, LoginCredentials, AuthResponse, DEFAULT_USERS, DEFAULT_PASSWORD } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    // Vérifier si l'utilisateur est déjà connecté (stocké dans localStorage)
    this.checkStoredUser();
  }

  private checkStoredUser() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    // Simuler un appel API avec un délai
    return of(credentials).pipe(
      delay(500),
      map(creds => {
        // Vérifier les identifiants
        const user = DEFAULT_USERS.find(u => u.username === creds.username);
        
        if (user && creds.password === DEFAULT_PASSWORD) {
          // Connexion réussie
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
          
          // Stocker dans localStorage
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('authToken', 'mock-jwt-token-' + Date.now());
          
          return {
            success: true,
            user: user,
            token: 'mock-jwt-token-' + Date.now()
          };
        } else {
          // Échec de connexion
          return {
            success: false,
            message: 'Identifiants incorrects'
          };
        }
      })
    );
  }

  logout() {
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}
