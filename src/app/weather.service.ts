import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private geocodingUrl = 'https://geocoding-api.open-meteo.com/v1/search?name=';
  private weatherUrl =
    'https://api.open-meteo.com/v1/forecast?current_weather=true';

  constructor(private http: HttpClient) {}

  /** 1️⃣ Recupera coordinate della città */
  private getCoordinates(
    city: string
  ): Observable<{ lat: number; lon: number }> {
    return this.http
      .get<any>(`${this.geocodingUrl}${encodeURIComponent(city)}`)
      .pipe(
        map((response) => {
          const result =
            response.results?.find((r: any) => r.country_code === 'IT') ||
            response.results?.[0];
          if (!result) throw new Error('Città non trovata');
          return { lat: result.latitude, lon: result.longitude };
        })
      );
  }

  /** 2️⃣ Recupera i dati meteo usando lat/lon */
  getWeatherByCoords(lat: number, lon: number): Observable<any> {
    const url = `${this.weatherUrl}&latitude=${lat}&longitude=${lon}`;
    return this.http.get<any>(url);
  }

  /** 3️⃣ Metodo pubblico: cerca città e ottiene meteo */
  getWeather(city: string): Observable<any> {
    return this.getCoordinates(city).pipe(
      switchMap((coords) => this.getWeatherByCoords(coords.lat, coords.lon))
    );
  }

  getCityOptions(city: string): Observable<any[]> {
    return this.http
      .get<any>(`${this.geocodingUrl}${encodeURIComponent(city)}`)
      .pipe(map((response) => response.results || []));
  }
}
