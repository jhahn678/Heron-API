import { JwtPayload, sign, verify } from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'
import knex from '../../configs/knex'
import { TokenExpiredError } from '../errors/ApolloTokenErrors'
import { AuthError } from '../errors/AuthError'

export const TOKEN_ISSUER = 'Heron API'
export const TOKEN_ALGORITHM = 'HS256'
export const REFRESH_TOKEN_EXPIRES_IN = '180d'
export const REFRESH_TOKEN_MAX_AGE = 1000 * 60 * 60 * 24 * 180
export const ACCESS_TOKEN_EXPIRES_IN = '60m'

interface DecodedToken extends JwtPayload {
    /** UserID */
    id: number,
    /** Token ID as UUID */
    jti?: string
}

interface TokenPayload {
    /** UserID */
    id: number
}

interface TokenPair {
    accessToken: string,
    refreshToken: string
}

interface CreateTokenResult extends TokenPair {
    /** Token ID as UUID */
    jwtid: string,
}

interface RefreshExistingTokenResult extends CreateTokenResult {
    /** USER ID */
    user: number
}

interface VerifyAccessTokenOpts {
    /** Apollo error by default */
    error: 'APOLLO' | 'EXPRESS'
}


/**
 * Decodes and returns access token 
 * -- Throws ApolloError on TokenExpired or AuthError if options.error is set to 'EXPRESS' 
 * -- Throws AuthError on invalid token
 * @param token 
 * @param options options used for configuring response
 * @returns Decoded access token payload
 */
 export const verifyAccessToken = (token: string, options?: VerifyAccessTokenOpts): DecodedToken => {
    try{
        return <DecodedToken>verify(token, process.env.ACCESS_TOKEN_SECRET!)
    }catch(err: any){
        if(err.name === 'TokenExpiredError'){
            if(options?.error === 'EXPRESS'){
                throw new AuthError('ACCESS_TOKEN_EXPIRED')
            }else{
                throw new TokenExpiredError()
            }
        }else{
            throw new AuthError('TOKEN_INVALID')
        }
    }
}


/**
 * Decodes and returns refresh token
 * -- Throws AuthError on Token Expired and Invalid
 * @param token Refresh Token
 * @returns Decoded Refresh Token
 */
export const verifyRefreshToken = async (token: string): Promise<DecodedToken> => {
    try{
        const payload = <DecodedToken>verify(token, process.env.REFRESH_TOKEN_SECRET!)
        const verified = await knex('refreshTokens')
            .where('user', payload.id)
            .andWhere('jwtid', payload.jti)
            .first()
        if(!verified) throw new Error()
        return payload
    }catch(err: any){
        if(err.name === 'TokenExpiredError'){
            throw new AuthError('REFRESH_TOKEN_EXPIRED')
        }else{
            throw new AuthError('REFRESH_TOKEN_INVALID')
        }
    }
}


/**
 * Generates Access Token and Refresh Token
 * @param payload 
 * @returns Access Token, Refresh Token and Refresh Token ID
 */
export const createTokenPair = (payload: TokenPayload): CreateTokenResult => {

    const jwtid = uuid()

    const refreshToken = sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
        jwtid: jwtid,
        algorithm: TOKEN_ALGORITHM,
        audience: payload.id.toString(),
        issuer: TOKEN_ISSUER,
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    })

    const accessToken = sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
        algorithm: TOKEN_ALGORITHM,
        audience: payload.id.toString(),
        issuer: TOKEN_ISSUER,
        expiresIn: ACCESS_TOKEN_EXPIRES_IN
    })

    return { refreshToken, accessToken, jwtid }
}




/**
 * Created a pair of Access and Refresh tokens on authentication
 * -- Throws AuthError on failure
 * @param payload 
 * @returns Access token and Refresh token
 */
export const createTokenPairOnAuth = async (payload: TokenPayload): Promise<TokenPair> => {

    const { accessToken, refreshToken, jwtid } = createTokenPair(payload)

    try{
        const result = await knex('refreshTokens')
            .insert({ user: payload.id, jwtid })
            .onConflict('user').merge(['jwtid'])
            .returning('*')

        if(result.length === 0) throw new Error()
        return { accessToken, refreshToken }

    }catch(err: any){
        throw new AuthError('AUTHENTICATION_FAILED')
    }

}


/**
 * Verifies refresh token against DB and returns new token pair
 * -- Throws AuthError if invalid
 * @param token refresh token
 * @returns Decoded refresh token payload
 */
export const refreshExistingTokenPair = async (token: string): Promise<RefreshExistingTokenResult> => {
    try{
        const { id, jti } = <DecodedToken>verify(token, process.env.REFRESH_TOKEN_SECRET!)
        const { accessToken, refreshToken, jwtid } = createTokenPair({ id })

        const result = await knex('refreshTokens')
            .where('user', id)
            .andWhere('jwtid', jti)
            .update('jwtid', jwtid)
            .returning('*')

        if(result.length === 0) throw new AuthError('REFRESH_TOKEN_INVALID')
        return { accessToken, refreshToken, jwtid, user: id }
    }catch(err: any){
        if(err.name === 'TokenExpiredError'){
            throw new AuthError('REFRESH_TOKEN_EXPIRED')
        }else{
            console.error(err)
            throw new AuthError('REFRESH_TOKEN_INVALID')
        }
    }
}

