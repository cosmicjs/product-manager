import React, { Component } from 'react';
import { Table } from 'semantic-ui-react'
import helpers from '../helpers'
export default class Products extends Component {
  getTime(created) {
    const friendly_date = helpers.friendlyDate(new Date(created))
    var friendly_date_display = friendly_date.day + 
    ', ' + friendly_date.month + 
    ' ' + friendly_date.date + 
    ', ' + friendly_date.year + 
    ' at ' + friendly_date.time_friendly;
    return friendly_date_display
  }
  render() {
    const data = this.props.data
    return (
      <Table celled striped selectable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell style={{ width: '10%' }}>Image</Table.HeaderCell>
            <Table.HeaderCell style={{ width: '20%' }}>Name</Table.HeaderCell>
            <Table.HeaderCell style={{ width: '20%' }}>Category</Table.HeaderCell>
            <Table.HeaderCell style={{ width: '10%' }}>SKU</Table.HeaderCell>
            <Table.HeaderCell style={{ width: '10%' }}>Price</Table.HeaderCell>
            <Table.HeaderCell style={{ width: '10%' }}>Count</Table.HeaderCell>
            <Table.HeaderCell style={{ width: '30%' }}>Created On</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {
            data.products &&
            data.products.map(object => {
              return (
                <Table.Row key={ object.slug }>
                  <Table.Cell style={{ cursor: 'pointer', height: 70, textAlign: 'center', minWidth: 200 }} onClick={ this.props.showSubmissionModal.bind(this, object) }>
                    {
                      object.metadata.image &&
                      <img style={{ height: 60 }} src={ object.metadata.image.url } alt="product"/>
                    }
                  </Table.Cell>
                  <Table.Cell style={{ cursor: 'pointer' }} onClick={ this.props.showSubmissionModal.bind(this, object) }>{ object.metadata.name }</Table.Cell>
                  <Table.Cell style={{ cursor: 'pointer' }} onClick={ this.props.showSubmissionModal.bind(this, object) }>{ object.metadata.category }</Table.Cell>
                  <Table.Cell style={{ cursor: 'pointer' }} onClick={ this.props.showSubmissionModal.bind(this, object) }>{ object.metadata.sku }</Table.Cell>
                  <Table.Cell style={{ cursor: 'pointer' }} onClick={ this.props.showSubmissionModal.bind(this, object) }>{ object.metadata.price }</Table.Cell>
                  <Table.Cell style={{ cursor: 'pointer' }} onClick={ this.props.showSubmissionModal.bind(this, object) }>{ object.metadata.count }</Table.Cell>
                  <Table.Cell style={{ cursor: 'pointer' }} onClick={ this.props.showSubmissionModal.bind(this, object) }>{ this.getTime(object.created) }</Table.Cell>
                </Table.Row>
              )
            })
          }
        </Table.Body>
      </Table>
    )
  }
}