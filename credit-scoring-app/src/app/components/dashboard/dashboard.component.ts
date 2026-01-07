import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HistoryService, SimulationRecord } from '../../services/history.service';
import { ApiService } from '../../services/api.service';
import { FeatureTransformerService } from '../../services/feature-transformer.service';
import { User } from '../../models/auth.model';
import { 
  BANK_QUESTIONS, 
  BankQuestion,
  CREDIT_THRESHOLD,
  getDefaultAnswers
} from '../../services/generated-defaults';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  currentStep: 'info' | 'questions' | 'results' | 'history' = 'info';
  
  // Étape 1: Informations client
  clientProfile = {
    name: '',
    firstName: '',
    phone: '',
    email: ''
  };
  
  // Configuration
  threshold = CREDIT_THRESHOLD; // 75/100
  
  // Étape 2: Questions groupées par catégorie
  allQuestions = BANK_QUESTIONS;
  categories: string[] = [];
  questionsByCategory: Record<string, BankQuestion[]> = {};
  currentCategoryIndex = 0;
  answers: Record<string, number> = {};
  showExplanation: string | null = null;
  
  // Étape 3: Résultats
  result: {
    score: number;
    decision: 'accepte' | 'refuse' | 'a_etudier';
    tauxEndettement: number;
    resteAVivre: number;
    motifs: string[];
    mlProbability?: number;
    mlConfidence?: string;
  } | null = null;
  
  // État de chargement
  isAnalyzing = false;
  apiError: string | null = null;

  // Historique
  historyRecords: SimulationRecord[] = [];
  historyStats = { total: 0, accepted: 0, refused: 0, review: 0, avgScore: 0 };
  searchQuery = '';
  selectedRecord: SimulationRecord | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private historyService: HistoryService,
    private apiService: ApiService,
    private featureTransformer: FeatureTransformerService
  ) {
    // Grouper les questions par catégorie
    this.allQuestions.forEach(q => {
      if (!this.questionsByCategory[q.category]) {
        this.questionsByCategory[q.category] = [];
        this.categories.push(q.category);
      }
      this.questionsByCategory[q.category].push(q);
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    // Initialiser avec les valeurs par défaut
    this.answers = getDefaultAnswers();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Navigation entre les étapes
  goToQuestions() {
    if (!this.clientProfile.name || !this.clientProfile.firstName) {
      alert('Veuillez renseigner le nom et prénom du client');
      return;
    }
    this.currentStep = 'questions';
    this.currentCategoryIndex = 0;
  }

  backToInfo() {
    this.currentStep = 'info';
  }

  // Catégorie courante
  get currentCategory(): string {
    return this.categories[this.currentCategoryIndex];
  }

  get currentQuestions(): BankQuestion[] {
    return this.questionsByCategory[this.currentCategory] || [];
  }

  get progress(): number {
    return ((this.currentCategoryIndex + 1) / this.categories.length) * 100;
  }

  // Navigation entre catégories
  previousCategory() {
    if (this.currentCategoryIndex > 0) {
      this.currentCategoryIndex--;
    }
  }

  nextCategory() {
    // Vérifier que toutes les questions de la catégorie sont remplies
    const unanswered = this.currentQuestions.filter(q => 
      this.answers[q.id] === undefined || this.answers[q.id] === null
    );
    
    if (unanswered.length > 0) {
      alert('Veuillez répondre à toutes les questions de cette section');
      return;
    }
    
    if (this.currentCategoryIndex < this.categories.length - 1) {
      this.currentCategoryIndex++;
    } else {
      this.analyzeCredit();
    }
  }

  // Toggle explication
  toggleExplanation(questionId: string) {
    this.showExplanation = this.showExplanation === questionId ? null : questionId;
  }

  // Analyse du crédit via API ML
  analyzeCredit() {
    this.isAnalyzing = true;
    this.apiError = null;
    
    // 1. Transformer les réponses en features ML
    const features = this.featureTransformer.transformAnswersToFeatures(this.answers);
    
    // 2. Calculer les métriques financières
    const metrics = this.featureTransformer.calculateFinancialMetrics(this.answers);
    
    // 3. Appeler l'API ML
    this.apiService.predict({ features, threshold: 0.5 }).subscribe({
      next: (response) => {
        // La probabilité de transaction positive du modèle ML
        const mlProbability = response.probability.transaction * 100;
        
        // Calculer le score final (combinaison ML + métriques métier)
        let score = this.calculateFinalScore(mlProbability, metrics);
        
        // Déterminer la décision
        let decision: 'accepte' | 'refuse' | 'a_etudier';
        const motifs: string[] = [];
        
        if (score >= 75) {
          decision = 'accepte';
        } else if (score >= 55) {
          decision = 'a_etudier';
        } else {
          decision = 'refuse';
        }
        
        // Ajouter les motifs basés sur les métriques
        if (metrics.tauxEndettement > 40) {
          motifs.push(`Taux d'endettement élevé (${metrics.tauxEndettement}%)`);
        }
        if (metrics.resteAVivre < 500) {
          motifs.push(`Reste à vivre insuffisant (${metrics.resteAVivre}€)`);
        }
        if (mlProbability < 30) {
          motifs.push('Profil ML à risque');
        }
        
        this.result = {
          score,
          decision,
          tauxEndettement: metrics.tauxEndettement,
          resteAVivre: metrics.resteAVivre,
          motifs,
          mlProbability: Math.round(mlProbability),
          mlConfidence: response.confidence_level || this.getConfidenceLevel(response.confidence || 50)
        };
        
        this.currentStep = 'results';
        this.isAnalyzing = false;
        
        // Sauvegarder dans l'historique
        this.saveToHistory();
      },
      error: (error) => {
        console.error('Erreur API:', error);
        this.apiError = 'Impossible de contacter le serveur ML. Utilisation du scoring de secours.';
        
        // Fallback: calcul local si API indisponible
        this.fallbackLocalScoring(metrics);
        this.isAnalyzing = false;
      }
    });
  }
  
  // Calcul du score final combinant ML et métriques métier
  private calculateFinalScore(mlProbability: number, metrics: { tauxEndettement: number; resteAVivre: number }): number {
    // Score de base depuis le ML (60% du poids)
    let score = mlProbability * 0.6;
    
    // Bonus/malus basé sur le taux d'endettement (25% du poids)
    if (metrics.tauxEndettement <= 25) {
      score += 25;
    } else if (metrics.tauxEndettement <= 33) {
      score += 20;
    } else if (metrics.tauxEndettement <= 40) {
      score += 10;
    } else {
      score += 0;
    }
    
    // Bonus/malus basé sur le reste à vivre (15% du poids)
    if (metrics.resteAVivre >= 1500) {
      score += 15;
    } else if (metrics.resteAVivre >= 1000) {
      score += 12;
    } else if (metrics.resteAVivre >= 500) {
      score += 8;
    } else {
      score += 0;
    }
    
    return Math.min(100, Math.round(score));
  }
  
  private getConfidenceLevel(confidence: number): string {
    if (confidence >= 80) return 'HIGH';
    if (confidence >= 60) return 'MEDIUM';
    return 'LOW';
  }
  
  // Scoring de secours si l'API est indisponible
  private fallbackLocalScoring(metrics: { tauxEndettement: number; resteAVivre: number }) {
    let score = 50; // Score de base
    
    // Ajustements basés sur les métriques financières
    if (metrics.tauxEndettement <= 25) score += 25;
    else if (metrics.tauxEndettement <= 33) score += 15;
    else if (metrics.tauxEndettement <= 40) score += 5;
    else score -= 15;
    
    if (metrics.resteAVivre >= 1500) score += 20;
    else if (metrics.resteAVivre >= 1000) score += 15;
    else if (metrics.resteAVivre >= 500) score += 5;
    else score -= 10;
    
    // Ajustements basés sur les réponses
    const typeContrat = this.answers['type_contrat'] || 0;
    if (typeContrat >= 85) score += 10;
    else if (typeContrat >= 65) score += 5;
    
    const incidents = this.answers['incidents_paiement'] || 0;
    if (incidents >= 100) score += 5;
    else if (incidents <= 45) score -= 15;
    
    score = Math.min(100, Math.max(0, score));
    
    let decision: 'accepte' | 'refuse' | 'a_etudier';
    if (score >= 75) decision = 'accepte';
    else if (score >= 55) decision = 'a_etudier';
    else decision = 'refuse';
    
    this.result = {
      score,
      decision,
      tauxEndettement: metrics.tauxEndettement,
      resteAVivre: metrics.resteAVivre,
      motifs: ['⚠️ Scoring de secours (API indisponible)'],
      mlProbability: undefined,
      mlConfidence: undefined
    };
    
    this.currentStep = 'results';
    this.saveToHistory();
  }
  
  private saveToHistory() {
    if (this.result && this.currentUser) {
      this.historyService.addSimulation({
        client: { ...this.clientProfile },
        result: {
          score: this.result.score,
          decision: this.result.decision,
          tauxEndettement: this.result.tauxEndettement,
          resteAVivre: this.result.resteAVivre,
          motifs: this.result.motifs
        },
        answers: { ...this.answers },
        gestionnaire: this.currentUser.username
      });
    }
  }

  // Nouvelle analyse
  newAnalysis() {
    this.currentStep = 'info';
    this.currentCategoryIndex = 0;
    this.answers = getDefaultAnswers();
    this.result = null;
    this.selectedRecord = null;
    this.clientProfile = {
      name: '',
      firstName: '',
      phone: '',
      email: ''
    };
  }

  // ===== HISTORIQUE =====
  
  goToHistory() {
    this.loadHistory();
    this.currentStep = 'history';
  }

  loadHistory() {
    this.historyRecords = this.historyService.getHistory();
    this.historyStats = this.historyService.getStats();
  }

  searchHistory() {
    if (this.searchQuery.trim()) {
      this.historyRecords = this.historyService.searchHistory(this.searchQuery);
    } else {
      this.historyRecords = this.historyService.getHistory();
    }
  }

  viewRecord(record: SimulationRecord) {
    this.selectedRecord = record;
  }

  closeRecordDetail() {
    this.selectedRecord = null;
  }

  deleteRecord(id: string, event: Event) {
    event.stopPropagation();
    if (confirm('Supprimer cette simulation de l\'historique ?')) {
      this.historyService.deleteSimulation(id);
      this.loadHistory();
      if (this.selectedRecord?.id === id) {
        this.selectedRecord = null;
      }
    }
  }

  clearAllHistory() {
    if (confirm('Voulez-vous vraiment supprimer tout l\'historique ? Cette action est irréversible.')) {
      this.historyService.clearHistory();
      this.loadHistory();
    }
  }

  getDecisionBadge(decision: string): string {
    switch (decision) {
      case 'accepte': return '✅ Accordé';
      case 'a_etudier': return '⚠️ À étudier';
      case 'refuse': return '❌ Refusé';
      default: return '';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Helpers pour l'affichage
  getDecisionLabel(): string {
    if (!this.result) return '';
    switch (this.result.decision) {
      case 'accepte': return '✅ CRÉDIT ACCORDÉ';
      case 'a_etudier': return '⚠️ À ÉTUDIER';
      case 'refuse': return '❌ CRÉDIT REFUSÉ';
      default: return '';
    }
  }

  getDecisionClass(): string {
    if (!this.result) return '';
    switch (this.result.decision) {
      case 'accepte': return 'decision-accepted';
      case 'a_etudier': return 'decision-review';
      case 'refuse': return 'decision-refused';
      default: return '';
    }
  }

  getScoreClass(): string {
    if (!this.result) return '';
    if (this.result.score >= 75) return 'score-excellent';
    if (this.result.score >= 55) return 'score-moyen';
    return 'score-faible';
  }

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      'Revenus': '💰',
      'Charges': '📊',
      'Épargne': '🏦',
      'Historique': '📋',
      'Projet': '🎯'
    };
    return icons[category] || '📝';
  }
}
