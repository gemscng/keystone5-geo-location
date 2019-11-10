import React, { Component } from 'react';

import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import { Input } from '@arch-ui/input';
import { CheckboxPrimitive } from '@arch-ui/controls';
import { Button } from '@arch-ui/button';
import { LocationIcon } from '@arch-ui/icons';
import GoogleMapReact from 'google-map-react';
import debounce from 'lodash.debounce';

type MakerProps = {
  lat: number,
  lng: number
}
class Maker extends Component<MakerProps> {
  render = () => <LocationIcon />;
}
type OwnProps = {
  autoFocus: boolean,
  field: any,
  value: any,
  errors: any,
  onChange(value: any): void
}
type OwnStates = {
  displayMap: boolean
}
export default class TextField extends Component<OwnProps, OwnStates> {
  constructor(props) {
    super(props);
    const { field } = this.props;
    this.state = {
      displayMap: field.config.showMap,
    };
  }

  onSubFieldChange = type => event => {
    const value = event.target.value;
    const { value: location } = this.props;
    this.props.onChange(Object.assign({}, location, { [type]: parseFloat(value) }));
  };

  setCurrentGeoLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(({ coords: { latitude: lat, longitude: lng } }) => {
        this.props.onChange({
          lat,
          lng,
        });
      });
    } else {
      alert('Browser does not support location fetching');
    }
  };

  valueToString = value => {
    // Make the value a string to prevent loss of accuracy and precision.
    if (typeof value === 'string') {
      return value;
    } else if (typeof value === 'number') {
      return String(value);
    } else {
      // If it is neither string nor number then it must be empty.
      return '';
    }
  };

  onDisplayMapChange = event => {
    this.setState({
      displayMap: event.target.checked,
    });
  };

  onMapClick = debounce(
    ({ lat, lng }) => {
      const location = { lat, lng };
      this.props.onChange(Object.assign({}, location));
    },
    400,
    { leading: false, trailing: true }
  );

  render() {
    const { autoFocus, field, value = {}, errors } = this.props;
    const { defaultCenter, defaultZoom, googleApiKey } = field.config;
    const { lng, lat } = value || defaultCenter;
    const { displayMap } = this.state;
    const htmlID = `ks-input-${field.path}`;
    const mapComponent = (
      <div style={{ height: '300px', width: '100%' }}>
        <GoogleMapReact
          bootstrapURLKeys={{
            key: googleApiKey,
            language: 'en',
            region: 'en',
          }}
          defaultCenter={defaultCenter}
          center={value}
          defaultZoom={defaultZoom}
          onClick={this.onMapClick}
        >
          {lat && lng && <Maker lat={lat} lng={lng} />}
        </GoogleMapReact>
      </div>
    );
    return (
      <FieldContainer>
        <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
        <FieldInput>
          <label style={{ lineHeight: '2.2em' }}>Latitude </label>
          <Input
            autoComplete="off"
            autoFocus={autoFocus}
            type="number"
            min="-90.0"
            max="90.0"
            step="any"
            value={this.valueToString(lat)}
            onChange={this.onSubFieldChange('lat')}
            id={`${htmlID}['lat']`}
            placeholder={'Latitude'}
          />
          <label style={{ lineHeight: '2.2em' }}>Longitude </label>
          <Input
            autoComplete="off"
            autoFocus={false}
            type="number"
            min="-180.0"
            max="180.0"
            step="any"
            value={this.valueToString(lng)}
            onChange={this.onSubFieldChange('lng')}
            id={`${htmlID}['lng']`}
            placeholder={'Longitude'}
          />
        </FieldInput>

        <CheckboxPrimitive checked={displayMap} onChange={this.onDisplayMapChange}>
          Show Map?
        </CheckboxPrimitive>

        {displayMap && mapComponent}
        <Button onClick={this.setCurrentGeoLocation} variant="ghost">
          Set to current location
        </Button>
      </FieldContainer>
    );
  }
}
