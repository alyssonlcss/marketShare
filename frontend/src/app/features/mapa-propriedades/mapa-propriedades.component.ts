import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { PropriedadeRural } from '../../core/models/propriedade-rural.model';

type MarkerInfo = {
  position: google.maps.LatLngLiteral;
  title: string;
};

@Component({
  selector: 'app-mapa-propriedades',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './mapa-propriedades.component.html',
  styleUrl: './mapa-propriedades.component.scss',
})
export class MapaPropriedadesComponent implements OnChanges {
  @Input() propriedades: PropriedadeRural[] = [];

  center: google.maps.LatLngLiteral = { lat: -15.7797, lng: -47.9297 }; // Brasilia default
  zoom = 4;
  markers: MarkerInfo[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if ('propriedades' in changes) {
      this.updateMarkers();
    }
  }

  private updateMarkers(): void {
    const validProps = this.propriedades.filter(
      (p) => typeof p.latitude === 'number' && typeof p.longitude === 'number',
    );

    this.markers = validProps.map((p) => ({
      position: { lat: p.latitude, lng: p.longitude },
      title: `${p.cultura} - ${p.cidade}/${p.uf}`,
    }));

    if (validProps.length > 0) {
      const latSum = validProps.reduce((sum, p) => sum + p.latitude, 0);
      const lngSum = validProps.reduce((sum, p) => sum + p.longitude, 0);
      this.center = {
        lat: latSum / validProps.length,
        lng: lngSum / validProps.length,
      };
      this.zoom = 6;
    }
  }
}
