import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, retry, timeout, catchError, throwError } from 'rxjs';

export interface PredictionRequest {
  features: number[];
  threshold?: number;
}

export interface PredictionResponse {
  prediction: number;
  probability: {
    no_transaction: number;
    transaction: number;
  };
  probability_percent?: string;
  confidence?: number;
  decision?: string;
  threshold_used?: number;
  confidence_level?: string;
  risk_score?: number;
  message: string;
}

export interface ModelInfo {
  model_type: string;
  n_features: number;
  training_framework: string;
  scaler: string;
  target: string;
  classes: number[];
  class_names: string[];
}

export interface HealthStatus {
  status: string;
  model_status: string;
  scaler_status: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    // Détection automatique : localhost = dev, sinon = production
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      this.apiUrl = 'http://localhost:5001';
    } else {
      this.apiUrl = 'https://credit-score-api-62r0.onrender.com';
    }
    console.log('API URL:', this.apiUrl);
  }

  getHealth(): Observable<HealthStatus> {
    return this.http.get<HealthStatus>(`${this.apiUrl}/health`).pipe(
      timeout(60000), // 60 secondes pour cold start Render
      retry(2),
      catchError(err => {
        console.error('Health check failed:', err);
        return throwError(() => err);
      })
    );
  }

  getModelInfo(): Observable<ModelInfo> {
    return this.http.get<ModelInfo>(`${this.apiUrl}/model-info`).pipe(
      timeout(60000),
      retry(2)
    );
  }

  predict(request: PredictionRequest): Observable<PredictionResponse> {
    console.log('Calling API:', this.apiUrl + '/predict');
    return this.http.post<PredictionResponse>(`${this.apiUrl}/predict`, request).pipe(
      timeout(60000), // 60 secondes pour cold start Render
      retry(2), // Retry 2 fois en cas d'échec
      catchError(err => {
        console.error('Prediction API error:', err);
        return throwError(() => err);
      })
    );
  }

  predictWithThreshold(request: PredictionRequest): Observable<PredictionResponse> {
    return this.http.post<PredictionResponse>(`${this.apiUrl}/predict_with_threshold`, request).pipe(
      timeout(60000),
      retry(2)
    );
  }

  // Méthode pour "réveiller" l'API (warm up)
  warmUp(): void {
    this.http.get(`${this.apiUrl}/health`).subscribe({
      next: () => console.log('API is warm'),
      error: () => console.log('API warming up...')
    });
  }
}
