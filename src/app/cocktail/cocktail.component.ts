// src/app/cocktail/cocktail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CocktailService } from '../cocktail.service';

// ✅ con RxJS 7+ importa gli operatori da 'rxjs'
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-cocktail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cocktail.component.html',
  styleUrls: ['./cocktail.component.css'],
})
export class CocktailComponent implements OnInit {
  query = '';
  cocktails: any[] = [];
  suggestionsVisible = false;

  private searchSubject = new Subject<string>();

  constructor(private cocktailService: CocktailService) {}

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((term) => this.cocktailService.searchCocktails(term))
      )
      .subscribe((results) => {
        this.cocktails = (results || []).slice(0, 8);
        this.suggestionsVisible = this.cocktails.length > 0;
      });
  }

  onInputChange(): void {
    const term = this.query.trim();
    if (!term) {
      this.cocktails = [];
      this.suggestionsVisible = false;
      return;
    }
    this.searchSubject.next(term);
  }

  selectCocktail(c: any): void {
    this.query = c?.strDrink ?? '';
    this.suggestionsVisible = false;
  }
}
