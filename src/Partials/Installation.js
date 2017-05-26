import React, { Component } from 'react';
import object_schema from './object_schema'
import { Button, Icon, Grid } from 'semantic-ui-react'
import { PrismCode } from 'react-prism'
import copy from 'copy-to-clipboard'
export default class Installation extends Component {
  constructor(props) {
    super()
    this.state ={
      copy_icon_name: 'clipboard',
      copy_icon_text: 'Copy'
    }
  }
  copyToClipboard() {
    copy(JSON.stringify(object_schema))
    this.setState({
      copy_icon_name: 'check',
      copy_icon_color: 'green',
      copy_icon_text: 'Copied'
    })
  }
  render() {
    return (
      <div>
        <Grid columns={2}>
          <Grid.Column width={12}>
            <h2>Copy and Paste Schema into a New or Existing Object</h2>
          </Grid.Column>
          <Grid.Column width={4} style={{textAlign: 'right' }}>
            <Button style={{ position: 'relative', top: 49, right: 3  }} onClick={ this.copyToClipboard.bind(this) }><Icon color={ this.state.copy_icon_color } name={ this.state.copy_icon_name }/>&nbsp;&nbsp;{ this.state.copy_icon_text }</Button>
          </Grid.Column>
        </Grid>
        <pre style={{ maxHeight: 300 }}>
          <PrismCode className="language-json">
            { JSON.stringify(object_schema, null, 2) }
          </PrismCode>
        </pre>
      </div>
    )
  }
}