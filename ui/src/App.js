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
          <div className="col col-2 p-0">
            <select className="form-control" name="t" value={this.state.query.t} onChange={this.onChangeQuery}>
              <option value={1}>한국</option>
              <option value={2}>외국</option>
              <option value={3}>일본</option>
            </select>
          </div>
          <div className="col col-2 p-0">
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
          <div className="col col-2 p-0">
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
          <div className="col col-2 p-0">
            <button className="btn btn-secondary form-control" onClick={this.onClickApply}>Apply</button>
          </div>
        </div>
        <div className="row">
          <div className="col col-12 p-0">
            <table className="table table-sm table-hover table-striped table-responsive-sm">
              <thead>
                <tr>
                  <th scope="col" className="pt-0 pb-0">Rank</th>
                  <th scope="col" className="pt-0 pb-0">Number</th>
                  <th scope="col" className="pt-0 pb-0">Title</th>
                  <th scope="col" className="pt-0 pb-0">Artist</th>
                  <th scope="col" className="pt-0 pb-0">Youtube</th>
                  <th scope="col" className="pt-0 pb-0">Audio</th>
                </tr>
              </thead>
              <tbody>{this.state.ranks.map(this.renderRanks)}</tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  renderBefore = rank => {
    const { youtube } = rank;
    const { before } = youtube;
    if (before) {
      const ellipsisStyle = { display: 'inline-block', width: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
      return (
        <div className="text-left">
          <button className="btn btn-link p-0" onClick={e => this.onClickBeforeAfter(rank, before)}>
            <FontAwesomeIcon icon={fas.faAngleDoubleLeft} size={'2x'} />
            <div className="text-left" style={ellipsisStyle}> {allHtmlEntities.decode(before.title)}</div>
          </button>
        </div>
      );
    }
  }
  renderAfter = rank => {
    const { youtube } = rank;
    const { after } = youtube;
    if (after) {
      const ellipsisStyle = { display: 'inline-block', width: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
      return (
        <div className="text-right">
          <button className="btn btn-link p-0" onClick={e => this.onClickBeforeAfter(rank, after)}>
            <div className="text-right" style={ellipsisStyle}>{allHtmlEntities.decode(after.title)} </div>
            <FontAwesomeIcon icon={fas.faAngleDoubleRight} size={'2x'} />
          </button>
        </div>
      );
    }
  }
  renderYoutube = rank => {
    const { youtube } = rank;
    if (youtube && youtube.videoId) {
      return (
        <div>
          <iframe src={`https://www.youtube.com/embed/${youtube.videoId}`} title={youtube.title} width={640} height={360} frameBorder={0} allowFullScreen={true}></iframe>
          {this.renderBefore(rank)}
          {this.renderAfter(rank)}
        </div>
      );
    }
    return (
      <summary onClick={e => this.onClickYoutube(rank)}
        onMouseEnter={e => this.onMouseEnterYoutube(rank)} onMouseLeave={e => this.onMouseLeaveYoutube(rank)}>
        <FontAwesomeIcon icon={fab.faYoutube} color={rank.youtubeMouseOver ? 'red' : ''} />
      </summary>
    );
  }
  renderAudio = rank => {
    const { audio, youtube } = rank;
    if (audio) {
      return (
        <audio src={audio} loop={true} controls={true}>
          Your browser does not support the <code>audio</code> element.
        </audio>
      );
    } else if (rank.audioRequesting) {
      return <div><FontAwesomeIcon icon={fas.faSyncAlt} color={'orange'} spin={true} size={'4x'} /></div>;
    } else if (youtube && youtube.videoId) {
      return <summary onClick={e => this.onClickAudio(rank)}><FontAwesomeIcon icon={fas.faMusic} color={'blue'} size={'4x'} /></summary>;
    } else {
      return <div><FontAwesomeIcon icon={fas.faMusic} color={'gray'} /></div>;
    }
  }
  renderRanks = (rank, i) => {
    const ellipsisStyle = { width: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
    return (
      <tr key={i}>
        <th scope="row" className="pt-0 pb-0">{rank.rank}</th>
        <td className="pt-0 pb-0">{rank.number}</td>
        <td className="pt-0 pb-0">
          <div style={ellipsisStyle}>
            {rank.title}
          </div>
        </td>
        <td className="pt-0 pb-0">{rank.artist}</td>
        <td className={classnames('pt-0', 'pb-0', { 'p-0': rank.youtube && rank.youtube.videoId })}>{this.renderYoutube(rank)}</td>
        <td className={classnames('pt-0', 'pb-0', { 'p-0': rank.audio })}>{this.renderAudio(rank)}</td>
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
  onMouseEnterYoutube = rank => {
    rank.youtubeMouseOver = true;

    const { ranks } = this.state;
    this.setState({ ranks });
  }
  onMouseLeaveYoutube = rank => {
    rank.youtubeMouseOver = false;

    const { ranks } = this.state;
    this.setState({ ranks });
  }
  onClickYoutube = async rank => {
    const youtube = await this.getYoutubeCached(rank);
    rank.youtube = youtube;

    const list = await this.getYoutube(rank);
    youtube.list = list;

    if (youtube.videoId) {
      const index = _.findIndex(list, item => item.videoId === youtube.videoId);
      youtube.title = list[index].title;
      youtube.before = index > 0 ? list[index - 1] : null;
      youtube.after = index < list.length - 1 ? list[index + 1] : null;
    } else {
      const { videoId, title } = _.first(list);
      youtube.videoId = videoId;
      youtube.title = title;
      youtube.before = null;
      youtube.after = list[1];
    }
    this.setYoutube(rank, youtube);

    const { ranks } = this.state;
    this.setState({ ranks });
  }
  onClickBeforeAfter = (rank, selected) => {
    const { youtube } = rank;
    const { list } = youtube;
    const index = _.findIndex(list, item => item.videoId === selected.videoId);
    const { videoId, title } = list[index];
    youtube.videoId = videoId;
    youtube.title = title;
    youtube.before = index > 0 ? list[index - 1] : null;
    youtube.after = index < list.length - 1 ? list[index + 1] : null;
    this.setYoutube(rank, youtube);

    const { ranks } = this.state;
    this.setState({ ranks });
  }
  onClickAudio = rank => {
    this.getAudio(rank);
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
    const params = { sy, sm, sd, ey, em, ed };
    const { data } = await axios.get(`/api/v1/ranks/${t}/cached`, { params });
    const { error, message, ranks } = data;
    if (error) {
      console.error(message)
    } else {
      this.setState({ ranks });
    }
  }
  getRanks = async () => {
    const { t, sy, sm, sd, ey, em, ed } = this.state.query;
    const params = { sy, sm, sd, ey, em, ed };
    const response = await axios.get(`/api/v1/ranks/${t}`, { params });
    const { data } = response;
    const { error, message, ranks } = data;
    if (error) {
      console.error(message)
    } else {
      this.setState({ ranks });
    }
  }
  getYoutubeCached = async rank => {
    const { number } = rank;
    const { data } = await axios.get(`/api/v1/youtube/${number}/cached`);
    const { error, message, youtube } = data;
    if (error) {
      console.error(message)
      return {};
    } else {
      return youtube;
    }
  }
  getYoutube = async rank => {
    const { title, artist } = rank;
    const q = _.join([ title, artist ], ' - ');
    const part = 'id,snippet';
    const maxResults = 10;
    const key = this.state.apiKey;
    const params = { q, part, maxResults, key };
    const { data } = await axios.get('https://www.googleapis.com/youtube/v3/search', { params });
    const { items } = data;
    const list = _.map(items, item => ({ videoId: item.id.videoId, title: item.snippet.title }));
    return list;
  }
  setYoutube = async (rank, youtube) => {
    const { number, title, artist } = rank;
    const data = { youtube };
    await axios.post(`/api/v1/youtube/${number}`, data);
  }
  getAudio = async rank => {
    rank.audioRequesting = true;
    let { ranks } = this.state;
    this.setState({ ranks });

    const { youtube } = rank;
    const { videoId } = youtube;
    await axios.post(`/api/v1/audio/${videoId}`);

    const audio = `/audio/${videoId}`;
    rank.audio = audio;
    rank.audioRequesting = false;
    ({ ranks } = this.state);
    this.setState({ ranks });
  }
}

export default App;
