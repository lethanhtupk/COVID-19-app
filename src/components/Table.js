import React from 'react';
import './Table.css';
import numeral from 'numeral';

function Table ({countries, countryName}) {
  return (
    <div className="table" id="rankingTable">
      <table>
        <tbody>
        <tr>
          <th>Rank</th>
          <th>Country</th>
          <th>Total Cases</th>
        </tr>
        {
          countries.map(({country, cases}, index) => (
              <tr key={index} id={country} className={`${countryName === country && 'selected__row'}`}>
                <td>{index+1}</td>
                <td>{country}</td>
                <td>{numeral(cases).format(0,0)}</td>
              </tr>
          ))
        }
        </tbody>
      </table>
    </div>
  )
}

export default Table;