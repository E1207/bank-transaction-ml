import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private apiUrl = 'http://localhost:5001';

  constructor(private http: HttpClient) {}

  getHealth(): Observable<HealthStatus> {
    return this.http.get<HealthStatus>(`${this.apiUrl}/health`);
  }

  getModelInfo(): Observable<ModelInfo> {
    return this.http.get<ModelInfo>(`${this.apiUrl}/model-info`);
  }

  predict(request: PredictionRequest): Observable<PredictionResponse> {
    return this.http.post<PredictionResponse>(`${this.apiUrl}/predict`, request);
  }

  predictWithThreshold(request: PredictionRequest): Observable<PredictionResponse> {
    return this.http.post<PredictionResponse>(`${this.apiUrl}/predict_with_threshold`, request);
  }
}
