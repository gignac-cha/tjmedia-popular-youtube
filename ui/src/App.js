import React from 'react';

import classnames from 'classnames';

import { AllHtmlEntities } from 'html-entities';

// import $ from 'jquery';
import _ from 'lodash';
import moment from 'moment';
import axios from 'axios';

import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Add all icons to the library so you can use it in your page
library.add(fas, far, fab);

const allHtmlEntities = new AllHtmlEntities();

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      query: {},
      lastDayOfMonthStart: -1,
      lastDayOfMonthEnd: -1,
      ranks: [],
      apiKey: '',
    };
  }
  componentDidMount() {
    this.getApiKey();
    this.getRanksCached();
  }
  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col col-3 p-0">
            <select className="form-control" name="t" value={this.state.query.t} onChange={this.onChangeQuery}>
              <option value={1}>한국</option>
              <option value={2}>외국</option>
              <option value={3}>일본</option>
            </select>
          </div>
          <div className="col col-1 p-0">
            <input className="form-control" type="number"
              min={2017} max={2019} step={1} name="sy"
              ref={e => this.sy = e} onChange={this.onChangeQuery} />
          </div>
          <div className="col col-1 p-0">
            <input className="form-control" type="number"
              min={1} max={12} step={1} name="sm"
              ref={e => this.sm = e} onChange={this.onChangeQuery} />
          </div>
          <div className="col col-1 p-0">
            <input className="form-control" type="number"
              min={1} max={this.state.lastDayOfMonthStart} step={1} name="sd"
              ref={e => this.sd = e} onChange={this.onChangeQuery} />
          </div>
          <div className="col col-1 p-0">
            <input className="form-control" type="number"
              min={2017} max={2019} step={1} name="ey"
              ref={e => this.ey = e} onChange={this.onChangeQuery} />
          </div>
          <div className="col col-1 p-0">
            <input className="form-control" type="number"
              min={1} max={12} step={1} name="em"
              ref={e => this.em = e} onChange={this.onChangeQuery} />
          </div>
          <div className="col col-1 p-0">
            <input className="form-control" type="number"
              min={1} max={this.state.lastDayOfMonthEnd} step={1} name="ed"
              ref={e => this.ed = e} onChange={this.onChangeQuery} />
          </div>
          <div className="col col-3 p-0">
            <button className="btn btn-secondary form-control" onClick={this.onClickApply}>Apply</button>
          </div>
        </div>
        <div className="row">
          <div className="col col-12 p-0">
            <table className="table table-sm table-hover table-striped">
              <thead>
                <tr>
                  <th scope="col">Rank</th>
                  <th scope="col">Number</th>
                  <th scope="col">Title</th>
                  <th scope="col">Artist</th>
                </tr>
              </thead>
              <tbody>{this.state.ranks.map(this.renderRanks)}</tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  renderRanks = (rank, i) => {
    const ellipsisStyle = { width: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
    return (
      <tr key={i}>
        <th scope="row">{rank.rank}</th>
        <td>{rank.number}</td>
        <td>
          <div style={ellipsisStyle}>
            {rank.title}
          </div>
        </td>
        <td>{rank.artist}</td>
      </tr>
    );
  }

  onChangeQuery = e => {
    const { name, value } = e.currentTarget;
    const { query } = this.state;
    query[name] = value;

    if (name === 'sm') {
      const lastDayOfMonthStart = moment({ month: value - 1 }).endOf('month').date();
      if (this.state.lastDayOfMonthStart > lastDayOfMonthStart) {
        query.sd = lastDayOfMonthStart;
        this.sd.value = lastDayOfMonthStart;
      }
      this.setState({ lastDayOfMonthStart });
    } else if (name === 'em') {
      const lastDayOfMonthEnd = moment({ month: value - 1 }).endOf('month').date();
      if (this.state.lastDayOfMonthEnd > lastDayOfMonthEnd) {
        query.ed = lastDayOfMonthEnd;
        this.ed.value = lastDayOfMonthEnd;
      }
      this.setState({ lastDayOfMonthEnd });
    }
    this.setState({ query });
  }
  onClickApply = async e => {
    this.getRanks();
  }

  getApiKey = async () => {
    const { data } = await axios.get('/api/v1/api-key');
    const { apiKey } = data;
    this.setState({ apiKey });
  }
  getRanksCached = async () => {
    const today = moment();
    const firstDayOfMonth = moment(today).date(1);
    const [ t, sy, sm, sd, ey, em, ed ] = [ 1, firstDayOfMonth.year(), firstDayOfMonth.month() + 1, firstDayOfMonth.date(), today.year(), today.month() + 1, today.date() ];
    this.sy.value = sy;
    this.sm.value = sm;
    this.sd.value = sd;
    this.ey.value = ey;
    this.em.value = em;
    this.ed.value = ed;
    const query = { t, sy, sm, sd, ey, em, ed };
    const lastDayOfMonthStart = firstDayOfMonth.endOf('month').date();
    const lastDayOfMonthEnd = firstDayOfMonth.endOf('month').date();
    this.setState({ query, lastDayOfMonthStart, lastDayOfMonthEnd });
    const params = query;
    const { data } = await axios.get('/api/v1/ranks/cached', { params });
    const { error, message, ranks } = data;
    if (error) {
      console.error(message)
    } else {
      this.setState({ ranks });
    }
  }
  getRanks = async () => {
    const { t, sy, sm, sd, ey, em, ed } = this.state.query;
    const params = { t, sy, sm, sd, ey, em, ed };
    const response = await axios.get('/api/v1/ranks', { params });
    const { data } = response;
    const { error, message, ranks } = data;
    if (error) {
      console.error(message)
    } else {
      this.setState({ ranks });
    }
  }
}

export default App;
