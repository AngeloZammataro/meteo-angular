import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../weather.service';
import { NgIf, NgFor, TitleCasePipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, TitleCasePipe, DatePipe],
  templateUrl: './weather.component.html',
  styleUrl: './weather.component.css',
})
export class WeatherComponent implements OnInit {
  city: string = '';
  filteredCities: any[] = [];
  suggestionsVisible = false;

  weatherData: any;
  selectedCity: any = null;
  isLoading = false;
  currentYear = new Date().getFullYear();

  private map: L.Map | null = null;
  private searchSubject = new Subject<string>();

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    // 🔹 Setup per l’autocomplete con debounce
    this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((term) => this.weatherService.getCityOptions(term))
      )
      .subscribe({
        next: (results) => {
          this.filteredCities = results.slice(0, 10);
          this.suggestionsVisible = true;
        },
        error: () => (this.filteredCities = []),
      });

    // 🔧 Fix: imposta marker default per Leaflet anche in produzione
    const iconDefault = L.icon({
      iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
      iconUrl: 'assets/leaflet/marker-icon.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41],
    });
    L.Marker.prototype.options.icon = iconDefault;
  }

  // 🔹 Autocomplete
  onCityInput(): void {
    if (!this.city.trim()) {
      this.filteredCities = [];
      this.suggestionsVisible = false;
      return;
    }
    this.searchSubject.next(this.city);
  }

  // 🔹 Nasconde la lista dopo un breve delay
  hideSuggestions(): void {
    setTimeout(() => (this.suggestionsVisible = false), 200);
  }

  // 🔹 Seleziona una città
  selectCity(city: any): void {
    this.selectedCity = city;
    this.city = city.name;
    this.filteredCities = [];
    this.suggestionsVisible = false;
    this.weatherData = null;
    this.isLoading = true;

    // ⏳ attende che Angular disegni il div della mappa
    setTimeout(() => {
      this.loadMap(city.latitude, city.longitude);
    });

    // 🌤️ chiamata API meteo
    this.weatherService.getWeatherByCoords(city.latitude, city.longitude).subscribe({
      next: (data) => {
        this.weatherData = data.current_weather;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Errore meteo:', err);
        this.isLoading = false;
      },
    });
  }

  // 🔹 Inizializzazione mappa Leaflet
  loadMap(lat: number, lon: number): void {
    if (!lat || !lon) {
      console.warn('Coordinate non valide, mappa non caricata.');
      return;
    }

    // 🔄 se esiste una mappa precedente, la rimuove
    if (this.map) {
      this.map.off();
      this.map.remove();
    }

    this.map = L.map('map', {
      center: [lat, lon],
      zoom: 11,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    L.marker([lat, lon]).addTo(this.map);

    // 🔧 fix per rendering responsivo
    setTimeout(() => this.map?.invalidateSize(), 300);
    window.addEventListener('resize', () => this.map?.invalidateSize());
  }
}
