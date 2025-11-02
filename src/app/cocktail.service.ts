// src/app/cocktail/cocktail.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CocktailService {
  private apiUrl = 'https://www.thecocktaildb.com/api/json/v1/1/search.php?s=';

  constructor(private http: HttpClient) {}

  searchCocktails(query: string): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}${encodeURIComponent(query)}`).pipe(
      map(res => res?.drinks ?? [])
    );
  }
}
