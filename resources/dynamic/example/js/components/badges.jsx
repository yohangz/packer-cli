import React from 'react';

export default class Badges extends React.Component {
  render() {
    return (
      <div className="packer-badges">
        <a href={this.props.badges.buildStatus.redirectUrl} target="_blank">
          <img src={this.props.badges.buildStatus.imageUrl} alt={this.props.badges.buildStatus.title} height="18" />
        </a>
        <a href={this.props.badges.license.redirectUrl} target="_blank">
          <img src={this.props.badges.license.imageUrl} alt={this.props.badges.license.title} height="18" />
        </a>
        <a href={this.props.badges.npmVersion.redirectUrl} target="_blank">
          <img src={this.props.badges.npmVersion.imageUrl} alt={this.props.badges.npmVersion.title} height="18" />
        </a>
      </div>
    );
  }
}
