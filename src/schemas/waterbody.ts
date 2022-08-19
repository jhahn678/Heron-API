import { gql } from 'apollo-server-express'
import knex from '../configs/knex'
import { Resolvers } from '../types/graphql'
import { AuthError } from '../utils/errors/AuthError'
import { RequestError } from '../utils/errors/RequestError'
import { UploadError } from '../utils/errors/UploadError'
import { validateMediaUrl } from '../utils/validations/validateMediaUrl'

export const typeDef =  gql`
    type Waterbody {
        name: String
        states: [String]
        classification: String
        country: String
        counties: [String]
        ccode: String
        subregion: String
        catches: [Catch]
        locations: [Location]
        media: [WaterbodyMedia]
    }

    type Query {
        getWaterbody(id: ID!): Waterbody
        getWaterbodies(ids: [ID], offset: Int, limit: Int): [Waterbody]
    }

    type Mutation {
        addWaterbodyMedia(id: ID!, media: [MediaInput!]!): [WaterbodyMedia]
        bookmarkWaterbody(id: ID!): Waterbody
    }
`

export const resolver: Resolvers = {
    Query: {
        getWaterbody: async (_, { id }, { dataSources }) => {
            return (await dataSources.waterbodies.getWaterbody(id))
        },
        getWaterbodies: async (_, { ids, offset, limit }, { dataSources }) => {
            if(ids && ids.length > 0) {
                return (await dataSources.waterbodies.getWaterbodies({ ids }))
            }
            const params = { offset: offset || 0, limit: limit || 20 }
            return (await dataSources.waterbodies.getWaterbodies(params))
        },
    },
    Mutation: {
        // bookmarkWaterbody: async (_, { id }, { dataSources }) => {},
        addWaterbodyMedia: async (_, { id, media }, { auth, dataSources }) => {
            if(!auth) throw new AuthError('AUTHENTICATION_REQUIRED')

            const waterbody = await dataSources.waterbodies.getWaterbody(id);
            if(!waterbody) throw new RequestError('TRANSACTION_NOT_FOUND')

            const valid = media.filter(x => validateMediaUrl(x.url))
            const uploads = valid.map(x => ({ user: auth, waterbody: id, ...x }))
            if(uploads.length === 0) throw new UploadError('INVALID_URL')
            
            const res = await knex('waterbodyMedia').insert(uploads).returning('*')
            return res;
        },
    },
    Waterbody: {
        catches: async ({ _id }) => {
            const catches = await knex('catches').where({ waterbody: _id })
            return catches;
        },
        locations: async ({ _id }) => {
            const locations = await knex('locations').where({ waterbody: _id })
            return locations;
        },
        media: async ({ _id }) => {
            const media = await knex('waterbodyMedia').where({ waterbody: _id })
            return media;
        }
    }
}