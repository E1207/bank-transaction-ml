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
  
  // Configuration du crédit (demandé dès le début)
  creditConfig = {
    montant: 20000,
    duree: 60,
    objet: 90
  };
  
  // Configuration
  threshold = CREDIT_THRESHOLD; // 75/100
  
  // Options pour le crédit
  dureeOptions = [
    { label: '12 mois (1 an)', value: 12 },
    { label: '24 mois (2 ans)', value: 24 },
    { label: '36 mois (3 ans)', value: 36 },
    { label: '48 mois (4 ans)', value: 48 },
    { label: '60 mois (5 ans)', value: 60 },
    { label: '72 mois (6 ans)', value: 72 },
    { label: '84 mois (7 ans)', value: 84 },
    { label: '96 mois (8 ans)', value: 96 },
    { label: '120 mois (10 ans)', value: 120 },
    { label: '180 mois (15 ans)', value: 180 },
    { label: '240 mois (20 ans)', value: 240 }
  ];
  
  objetOptions = [
    { label: 'Travaux rénovation énergétique', value: 100 },
    { label: 'Achat véhicule neuf', value: 95 },
    { label: 'Travaux amélioration habitat', value: 90 },
    { label: 'Achat véhicule occasion', value: 85 },
    { label: 'Études des enfants', value: 85 },
    { label: 'Équipement maison', value: 75 },
    { label: 'Événement familial', value: 65 },
    { label: 'Rachat de crédits', value: 60 },
    { label: 'Voyage / Loisirs', value: 50 },
    { label: 'Besoin de trésorerie', value: 40 }
  ];
  
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
    
    // Warm-up de l'API (réveil du cold start Render)
    this.apiService.warmUp();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Navigation depuis la landing page
  startNewAnalysis() {
    this.currentStep = 'info';
  }

  // Navigation entre les étapes
  goToQuestions() {
    if (!this.clientProfile.name || !this.clientProfile.firstName) {
      alert('Veuillez renseigner le nom et prénom du client');
      return;
    }
    // Synchroniser les valeurs du crédit dans les réponses
    this.answers['montant_demande'] = this.creditConfig.montant;
    this.answers['duree_souhaitee'] = this.creditConfig.duree;
    this.answers['objet_credit'] = this.creditConfig.objet;
    
    this.currentStep = 'questions';
    this.currentCategoryIndex = 0;
  }

  backToInfo() {
    this.currentStep = 'info';
  }
  
  backToHome() {
    this.router.navigate(['/']);
  }

  // Calculer la mensualité estimée
  get mensualiteEstimee(): number {
    const taux = 0.049; // 4.9% annuel approximatif
    const mensualites = this.creditConfig.duree;
    const capital = this.creditConfig.montant;
    const tauxMensuel = taux / 12;
    return Math.round(capital * tauxMensuel / (1 - Math.pow(1 + tauxMensuel, -mensualites)));
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
        
        // Déterminer la décision en utilisant le seuil configurable
        let decision: 'accepte' | 'refuse' | 'a_etudier';
        const motifs: string[] = [];
        
        // Utiliser le seuil de la jauge (this.threshold)
        const seuilEtude = Math.max(this.threshold - 20, 40); // Seuil "à étudier" = seuil - 20
        
        if (score >= this.threshold) {
          decision = 'accepte';
        } else if (score >= seuilEtude) {
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
        
        // Calculer la contribution ML effective (la partie ML du score sur 60 points max, ramenée à 100)
        const mlContribution = Math.round((mlProbability * 0.6 / 60) * 100);
        
        // Niveau de confiance basé sur la cohérence entre ML et métriques
        let confidenceLevel: string;
        const metricsScore = this.getMetricsScore(metrics);
        const coherence = Math.abs(mlProbability - metricsScore);
        if (coherence < 20) {
          confidenceLevel = 'HIGH';
        } else if (coherence < 40) {
          confidenceLevel = 'MEDIUM';
        } else {
          confidenceLevel = 'LOW';
        }
        
        this.result = {
          score,
          decision,
          tauxEndettement: metrics.tauxEndettement,
          resteAVivre: metrics.resteAVivre,
          motifs,
          mlProbability: mlContribution, // Score ML cohérent avec le résultat
          mlConfidence: confidenceLevel
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
  
  // Calcul du score final - équilibré pour permettre des acceptations réalistes
  private calculateFinalScore(mlProbability: number, metrics: { tauxEndettement: number; resteAVivre: number }): number {
    let score = 20; // Score de base pour tout dossier complet
    
    // === TAUX D'ENDETTEMENT (35 points max) ===
    if (metrics.tauxEndettement <= 20) {
      score += 35; // Excellent
    } else if (metrics.tauxEndettement <= 28) {
      score += 30; // Très bon
    } else if (metrics.tauxEndettement <= 35) {
      score += 25; // Bon (limite légale)
    } else if (metrics.tauxEndettement <= 40) {
      score += 15; // Acceptable
    } else if (metrics.tauxEndettement <= 50) {
      score += 5; // Risqué
    } else {
      score -= 10; // Surendettement
    }
    
    // === RESTE À VIVRE (30 points max) ===
    if (metrics.resteAVivre >= 1500) {
      score += 30; // Excellent
    } else if (metrics.resteAVivre >= 1000) {
      score += 25; // Très bon
    } else if (metrics.resteAVivre >= 700) {
      score += 20; // Bon
    } else if (metrics.resteAVivre >= 400) {
      score += 12; // Acceptable
    } else if (metrics.resteAVivre >= 100) {
      score += 5; // Limite
    } else if (metrics.resteAVivre >= 0) {
      score += 0; // Aucune marge
    } else {
      score -= 15; // Négatif = malus
    }
    
    // === CONTRIBUTION ML (15 points max) ===
    score += (mlProbability / 100) * 15;
    
    // === MALUS pour situations vraiment critiques ===
    if (metrics.tauxEndettement > 50) {
      score -= 15; // Surendettement sévère
    }
    if (metrics.resteAVivre < 0) {
      score -= 20; // Déficit budgétaire
    }
    
    // Borner le score entre 0 et 100
    return Math.max(0, Math.min(100, Math.round(score)));
  }
  
  private getConfidenceLevel(confidence: number): string {
    if (confidence >= 80) return 'HIGH';
    if (confidence >= 60) return 'MEDIUM';
    return 'LOW';
  }
  
  // Calculer un score basé uniquement sur les métriques financières (pour comparer avec ML)
  private getMetricsScore(metrics: { tauxEndettement: number; resteAVivre: number }): number {
    let score = 20; // Score de base
    
    // Taux d'endettement (35 points max)
    if (metrics.tauxEndettement <= 20) score += 35;
    else if (metrics.tauxEndettement <= 28) score += 30;
    else if (metrics.tauxEndettement <= 35) score += 25;
    else if (metrics.tauxEndettement <= 40) score += 15;
    else if (metrics.tauxEndettement <= 50) score += 5;
    else score -= 10;
    
    // Reste à vivre (30 points max)
    if (metrics.resteAVivre >= 1500) score += 30;
    else if (metrics.resteAVivre >= 1000) score += 25;
    else if (metrics.resteAVivre >= 700) score += 20;
    else if (metrics.resteAVivre >= 400) score += 12;
    else if (metrics.resteAVivre >= 100) score += 5;
    else if (metrics.resteAVivre >= 0) score += 0;
    else score -= 15;
    
    return Math.max(0, Math.min(100, score));
  }
  
  // Scoring de secours si l'API est indisponible - utilise la même logique stricte
  private fallbackLocalScoring(metrics: { tauxEndettement: number; resteAVivre: number }) {
    const motifs: string[] = ['⚠️ Scoring de secours (API indisponible)'];
    
    // Récupération des données du questionnaire
    const revenus = this.answers['revenus_mensuels'] || 0;
    const epargne = this.answers['epargne'] || 0;
    const typeContrat = this.answers['type_contrat'] || 0;
    const anciennete = this.answers['anciennete_emploi'] || 0;
    const incidents = this.answers['incidents_paiement'] || 100;
    
    // Si pas de revenus = score 0
    if (revenus <= 0) {
      motifs.push('❌ Aucun revenu déclaré');
      this.result = {
        score: 0,
        decision: 'refuse',
        tauxEndettement: metrics.tauxEndettement,
        resteAVivre: metrics.resteAVivre,
        motifs,
        mlProbability: undefined,
        mlConfidence: undefined
      };
      this.currentStep = 'results';
      this.saveToHistory();
      return;
    }
    
    let score = 20; // Score de base pour dossier complet
    
    // Taux d'endettement (35 points max)
    if (metrics.tauxEndettement <= 20) {
      score += 35;
      motifs.push('✅ Taux d\'endettement excellent (≤20%)');
    } else if (metrics.tauxEndettement <= 28) {
      score += 30;
      motifs.push('✅ Taux d\'endettement très bon (≤28%)');
    } else if (metrics.tauxEndettement <= 35) {
      score += 25;
      motifs.push('✅ Taux d\'endettement correct (≤35%)');
    } else if (metrics.tauxEndettement <= 40) {
      score += 15;
      motifs.push('⚠️ Taux d\'endettement élevé (≤40%)');
    } else if (metrics.tauxEndettement <= 50) {
      score += 5;
      motifs.push('⛔ Taux d\'endettement très élevé (>40%)');
    } else {
      score -= 10;
      motifs.push('❌ Surendettement critique (>50%)');
    }
    
    // Reste à vivre (30 points max)
    if (metrics.resteAVivre >= 1500) {
      score += 30;
      motifs.push('✅ Reste à vivre confortable (≥1500€)');
    } else if (metrics.resteAVivre >= 1000) {
      score += 25;
      motifs.push('✅ Reste à vivre correct (≥1000€)');
    } else if (metrics.resteAVivre >= 700) {
      score += 20;
      motifs.push('✅ Reste à vivre acceptable (≥700€)');
    } else if (metrics.resteAVivre >= 400) {
      score += 12;
      motifs.push('⚠️ Reste à vivre limité (≥400€)');
    } else if (metrics.resteAVivre >= 100) {
      score += 5;
      motifs.push('⚠️ Reste à vivre faible (≥100€)');
    } else if (metrics.resteAVivre >= 0) {
      score += 0;
      motifs.push('⛔ Reste à vivre très faible');
    } else {
      score -= 15;
      motifs.push('❌ Reste à vivre négatif - situation critique');
    }
    
    // Épargne (10 points max)
    if (epargne >= 20000) {
      score += 10;
    } else if (epargne >= 5000) {
      score += 7;
    } else if (epargne >= 1000) {
      score += 4;
    }
    
    // Stabilité professionnelle (5 points max)
    const stabilityScore = typeContrat + anciennete;
    if (stabilityScore >= 150) {
      score += 5;
    } else if (stabilityScore >= 100) {
      score += 3;
    }
    
    // Incidents de paiement (malus seulement)
    if (incidents <= 45) {
      score -= 10;
      motifs.push('⚠️ Historique d\'incidents de paiement');
    }
    
    score = Math.min(100, Math.max(0, score));
    
    // Utiliser le seuil configurable
    const seuilEtude = Math.max(this.threshold - 20, 40);
    
    let decision: 'accepte' | 'refuse' | 'a_etudier';
    if (score >= this.threshold) decision = 'accepte';
    else if (score >= seuilEtude) decision = 'a_etudier';
    else decision = 'refuse';
    
    this.result = {
      score,
      decision,
      tauxEndettement: metrics.tauxEndettement,
      resteAVivre: metrics.resteAVivre,
      motifs,
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
    const seuilEtude = Math.max(this.threshold - 20, 40);
    if (this.result.score >= this.threshold) return 'score-excellent';
    if (this.result.score >= seuilEtude) return 'score-moyen';
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
