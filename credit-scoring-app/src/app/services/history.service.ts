import { Injectable } from '@angular/core';

export interface SimulationRecord {
  id: string;
  date: Date;
  client: {
    name: string;
    firstName: string;
    phone?: string;
    email?: string;
  };
  result: {
    score: number;
    decision: 'accepte' | 'refuse' | 'a_etudier';
    tauxEndettement: number;
    resteAVivre: number;
    motifs: string[];
  };
  answers: Record<string, number>;
  gestionnaire: string;
}

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private readonly STORAGE_KEY = 'credit_scoring_history';
  private readonly MAX_RECORDS = 100; // Limite de stockage

  constructor() {}

  /**
   * Récupère tout l'historique
   */
  getHistory(): SimulationRecord[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      
      const records = JSON.parse(data) as SimulationRecord[];
      // Convertir les dates string en Date objects
      return records.map(r => ({
        ...r,
        date: new Date(r.date)
      })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch {
      return [];
    }
  }

  /**
   * Ajoute une simulation à l'historique
   */
  addSimulation(record: Omit<SimulationRecord, 'id' | 'date'>): SimulationRecord {
    const newRecord: SimulationRecord = {
      ...record,
      id: this.generateId(),
      date: new Date()
    };

    const history = this.getHistory();
    history.unshift(newRecord);

    // Limiter le nombre d'enregistrements
    if (history.length > this.MAX_RECORDS) {
      history.splice(this.MAX_RECORDS);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    return newRecord;
  }

  /**
   * Supprime une simulation de l'historique
   */
  deleteSimulation(id: string): boolean {
    const history = this.getHistory();
    const index = history.findIndex(r => r.id === id);
    
    if (index === -1) return false;
    
    history.splice(index, 1);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    return true;
  }

  /**
   * Vide tout l'historique
   */
  clearHistory(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Récupère une simulation par ID
   */
  getSimulationById(id: string): SimulationRecord | null {
    const history = this.getHistory();
    return history.find(r => r.id === id) || null;
  }

  /**
   * Recherche dans l'historique
   */
  searchHistory(query: string): SimulationRecord[] {
    const history = this.getHistory();
    const lowerQuery = query.toLowerCase();
    
    return history.filter(r => 
      r.client.name.toLowerCase().includes(lowerQuery) ||
      r.client.firstName.toLowerCase().includes(lowerQuery) ||
      r.client.email?.toLowerCase().includes(lowerQuery) ||
      r.client.phone?.includes(query)
    );
  }

  /**
   * Statistiques de l'historique
   */
  getStats(): {
    total: number;
    accepted: number;
    refused: number;
    review: number;
    avgScore: number;
  } {
    const history = this.getHistory();
    
    if (history.length === 0) {
      return { total: 0, accepted: 0, refused: 0, review: 0, avgScore: 0 };
    }

    const accepted = history.filter(r => r.result.decision === 'accepte').length;
    const refused = history.filter(r => r.result.decision === 'refuse').length;
    const review = history.filter(r => r.result.decision === 'a_etudier').length;
    const avgScore = history.reduce((sum, r) => sum + r.result.score, 0) / history.length;

    return {
      total: history.length,
      accepted,
      refused,
      review,
      avgScore: Math.round(avgScore)
    };
  }

  /**
   * Génère un ID unique
   */
  private generateId(): string {
    return 'sim_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
