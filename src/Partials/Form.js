import React, { Component } from 'react'
import { Icon } from 'semantic-ui-react'
import { Form } from 'compounds'
import config from '../config'
import _ from 'lodash'
export default class FormExample extends Component {
  render() {
    config.form_slug = 'product-form'
    config.submissions_slug = 'products'
    const product_form = _.find(this.props.data.cosmic.objects.all, { slug: 'product-form' })
    return (
      <div style={{ maxWidth: 500 }}>
        <div style={{ textAlign: 'right' }}>
          <a target="_parent" href={`https://app.cosmicjs.com/${config.bucket.slug}/edit-object/${product_form ? product_form._id : '' }`}><Icon name="pencil"/>Edit Form Fields</a>
        </div>
        <Form
          config={ config }
          onSubmit={ this.props.addProduct }
        />
      </div>
    )
  }
}