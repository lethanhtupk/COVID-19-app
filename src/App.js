import React, { Component } from 'react';
import numeral from 'numeral';
import './App.css';
import {
  FormControl,
  Select,
  MenuItem,
  CardContent,
  Card,
} from '@material-ui/core'
import InfoBox from './components/infoBox';
import WorldMap from './components/WorldMap';
import LineGraph from './containers/LineGraph';
import Table from './components/Table';
import {sortData, prettyPrintStat} from './util';
import 'leaflet/dist/leaflet.css';

class App extends Component {

  state = {
    country: "worldwide",
    countries: [],
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
      fetch("https://disease.sh/v3/covid-19/countries"),
      fetch("https://disease.sh/v3/covid-19/all")
    ])
    .then(([res1, res2]) => (
      Promise.all([res1.json(), res2.json()])
    ))
    .then((data => {
      const countries = data[0].map(country => ({
        name: country.country,
        value: country.countryInfo.iso3,
        id: country.countryInfo._id
      }));
      const tableData = sortData(data[0]);
      this.setState({
        countries: countries,
        countryInfo: data[1],
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
    console.log("casesType is changed to: ", casesType);
  }

  default_coordinates = {
    lat: 14.0583, 
    lng: 108.2772
  }

  getCoordinates = (countryCode, countryInfo) => {
    if (countryCode === 'worldwide') {
      return this.default_coordinates
    } else {
      return {
        lat: countryInfo.lat,
        lng: countryInfo.long
      }
    }
  }

  onCountryChange = async (event) => {
    const countryCode = event.target.value;
    const url = countryCode === 'worldwide' ? 
      'https://disease.sh/v3/covid-19/all' :
      `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    
    
    await fetch(url)
    .then(res => res.json())
    .then(data =>{
      this.setState({
        country: countryCode,
        countryInfo: data,
        center: this.getCoordinates(countryCode, data.countryInfo),
        zoom: 5
      });
    })
    
  };

  render () {
    const countries = this.state.countries;
    const casesType = this.state.casesType;
    return (
      <div className="app">

        <div className="app__left">

          <div className="app_header">
            <h1>COVID-19 Tracker</h1>
            <FormControl className="app__dropdown">
              <Select variant="outlined" onChange={this.onCountryChange} value={this.state.country}>
                <MenuItem value="worldwide">WorldWide</MenuItem>
                  {
                    countries.map(country => (
                      <MenuItem
                        value={country.value} 
                        key={country.id}>
                        {country.name}
                      </MenuItem>
                    ))
                  }
              </Select>
            </FormControl>
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
            <h3>Total Cases By Country</h3>
            <Table countries={this.state.tableData} /> 
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
