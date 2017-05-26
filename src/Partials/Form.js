import React, { Component } from 'react'
import { Icon } from 'semantic-ui-react'
import { Form } from 'compounds'
import config from '../config'
export default class FormExample extends Component {
  render() {
    config.form_slug = 'product-form'
    config.submissions_slug = 'products'
    return (
      <div style={{ maxWidth: 500 }}>
        <div style={{ textAlign: 'right' }}>
          <a target="_parent" href={`https://cosmicjs.com/${config.bucket.slug}/edit-object/${config.form_slug}`}><Icon name="pencil"/>Edit Form Fields</a>
        </div>
        <Form
          config={ config }
          onSubmit={ this.props.addProduct }
        />
      </div>
    )
  }
}