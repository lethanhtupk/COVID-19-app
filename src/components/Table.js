import React, { Component } from 'react';
import './Table.css';
import numeral from 'numeral';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';

class Table extends Component {

  state = {
    continent: 'Worldwide',
    continents: ['Worldwide', 'North America', 'Asia', 'South America', 'Europe', 'Africa', 'Australia/Oceania'],
    tableData: []
  }

  componentDidMount() {
    fetch("https://disease.sh/v3/covid-19/countries?yesterday=true&sort=cases")
      .then(res => res.json())
      .then(data => {
        this.setState({
          tableData: data
        })
      })
  }

  handleContinentChange = async (event, newValue) => {
    if (newValue !== null) {
      this.setState({
        continent: newValue
      });
      if (newValue === 'Australia/Oceania') {
        newValue = 'Australia%2FOceania'
      }
      fetch(`https://disease.sh/v3/covid-19/continents/${newValue}?yesterday=true&strict=true`)
      .then(res => res.json())
      .then(data => {
        const countries = data.countries
        const newTableData = this.props.countries.filter(country => countries.find(countryName => country.country === countryName))
        this.setState({
          tableData: newTableData
        })
      }).catch(e => console.log(e))
    } else {
      this.setState({
        continent: 'Worldwide',
        tableData: this.props.countries
      })
    }
  }
  
  render () {
    return (
      <div>
        <h3>Total Cases By Country</h3>
        <Autocomplete className="continent_box"
        options={this.state.continents}
        style={{ width: 300 }}
        value={this.state.continent}
        onChange={this.handleContinentChange}
        renderInput={(params) => <TextField {...params} label="Continent" variant="outlined" />}
        />
        <div className="table" id="rankingTable">
        <table>
          <tbody>
          <tr>
            <th>Rank</th>
            <th>Country</th>
            <th>Total Cases</th>
          </tr>
          {
            this.state.tableData.map(({country, cases}, index) => (
                <tr key={index} id={country} className={`${this.props.countryName === country && 'selected__row'}`}>
                  <td>{index+1}</td>
                  <td>{country}</td>
                  <td>{numeral(cases).format(0,0)}</td>
                </tr>
            ))
          }
          </tbody>
        </table>
        </div>
      </div>
    ) 
  }
}

export default Table;