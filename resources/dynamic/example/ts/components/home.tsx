import React from 'react';
import Badges from './badges';

import { conf } from '../config/base-config';
import { Configuration } from '../config/configuration';

export default class Home extends React.Component<any, Configuration> {
  constructor(props: any) {
    super(props);
    this.state = conf;
  }

  public render() {
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
