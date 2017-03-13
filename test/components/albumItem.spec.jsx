'use strict'

/* eslint-env jest */

import React from 'react'
import { shallow } from 'enzyme'

import { mockT } from '../lib/I18n'
import { AlbumItem } from '../../src/components/AlbumItem'

const mockAlbum = {
  _type: 'io.cozy.photos.albums',
  name: 'albumTest2',
  _id: '33dda00f0eec15bc3b3c59a615001ac8',
  photosIds: ['f717eb4d94f07737b168d3dbb7002141']
}

const routerObjectMock = {
  location: {
    pathname: '/mock'
  }
}

describe('AlbumItem component', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  it('should be displayed correctly if album with photosIds', () => {
    const component = shallow(
      <AlbumItem t={mockT} album={mockAlbum} getPhotoLink={() => Promise.resolve('test://mockImage.png')} router={routerObjectMock} />
    ).node
    expect(component).toMatchSnapshot()
  })
})
