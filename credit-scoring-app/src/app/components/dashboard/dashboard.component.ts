import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HistoryService, SimulationRecord } from '../../services/history.service';
import { User } from '../../models/auth.model';
import { 
  BANK_QUESTIONS, 
  BankQuestion,
  CREDIT_THRESHOLD,
  calculateCreditScore,
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
  result: ReturnType<typeof calculateCreditScore> | null = null;

  // Historique
  historyRecords: SimulationRecord[] = [];
  historyStats = { total: 0, accepted: 0, refused: 0, review: 0, avgScore: 0 };
  searchQuery = '';
  selectedRecord: SimulationRecord | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private historyService: HistoryService
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

  // Analyse du crédit
  analyzeCredit() {
    this.result = calculateCreditScore(this.answers);
    this.currentStep = 'results';
    
    // Sauvegarder dans l'historique
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
