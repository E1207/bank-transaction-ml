import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  loading: boolean = false;
  error: string = '';
  showPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    if (!this.username || !this.password) {
      this.error = 'Veuillez remplir tous les champs';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login({ username: this.username, password: this.password })
      .subscribe({
        next: (response) => {
          if (response.success && response.user) {
            console.log('✅ Connexion réussie:', response.user.fullName);
            this.router.navigate(['/dashboard']);
          } else {
            this.error = response.message || 'Erreur de connexion';
            this.loading = false;
          }
        },
        error: (err) => {
          this.error = 'Erreur serveur. Veuillez réessayer.';
          this.loading = false;
          console.error('Erreur de connexion:', err);
        }
      });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Remplir automatiquement pour le test
  fillTestCredentials() {
    this.username = 'gestionnaire';
    this.password = 'santander123';
  }
}
