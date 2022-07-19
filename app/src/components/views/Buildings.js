import { useEffect, useState } from 'react';
import buildingsSource from 'data/sources/buildingsSource';
import { BUILDINGS_LAYER_ID } from 'components/layers/BuildingsLayer';
import { useDispatch } from 'react-redux';
import { addLayer, removeLayer, addSource, removeSource } from '@carto/react-redux';

import { makeStyles } from '@material-ui/core/styles';
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
} from '@material-ui/core';

import { setCurrentView } from 'store/appSlice';

const useStyles = makeStyles(() => ({
  buildings: {
    margin: '15px',
  },
}));

export default function Buildings() {
  const dispatch = useDispatch();
  const classes = useStyles();
  const [formValue, setFormValue] = useState('construction-date');

  useEffect(() => {s
    dispatch(addSource(buildingsSource));

    dispatch(
      addLayer({
        id: BUILDINGS_LAYER_ID,
        source: buildingsSource.id,
      })
    );

    return () => {
      dispatch(removeLayer(BUILDINGS_LAYER_ID));
      dispatch(removeSource(buildingsSource.id));
    };
  }, [dispatch]);

  // [hygen] Add useEffect

  const handleChange = (event) => {
    setFormValue(event.target.value);
    dispatch(setCurrentView(event.target.value));
  };

  return (
    <Grid container direction='column' className={classes.buildings}>
      <Grid item>
        <FormControl component='fieldset'>
          <FormLabel component='legend'>Thematic Map</FormLabel>
          <RadioGroup
            aria-label='visualization'
            name='visualization'
            value={formValue}
            onChange={handleChange}
          >
            <FormControlLabel
              value='construction-date'
              control={<Radio />}
              label='Construction Date'
            />
            <FormControlLabel
              value='current-use'
              control={<Radio />}
              label='Current Use'
            />
          </RadioGroup>
        </FormControl>
      </Grid>
    </Grid>
  );
}
