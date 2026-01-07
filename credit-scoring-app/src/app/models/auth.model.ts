/**
 * Modèle d'authentification pour la gestionnaire bancaire
 */

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'manager' | 'admin';
  email: string;
  agency: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

// Utilisateurs par défaut (en production, utiliser une vraie base de données)
export const DEFAULT_USERS: User[] = [
  {
    id: '1',
    username: 'gestionnaire',
    fullName: 'Marie Dupont',
    role: 'manager',
    email: 'marie.dupont@santander.fr',
    agency: 'Paris Centre'
  },
  {
    id: '2',
    username: 'admin',
    fullName: 'Jean Martin',
    role: 'admin',
    email: 'jean.martin@santander.fr',
    agency: 'Siège Social'
  }
];

// Mot de passe par défaut : "santander123" (à changer en production)
export const DEFAULT_PASSWORD = 'santander123';
