import React, { Component } from 'react';
import { Icon, Menu, Message, Modal, Header, Button } from 'semantic-ui-react'
import _ from 'lodash'
import Cosmic from 'cosmicjs'
import { Form } from 'compounds'
import Products from './Partials/Products'
import FormArea from './Partials/Form'
import Installation from './Partials/Installation'
import config from './config'
class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: {}
    }
    this.getObjects()
  }
  getObjects() {
    Cosmic.getObjects(config, (err, cosmic) => {
      const data = this.state.data
      if (cosmic.error) {
        data.error = true
        this.setState({
          data
        })
        return 
      }
      data.cosmic = cosmic
      data.data_loaded = true
      data.current_tab = 'Products'
      const objects = cosmic.objects
      data.products = objects.type['products']
      if (cosmic.object['product-form'])
        data.form_elements = cosmic.object['product-form'].metafield.form_elements.children
      this.setState({
        data
      })
    })
  }
  getLoading() {
    return <div style={{ width: '100%', textAlign: 'center', paddingTop: 100 }}><Icon size='huge' color='blue' name='circle notched' loading /></div>
  }
  getError() {
    return <div style={{ width: '100%', textAlign: 'center', padding: 100 }}><Message error>There was an error with this request.  Make sure the Bucket exists and your access connections are correct.</Message></div>
  }
  handleItemClick(e, { name }) {
    const data = this.state.data
    data.current_tab = name
    this.setState({
      data
    })
  }
  getContent() {
    const data = this.state.data
    if (!data.form_elements)
      return <Installation data={ data }/>
    if (data.current_tab === 'Products') {
      return (
        <div>
          <Products showSubmissionModal={ this.showSubmissionModal.bind(this) } data={ this.state.data }/>
          <Button onClick={ this.handleItemClick.bind(this, null, { name: 'Product Form'})} primary><Icon name='plus' />Add Product</Button>
        </div>
      )
    }
    if (data.current_tab === 'Product Form')
      return <FormArea />
  }
  handleModalClose() {
    const data = this.state.data
    delete data.show_success_modal
    delete data.show_submission_modal
    this.setState({ data })
  }
  showSubmissionModal(object) {
    const data = this.state.data
    object.metadata.success_message_icon = 'pencil'
    object.metadata.success_message_title = 'Product Edited'
    object.metadata.success_message_body = 'Your product has been edited'
    data.current_product = object
    data.show_submission_modal = true
    this.setState({ data })
  }
  editProduct(form_component) {
    const data = this.state.data
    form_component.setState({
      ...form_component.state,
      loading: true
    })
    const object = data.current_product
    object.write_key = config.bucket.write_key
    Cosmic.editObject(config, object, (err, res) => {
      delete form_component.state.loading
      form_component.setState({ ...form_component.state, show_success_modal: true })
      const products = data.products
      const index = _.findIndex(products, { slug: object.slug })
      if (!object.metadata)
          object.metadata = {}
      object.metafields.forEach(metafield => {
        if (metafield.type === 'file')
          object.metadata[metafield.key] = { url: metafield.url }
        else
          object.metadata[metafield.key] = metafield.value
      })
      products[index] = object
      data.products = products
      this.setState({
        ...this.state,
        data
      })
    })
  }
  render() {
    const data = this.state.data
    if (data.error)
      return this.getError()
    if (!data.data_loaded)
      return this.getLoading()
    config.form_slug = 'product-form'
    config.submissions_slug = 'products'
    const edit_button = (
      <Button color='green' type="submit">
        <Icon name='pencil' /> Edit
      </Button>
    )
    return (
      <div style={{ padding: 15 }}>
        <h1>Product Manager</h1>
        {
          data.cosmic.object['product-form'] &&<Menu tabular>
          <Menu.Item name='Products' active={data.current_tab === 'Products'} onClick={this.handleItemClick.bind(this)} />
            <Menu.Item name='Product Form' active={data.current_tab === 'Product Form'} onClick={this.handleItemClick.bind(this)} />
          </Menu>
        }
        { this.getContent() }
        {
          data.cosmic.object['product-form'] &&
          <Modal open={ data.show_success_modal } dimmer='blurring' basic size='small' onClose={ this.handleModalClose.bind(this) }>
            <Header icon={ data.cosmic.object['product-form'].metadata.success_message_icon } content={ data.cosmic.object['product-form'].metadata.success_message_title } />
            <Modal.Content>
              <p>{ data.cosmic.object['product-form'].metadata.success_message_body }</p>
            </Modal.Content>
            <Modal.Actions>
              <Button color='green' inverted onClick={ this.props.closeModal }>
                <Icon name='checkmark' /> Ok
              </Button>
            </Modal.Actions>
          </Modal>
        }
        {
          data.current_product &&
          <Modal open={ data.show_submission_modal } size='small' onClose={ this.handleModalClose.bind(this) }>
            <Header content='Product Details' />
            <Modal.Content>
              <Form
                config={ config }
                form={ data.current_product }
                submit_button={ edit_button }
                onSubmit={ this.editProduct.bind(this) }
              />
            </Modal.Content>
            <Modal.Actions>
              <Button primary onClick={ this.handleModalClose.bind(this) }>
                Close
              </Button>
            </Modal.Actions>
          </Modal>
        }
      </div>
    )
  }
}

export default App;