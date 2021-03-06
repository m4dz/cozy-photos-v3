/**
  Photos related features
**/

import cozy from 'cozy-client-js'

import {
  COZY_PHOTOS_DIR_ID
} from '../constants/config'

import {
  FETCH_PHOTOS,
  FETCH_PHOTOS_FAILURE,
  RECEIVE_PHOTOS,
  UPLOAD_PHOTOS,
  UPLOAD_PHOTOS_SUCCESS,
  UPLOAD_PHOTOS_SUCCESS_WITH_CONFLICTS,
  UPLOAD_PHOTOS_FAILURE
} from '../constants/actionTypes'

import Alerter from '../components/Alerter'

// used after photo upload (for photo format from response)
export const extractFileAttributes = f => Object.assign({}, f.attributes, { _id: f._id })

// fetch images using the index created by the app
export const fetchPhotos = (mangoIndexByDate) => {
  return async dispatch => {
    dispatch({ type: FETCH_PHOTOS, mangoIndexByDate })
    const options = {
      selector: {
        class: 'image'
      },
      fields: ['_id', 'created_at', 'name', 'size', 'updated_at'],
      descending: true
    }
    await cozy.query(mangoIndexByDate, options)
    .then((photos) => {
      dispatch({
        type: RECEIVE_PHOTOS,
        photos
      })
    })
    .catch((error) => {
      Alerter.error('Alerter.photos.fetching_error')
      return dispatch({
        type: FETCH_PHOTOS_FAILURE,
        error
      })
    })
  }
}

// Upload one or many photos
export const uploadPhotos = (photosArray, dirID = COZY_PHOTOS_DIR_ID) => {
  return async (dispatch) => {
    dispatch({ type: UPLOAD_PHOTOS })
    let photos = []
    let nameConflicts = []
    let errors = []
    await Promise.all(photosArray.map(async photo => {
      await cozy.files.create(
        photo,
        { dirID }
      )
      .then((photo) => {
        photos.push(extractFileAttributes(photo))
      })
      .catch((error) => {
        if (error.status === 409) {
          nameConflicts.push({
            url: error.url,
            detail: error.reason.errors[0]
          })
        } else {
          errors.push(error)
        }
      })
    }))
    .then(() => {
      if (!nameConflicts.length && !errors.length) {
        Alerter.success(
          'Alerter.photos.upload_success',
          {smart_count: photos.length}
        )
        dispatch({
          type: UPLOAD_PHOTOS_SUCCESS,
          photos
        })
      } else if (nameConflicts.length && !errors.length) {
        Alerter.info(
          'Alerter.photos.upload_success_conflicts',
          {smart_count: photos.length, conflictNumber: nameConflicts.length}
        )
        dispatch({
          type: UPLOAD_PHOTOS_SUCCESS_WITH_CONFLICTS,
          photos
        })
      } else {
        Alerter.error('Alerter.photos.upload_errors')
        dispatch({
          type: UPLOAD_PHOTOS_FAILURE,
          photos
        })
      }
    })
    .catch(() => {
      Alerter.info('Alert.photos.unexpected_upload_error')
      dispatch({
        type: UPLOAD_PHOTOS_FAILURE,
        photos
      })
    })
  }
}
