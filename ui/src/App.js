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
      apiKey: '',
    };
  }
  componentDidMount() {
    this.getApiKey();
  }
  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col col-12">
          </div>
        </div>
      </div>
    );
  }

  getApiKey = async () => {
    const { data } = await axios.get('/api/v1/api-key');
    const { apiKey } = data;
    this.setState({ apiKey });
  }
}

export default App;
