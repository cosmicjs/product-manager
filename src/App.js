import React, { Component } from 'react';
import { Icon, Menu, Message, Modal, Header, Button } from 'semantic-ui-react'
import _ from 'lodash'
import Cosmic from 'cosmicjs'
import { Form } from 'compounds'
import Products from './Partials/Products'
import FormArea from './Partials/Form'
import Installation from './Partials/Installation'
import config from './config'
import S from 'shorti'
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
      if (objects)
        data.products = objects.type['products']
      if (cosmic.object && cosmic.object['product-form'])
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
      return <FormArea addProduct={ this.addProduct.bind(this) } data={ data }/>
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
  addProduct(form_component, form_elements) {
    const data = this.state.data
    data.loading = true
    this.setState({ ...this.state, data })
    const title = _.find(form_elements, { key: 'name' }).value
    const object = {
      title,
      type_slug: config.submissions_slug,
      metafields: form_elements
    }
    form_component.setState({ ...form_component.state, loading: true })
    object.write_key = config.bucket.write_key
    Cosmic.addObject(config, object, (err, res) => {
      delete data.loading
      form_component.state.form_elements.forEach(form_element => {
        form_element.value = ''
      })
      data.current_tab = 'Products'
      if (!data.products)
        data.products = []
      data.products.push(res.object)
      this.setState({ ...this.state, data })
    })
  }
  editProduct() {
    const data = this.state.data
    data.loading = true
    this.setState({
      ...this.state,
      data
    })
    const object = data.current_product
    object.write_key = config.bucket.write_key
    Cosmic.editObject(config, object, (err, res) => {
      delete data.loading
      delete data.show_submission_modal
      this.setState({ data, show_submission_modal: true })
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
  deleteProduct(object) {
    const data = this.state.data
    data.loading = true
    this.setState({
      ...this.state,
      data
    })
    object.write_key = config.bucket.write_key
    Cosmic.deleteObject(config, object, (err, res) => {
      const products = data.products
      const index = _.findIndex(products, { slug: object.slug })
      delete products[index]
      data.products = products
      delete data.show_submission_modal
      delete data.loading
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
    return (
      <div style={{ padding: 15 }}>
        <h1>Product Manager</h1>
        {
          data.cosmic.object && data.cosmic.object['product-form'] && (
            <Menu tabular>
              <Menu.Item name='Products' active={data.current_tab === 'Products'} onClick={this.handleItemClick.bind(this)} />
                <Menu.Item name='Product Form' active={data.current_tab === 'Product Form'} onClick={this.handleItemClick.bind(this)} />
              </Menu>
            )
        }
        { this.getContent() }
        {
          data.cosmic.object && data.cosmic.object['product-form'] &&
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
                submit_button={ ' ' }
                onSubmit={ ' ' }
                loading={ data.loading }
              />
            </Modal.Content>
            <Modal.Actions>
              <Button style={ S('pull-left') } color='red' onClick={ this.deleteProduct.bind(this, data.current_product) }>
                Delete Product
              </Button>
              <Button primary onClick={ this.handleModalClose.bind(this) }>
                Cancel
              </Button>
              <Button color='green' onClick={ this.editProduct.bind(this) }>
                Save Product
              </Button>
            </Modal.Actions>
          </Modal>
        }
      </div>
    )
  }
}

export default App;