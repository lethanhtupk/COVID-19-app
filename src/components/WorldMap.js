import React from 'react'
import { Map, TileLayer } from 'react-leaflet';
import './Map.css';
import {showDataOnMap} from '../util'

function WorldMap (props) {
  return (
    <Map center={props.center} zoom={props.zoom} dragging="false">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      {showDataOnMap(props.countries, props.casesType)}
    </Map>
  )
}

export default WorldMap;