import Badges from './badges';
import React from 'react';

import { conf } from '../config/base-config';

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = conf;
  }

  render() {
    return (
      <div>
        <a href={this.state.githubUrl} target="_blank" className="fork-me-logo" />
        <div className="packer-container">
          <a href={this.state.githubUrl} target="_blank">
            <img src={this.state.logo} alt={this.state.title} />
          </a>
          <Badges badges={this.state.badges} />
          <p className="packer-tag-line">{this.state.tagLine}</p>
        </div>
      </div>
    );
  }
}
