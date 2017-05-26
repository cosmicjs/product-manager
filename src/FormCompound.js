import React, { Component } from 'react'
import { Button, Checkbox, Form, Input, Radio, Select, TextArea, Modal, Header, Icon } from 'semantic-ui-react'
import { find, findIndex } from 'lodash'
import Cosmic from 'cosmicjs'
import Dropzone from 'react-dropzone'
import superagent from 'superagent'
import S from 'shorti'
export default class FormPage extends Component {
  constructor() {
    super()
    this.state = {}
  }
  componentWillMount() {
    const config = this.props.config
    if (this.props.form) {
      const form = this.props.form
      const form_elements = form.metafields
      this.setState({ form, form_elements })
      return
    }
    Cosmic.getObjects(config, (err, res) => {
      // Get form data
      const form = res.object[config.form_slug]
      const form_elements = find(form.metafields, { key: 'form_elements' }).children
      this.setState({ form, form_elements })
    })
  }
  handleSubmit(e) {
    e.preventDefault()
    const form_elements = this.state.form_elements
    if (this.props.onSubmit)
      this.props.onSubmit(this, form_elements)
    else {
      // Edit submission
      if (this.props.form && this.props.form.slug) {
        this.editSubmission(this.props.form)
        return
      }
      // Add submission
      this.addSubmission(form_elements)
    }
  }
  editSubmission(form) {
    const config = this.props.config
    const object = form
    this.setState({ ...this.state, loading: true })
    object.write_key = config.bucket.write_key
    Cosmic.editObject(config, object, (err, res) => {
      delete this.state.loading
      this.setState({ ...this.state, show_success_modal: true })
    })
  }
  addSubmission(form_elements) {
    const config = this.props.config
    const object = {
      title: 'Form Submission',
      type_slug: config.submissions_slug,
      metafields: form_elements
    }
    this.setState({ ...this.state, loading: true })
    object.write_key = config.bucket.write_key
    Cosmic.addObject(config, object, (err, res) => {
      delete this.state.loading
      this.state.form_elements.forEach(form_element => {
        form_element.value = ''
      })
      this.setState({ ...this.state, show_success_modal: true })
    })
  }
  onDrop(key, acceptedFiles, rejectedFiles) {
    const file = acceptedFiles[0]
    let form_elements = this.state.form_elements
    const index = findIndex(form_elements, { key })
    form_elements[index].url = file.preview
    this.setState({ ...this.state })
    const config = this.props.config
    const media = acceptedFiles[0]
    const _this = this
    if (config.bucket.write_key)
      superagent.field('write_key', config.bucket.write_key)
    superagent.post(`https://api.cosmicjs.com/v1/${config.bucket.slug}/media`)
      .attach('media', media)
      .end(function(err, response) {
        if (err) {
          _this.setState({ ..._this.state, upload_status: { key, status: 'error' } })
          return
        } else {
          form_elements[index].value = response.body.media.name
          _this.setState({ ..._this.state, upload_status: { key, status: 'success' } })
        }
    });
  }
  handleChange(el, e, element) {
    if (!element)
      return
    const value = element.value
    // Add values
    let form_elements = this.state.form_elements
    const index = findIndex(form_elements, { key: el.key })
    if (el.type !== 'check-boxes') {
      if (index !== -1)
        form_elements[index].value = value
    } else {
      // Add check boxes array
      if (!form_elements[index].value)
        form_elements[index].value = []
      const occurance = form_elements[index].value.indexOf(value)
      if (occurance !== -1)
        form_elements[index].value.splice(occurance, 1)
      else
        form_elements[index].value.push(value)
    }
    this.setState({
      ...this.state
    })
  }
  getElement(el) {
    if (el.type === 'text') {
      return (
        <Form.Group required={ el.required } key={ 'el-input-' + el.key } widths='equal'>
          <Form.Field required={ el.required } control={ Input } label={ el.title } placeholder={ el.title } onChange={ this.handleChange.bind(this, el) } value={ el.value }/>
        </Form.Group>
      )
    }
    if (el.type === 'textarea') {
      return (
        <Form.Group required={ el.required } key={ 'el-input-' + el.key } widths='equal'>
          <Form.Field required={ el.required } control={ TextArea } label={ el.title } placeholder={ el.title } onChange={ this.handleChange.bind(this, el) } value={ el.value }/>
        </Form.Group>
      )
    }
    if (el.type === 'check-boxes') {
      const options = el.options
      return (
        <Form.Group key={ 'el-input-' + el.key }>
          <Form.Field required={ el.required }>
            <label>{ el.title }</label>
          </Form.Field>
          { 
            options.map(option => {
              return <Form.Field key={ 'el-option-' + el.key + '-' + option.value }><Checkbox onChange={ this.handleChange.bind(this, el) } label={ option.value } value={ option.value } checked={el.value.indexOf(option.value) !== -1}/></Form.Field>
            })
          }
        </Form.Group>
      )
    }
    if (el.type === 'radio-buttons') {
      const options = el.options
      return (
        <Form.Group key={ 'el-input-' + el.key }>
          <Form.Field required={ el.required }>
            <label>{ el.title }</label>
          </Form.Field>
          { 
            options.map(option => {
              return <Form.Field key={ 'el-option-' + el.key + '-' + option.value }><Radio onChange={ this.handleChange.bind(this, el) } label={ option.value } value={ option.value } checked={el.value === option.value}/></Form.Field>
            })
          }
        </Form.Group>
      )
    }
    if (el.type === 'select-dropdown') {
      const options = el.options.map(option => {
        return {
          ...option,
          text: option.value
        }
      })
      return (
        <Form.Group key={ 'el-input-' + el.key }>
          <Form.Field required={ el.required }>
            <label>{ el.title }</label>
            <Select onChange={ this.handleChange.bind(this, el) } placeholder={ el.title } options={options} />
          </Form.Field>
        </Form.Group>
      )
    }
    if (el.type === 'file') {
      let style
      if (el.value && el.url)
        style = S(`bg-cover bg-center bg-url(${el.url}) w-100p h-100p absolute`)
      return (
        <Form.Group key={ 'el-input-' + el.key }>
          <Form.Field required={ el.required }>
            <label>{ el.title }</label>
            <Dropzone onDrop={this.onDrop.bind(this, el.key)} multiple={false} style={ S('w-200 h-200 border-2-dashed-666 relative') }>
              <div style={ style }>
                <p style={{ textAlign: 'center', marginTop: 80 }}><Button type='button'>Upload</Button></p>
              </div>
            </Dropzone>
          </Form.Field>
        </Form.Group>
      )
    }
  }
  closeModal() {
    delete this.state.show_success_modal
    this.setState({
      ...this.state
    })
  }
  render() {
    const semantic_props = { ...this.props }
    delete semantic_props.config
    delete semantic_props.addSubmission
    delete semantic_props.submit_button
    const form = this.state.form
    const form_elements = this.state.form_elements
    const loader_style = { marginTop: 20, textAlign: 'center', width: '100%' }
    if (!form)
      return (
        <div style={loader_style}>
          <Icon size='huge' color='blue' name='circle notched' loading />
        </div>
      )
    return (
      <div>
        <Form { ...semantic_props }
          onChange={ this.props && this.props.onChange ? this.props.onChange : this.handleChange.bind(this) }
          onSubmit={ this.handleSubmit.bind(this) }
          loading={ this.props && this.props.loading ? this.props.loading : this.state.loading }>
          { 
            form_elements.map(el => this.getElement(el))
          }
          { 
            this.props.submit_button &&
            this.props.submit_button
           }
           {
            !this.props.submit_button &&
            <Button type="submit">{ form.metadata.submit_button_text }</Button>
           }
        </Form>
        <Modal open={ this.state.show_success_modal } dimmer='blurring' basic size='small' onClose={ this.closeModal.bind(this) }>
          <Header icon={ form.metadata.success_message_icon } content={ form.metadata.success_message_title } />
          <Modal.Content>
            <p>{ form.metadata.success_message_body }</p>
          </Modal.Content>
          <Modal.Actions>
            <Button color='green' inverted onClick={ this.closeModal.bind(this) }>
              <Icon name='checkmark' /> Ok
            </Button>
          </Modal.Actions>
        </Modal>
      </div>
    )
  }
}