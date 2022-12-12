import { RequestHandler } from 'express'
import { verifyAccessToken } from '../auth/token';
import { AuthError } from '../errors/AuthError';

/** Compares authentication token ID to field id in request body */
export const authorizeRequest: RequestHandler = (req, res, next) => {
    try{
        const { authorization } = req.headers;
        const token = authorization?.split(' ')[1]
        if(!token) throw new AuthError('AUTHENTICATION_REQUIRED')
        const id = verifyAccessToken(token, { error: 'EXPRESS'})
        if(!id || req.body.id !== id) throw new AuthError('UNAUTHORIZED')
        next()
    }catch(err){
        next(err)
    }
}


/** Ensures that a valid access token is PRESENT in headers */
export const requireAccessToken: RequestHandler = (req, res, next) => {
    try{
        const { authorization } = req.headers;
        console.log(authorization)
        if(!authorization) throw new AuthError('AUTHENTICATION_REQUIRED')
        const payload = verifyAccessToken(authorization.split(' ')[1], { error: 'EXPRESS'})
        req.user = payload.id;
        next()
    }catch(err){
        console.error(err)
        next(err)
    }
}
