import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  constructor(private router: Router) {}

  onNavigateToMeteo(): void {
    console.log('✅ Pulsante cliccato, provo a navigare verso /meteo');
    this.router.navigate(['/meteo']).then(
      (success) => console.log('➡️ Navigazione riuscita:', success),
      (error) => console.error('❌ Errore navigazione:', error)
    );
  }
}
