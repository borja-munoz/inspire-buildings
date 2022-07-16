import { DARK_MATTER } from '@carto/react-basemaps';
import { API_VERSIONS } from '@deck.gl/carto';

export const initialState = {
  viewState: {
    latitude: 37.88,
    longitude: -4.785,
    zoom: 12,
    pitch: 0,
    bearing: 0,
    dragRotate: false,
  },
  basemap: DARK_MATTER,
  credentials: {
    apiVersion: API_VERSIONS.V3,
    apiBaseUrl: 'https://gcp-us-east1.api.carto.com',
    accessToken:
      'eyJhbGciOiJIUzI1NiJ9.eyJhIjoiYWNfbHFlM3p3Z3UiLCJqdGkiOiI1YjI0OWE2ZCJ9.Y7zB30NJFzq5fPv8W5nkoH5lPXFWQP0uywDtqUg8y8c',
  },
  googleApiKey: '', // only required when using a Google Basemap
  googleMapId: '', // only required when using a Google Custom Basemap
};
