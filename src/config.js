import helpers from './helpers'
export default {
  bucket: {
    slug: helpers.getParameterByName('bucket_slug'),
    read_key: helpers.getParameterByName('read_key'),
    write_key: helpers.getParameterByName('write_key')
  }
}