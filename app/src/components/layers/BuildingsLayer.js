import { useSelector } from 'react-redux';
import { CartoLayer } from '@deck.gl/carto';
import { selectSourceById } from '@carto/react-redux';
import { useCartoLayerProps } from '@carto/react-api';
import htmlForFeature from 'utils/htmlForFeature';

export const BUILDINGS_LAYER_ID = 'buildingsLayer';

export default function BuildingsLayer() {
  const { buildingsLayer } = useSelector((state) => state.carto.layers);
  const source = useSelector((state) => selectSourceById(state, buildingsLayer?.source));
  const cartoLayerProps = useCartoLayerProps({ source });
  const currentThematicMap = useSelector((state) => state.app.currentThematicMap);

  if (buildingsLayer && source) {
    return new CartoLayer({
      ...cartoLayerProps,
      id: BUILDINGS_LAYER_ID,
      extruded: true,
      getFillColor: (d) => {
        if (currentThematicMap === 'construction-date') {
          if (d.properties.construction_date < '1900-01-01') {
            return [158, 1, 66];
          } else if (d.properties.construction_date < '1920-01-01') {
            return [213, 62, 79];
          } else if (d.properties.construction_date < '1940-01-01') {
            return [244, 109, 67];
          } else if (d.properties.construction_date < '1950-01-01') {
            return [253, 174, 97];
          } else if (d.properties.construction_date < '1960-01-01') {
            return [254, 224, 139];
          } else if (d.properties.construction_date < '1970-01-01') {
            return [255, 255, 191];
          } else if (d.properties.construction_date < '1980-01-01') {
            return [230, 245, 152];
          } else if (d.properties.construction_date < '1990-01-01') {
            return [171, 221, 164];
          } else if (d.properties.construction_date < '2000-01-01') {
            return [102, 194, 165];
          } else if (d.properties.construction_date < '2010-01-01') {
            return [50, 136, 189];
          } else {
            return [94, 79, 162];
          }
        } else {
          // return colorCategories({
          //   attr: 'current_use',
          //   domain: [
          //     '1_residential',
          //     '2_agriculture',
          //     '3_industrial',
          //     '4_1_office',
          //     '4_2_retail',
          //     '4_3_publicServices',
          //   ],
          //   colors: 'Bold',
          //   othersColor: [200, 200, 200]
          // });
          if (d.properties.current_use === '1_residential') {
            return [57, 105, 172];
          } else if (d.properties.current_use === '2_agriculture') {
            return [17, 165, 121];
          } else if (d.properties.current_use === '3_industrial') {
            return [127, 60, 141];
          } else if (d.properties.current_use === '4_1_office') {
            return [242, 183, 1];
          } else if (d.properties.current_use === '4_2_retail') {
            return [231, 63, 116];
          } else if (d.properties.current_use === '4_3_publicServices') {
            return [128, 186, 90];
          } else {
            return [0, 134, 149];
          }
        }
      },
      pickable: true,
      updateTriggers: {
        getFillColor: [currentThematicMap],
        ...cartoLayerProps.updateTriggers,
      },
      getElevation: (d) => {
        return d.properties.number_floors_above_ground * 3;
      },
      onHover: (info) => {
        if (info?.object) {
          info.object = {
            html: htmlForFeature({ feature: info.object }),
            style: {},
          };
        }
      },
    });
  }
}
