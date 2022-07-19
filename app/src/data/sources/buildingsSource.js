import { MAP_TYPES } from '@deck.gl/carto';

const BUILDINGS_SOURCE_ID = 'buildingsSource';

const source = {
  id: BUILDINGS_SOURCE_ID,
  type: MAP_TYPES.TILESET,
  connection: 'bqconn',
  data: `cartodb-on-gcp-pm-team.inspire_buildings.buildings_tileset`,
};

export default source;
