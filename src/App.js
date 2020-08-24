import React, { Component } from 'react';
import numeral from 'numeral';
import './App.css';
import {
  CardContent,
  Card,
  TextField
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import InfoBox from './components/infoBox';
import WorldMap from './components/WorldMap';
import LineGraph from './containers/LineGraph';
import Table from './components/Table';
import { prettyPrintStat } from './util';
import 'leaflet/dist/leaflet.css';

class App extends Component {

  state = {
    countries: [],
    country: 'Worldwide',
    updated: '',
    countryInfo: {},
    tableData: [],
    center: {
      lat: 14.0583, 
      lng: 108.2772
    },
    zoom: 3,
    mapCountries: [],
    casesType: 'cases'
  }

  casesTypeDepend = {
    cases: {
      label: "Corona Virus New Cases",
      color: 'red'
    },
    recovered: {
      label: "Corona Virus New Recovered Cases",
      color: 'green'
    },
    deaths: {
      label: "Corona Virus New Death Cases",
      color: 'red'
    }
  }

  componentDidMount() {
    Promise.all([
      fetch("https://disease.sh/v3/covid-19/countries?yesterday=true&sort=cases"),
      fetch("https://disease.sh/v3/covid-19/all?yesterday=true")
    ])
    .then(([res1, res2]) => (
      Promise.all([res1.json(), res2.json()])
    ))
    .then((data => {
      const countries = data[0].map(country => country.country);
      countries.unshift('Worldwide');
      const tableData = data[0];
      this.setState({
        countries: countries,
        countryInfo: data[1],
        updated: data[1].updated,
        tableData: tableData,
        mapCountries: data[0],
      });
    }))
    .catch(e => {
      console.log(e)
    });
  }

  onChangeCasesType = (casesType) => {
    this.setState({
      casesType: casesType
    })
  }

  default_coordinates = {
    lat: 14.0583, 
    lng: 108.2772
  }

  getCoordinates = (countryName, countryInfo) => {
    if (countryName === 'Worldwide') {
      return this.default_coordinates
    } else {
      return {
        lat: countryInfo.lat,
        lng: countryInfo.long
      }
    }
  }

  handleUpdatedTime = (time) => {
    const date_obj = new Date(time);
    date_obj.setDate(date_obj.getDate() -1);
    const date_update = new Date(time).toLocaleDateString('pt-BR');
    const time_update = new Date(time).toLocaleTimeString('en-US');
    const date_info = date_obj.toLocaleDateString('pt-BR');
    const update =  time_update + " - " + date_update;
    return {
      update: update, 
      info: date_info
    }
  }

  searchByCountry =  async (countryName) => {
    const url = countryName === 'Worldwide' ? 
        'https://disease.sh/v3/covid-19/all?yesterday=true' :
        `https://disease.sh/v3/covid-19/countries/${countryName}?yesterday=true`;
      
      await fetch(url)
      .then(res => res.json())
      .then(data =>{
        this.setState({
          countryInfo: data,
          updated: data.updated,
          center: this.getCoordinates(countryName, data.countryInfo),
          zoom: 4
        });
      }).catch(e => console.log(e));
  }

  onChangeCountry = async (event, newValue) => {
    if (newValue !== null) {
      await this.setState({
        country: newValue
      });
      await this.searchByCountry(this.state.country);
      const elm = document.getElementById(this.state.country);
      if(elm !== null) {
        elm.scrollIntoView(true);
      }
    }
  };

  render () {
    const casesType = this.state.casesType;
    return (
      <div className="app">

        <div className="app__left">

          <div className="app_header">

            <h1>
              COVID-19 Tracker
              <p className="update_time">Số liệu ngày   : {this.handleUpdatedTime(this.state.updated).info}</p>
              <p className="update_time">Update lần cuối: {this.handleUpdatedTime(this.state.updated).update}</p>
            </h1>

            
            <Autocomplete
              className="search_bar"
              value={this.state.country}
              onChange={this.onChangeCountry}
              options={this.state.countries}
              style={{ width: 300 }}
              renderInput={(params) => <TextField {...params} label="Country" variant="outlined"/>}
            />
  

          </div>
          
          <div className="app__stats">
            <InfoBox 
              active={this.state.casesType === 'cases'}
              title="Corona virus Cases" 
              casesType="cases"
              isRed
              cases={prettyPrintStat(this.state.countryInfo.todayCases)} 
              total={numeral(this.state.countryInfo.cases).format(0,0)}
              onClick={this.onChangeCasesType} />
              <InfoBox
              title="Recovered"
              active={this.state.casesType === 'recovered'}
              casesType="recovered" 
              cases={prettyPrintStat(this.state.countryInfo.todayRecovered)} 
              total={numeral(this.state.countryInfo.recovered).format(0,0)}
              onClick={this.onChangeCasesType} />
            <InfoBox
              isRed
              title="Deaths" 
              active={this.state.casesType === 'deaths'}
              casesType="deaths"
              cases={prettyPrintStat(this.state.countryInfo.todayDeaths)} 
              total={numeral(this.state.countryInfo.deaths).format(0,0)}
              onClick={this.onChangeCasesType} />
          </div>

          <WorldMap 
            center={this.state.center} 
            zoom={this.state.zoom} 
            countries={this.state.mapCountries}
            casesType={this.state.casesType}/>
        </div>

        <Card className="app__right">
          <CardContent>
            <Table countries={this.state.tableData} countryName={this.state.country} /> 
            <h3>{this.casesTypeDepend[casesType].label}</h3>
            <LineGraph 
              casesType={casesType}
              typeChart={this.casesTypeDepend[casesType]} />
          </CardContent>
        </Card>
        
      </div>
    );
  }
}

export default App;
