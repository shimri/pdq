import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLoggerService } from '../common/app-logger.service';

interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

@Injectable()
export class GeocodingService {
  private readonly apiKey: string;
  private readonly geocodingApiUrl = 'https://maps.googleapis.com/maps/api/geocode/json';

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLoggerService,
  ) {
    this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY') || '';
  }

  async geocodeAddress(
    streetAddress: string,
    city: string,
    state: string,
    postalCode: string,
    country: string,
  ): Promise<GeocodingResult | null> {
    if (!this.apiKey) {
      this.logger.warn(
        'GOOGLE_MAPS_API_KEY is not configured. Geocoding will be skipped.',
        'GeocodingService',
      );
      return null;
    }

    // Use city + country to minimize over-specific queries and avoid partial data issues
    const addressParts = [city?.trim(), country?.trim()].filter(Boolean);
    if (addressParts.length === 0) {
      this.logger.warn('Geocoding skipped because city/country are missing.', 'GeocodingService');
      return null;
    }
    const address = addressParts.join(', ');

    try {
      const url = new URL(this.geocodingApiUrl);
      url.searchParams.append('address', address);
      url.searchParams.append('key', this.apiKey);

      this.logger.log(
        `Geocoding address: ${address}`,
        'GeocodingService',
      );

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Google Maps API returned status ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0];
        const location = result.geometry.location;

        const geocodingResult: GeocodingResult = {
          latitude: location.lat,
          longitude: location.lng,
          formattedAddress: result.formatted_address,
        };

        this.logger.logWithData(
          `Geocoding successful: lat=${geocodingResult.latitude}, lng=${geocodingResult.longitude}`,
          {
            address,
            latitude: geocodingResult.latitude,
            longitude: geocodingResult.longitude,
            formattedAddress: geocodingResult.formattedAddress,
          },
          'GeocodingService',
        );

        return geocodingResult;
      } else {
        // Handle different API status codes
        const errorMessage = `Google Maps Geocoding API returned status: ${data.status}`;
        this.logger.warn(
          `${errorMessage} for address: ${address}`,
          'GeocodingService',
        );
        return null;
      }
    } catch (error) {
      this.logger.error(
        `Geocoding failed for address: ${address}, error: ${error.message}`,
        error.stack,
        'GeocodingService',
      );
      return null;
    }
  }
}

