export enum AuthErrorType {
    /** 
     * @Status 400 @Message The credentials provided are invalid
    */
    'INVALID_CREDENTIALS',
    /** 
     * @Status 400 @Message The email provided is invalid
    */
    'EMAIL_IN_USE',
    /** 
     * @Status 400 @Message The email provided is already in use
    */
    'EMAIL_INVALID',
    /** 
     * @Status 400 @Message The username provided is invalid
    */
    'USERNAME_INVALID',
    /** 
     * @Status 400 @Message The username provided is already in user
    */
   'USERNAME_IN_USE',
    /** 
     * @Status 400 @Message Could not authenticate request
    */
    'AUTHENTICATION_FAILED',
    /** 
     * @Status 403 @Message Authentication not provided
    */
    'AUTHENTICATION_REQUIRED',
    /** 
     * @Status 403 @Message Request not authorized
    */
    'UNAUTHORIZED',
    /** 
     * @Status 401 @Message The provided authentication token is invalid
    */
    'TOKEN_INVALID',
    /** 
     * @Status 401 @Message The provided authentication token is expired
    */
    'TOKEN_EXPIRED',
    /** 
     * @Status 400 @Message Access token expired
    */
    'ACCESS_TOKEN_EXPIRED',
    /** 
     * @Status 401 @Message Access token invalid
    */
    'ACCESS_TOKEN_INVALID',
    /** 
     * @Status 401 @Message Refresh token expired
    */
    'REFRESH_TOKEN_EXPIRED',
    /** 
     * @Status 401 @Message Refresh token invalid
    */
    'REFRESH_TOKEN_INVALID',
    /** 
     * @Status 400 @Message Could not send password reset email
    */
    'PASSWORD_RESET_EMAIL_FAILED',
    /**
     * @Status 400 @Message Facebook account already in use
    */
    'FACEBOOK_ACCOUNT_IN_USE',
    /** 
     * @Status 500 @Message Could not fetch profile from facebook
    */
    'FACEBOOK_AUTH_FAILED',
    /**
     * @Status 400 @Message Google account already in use
    */
    'GOOGLE_ACCOUNT_IN_USE',
    /** 
     * @Status 500 @Message Could not fetch profile from google
    */
    'GOOGLE_AUTH_FAILED',
    /** 
     * @Status 400 @Message Apple account already in use
    */
    'APPLE_ACCOUNT_IN_USE',
    /** 
     * @Status 400 @Message Provided password is invalid
    */
    'PASSWORD_INVALID'
}

export class AuthError extends Error{
    status: number = 400
    message: string = 'Authentication error'
    code: string = 'AUTH_ERROR'

    constructor(errorType: keyof typeof AuthErrorType){
        super();
        this.code = errorType;
        switch(errorType){
            case 'INVALID_CREDENTIALS':
                this.message = 'The credentils provided are invalid';
                break;
            case 'EMAIL_INVALID':
                this.message = 'The email provided is invalid';
                break;
            case 'EMAIL_IN_USE':
                this.message = 'The email provided is already in use';
                break;
            case 'USERNAME_INVALID':
                this.message = 'The username provided is invalid';
                break;
            case 'USERNAME_IN_USE':
                this.message = 'The username provided is already in user';
                break;
            case 'AUTHENTICATION_FAILED':
                this.message = 'Could not authenticate request';
                break;
            case 'AUTHENTICATION_REQUIRED':
                this.status = 403;
                this.message = 'Authentication not provided'
                break;
            case 'UNAUTHORIZED':
                this.status = 403;
                this.message = 'Request not authorized';
                break;
            case 'TOKEN_INVALID':
                this.status = 401;
                this.message = 'The provided authentication token is invalid';
                break;
            case 'TOKEN_EXPIRED':
                this.status = 401;
                this.message = 'The provided authentication token is expired';
                break;
            case 'PASSWORD_RESET_EMAIL_FAILED':
                this.message = 'Could not send password reset email';
                break;
            case 'ACCESS_TOKEN_EXPIRED':
                //Changing this will affect front end error handling
                //message text is being used as a means of auto refreshing access token
                this.message = 'Access token expired';
                this.status = 401;
                break;
            case 'ACCESS_TOKEN_INVALID':
                this.message = 'Access token invalid';
                this.status = 401
                break;
            case 'REFRESH_TOKEN_EXPIRED':
                this.message = 'Refresh token expired';
                this.status = 401;
                break;
            case 'REFRESH_TOKEN_INVALID':
                this.message = 'Refresh token invalid';
                this.status = 401;
                break;
            case "APPLE_ACCOUNT_IN_USE":
                this.message = 'Apple account already in use'
                break;
            case "FACEBOOK_ACCOUNT_IN_USE":
                this.message = "Facebook account already in use"
                break;
            case 'GOOGLE_ACCOUNT_IN_USE':
                this.message = "Google account already in use";
                break;
            case 'FACEBOOK_AUTH_FAILED':
                this.message = 'Could not fetch profile from facebook';
                this.status = 500;
                break;
            case 'GOOGLE_AUTH_FAILED':
                this.message = 'Could not fetch profile from google';
                this.status = 500;
                break;
            case 'PASSWORD_INVALID':
                this.message = 'Provided password is invalid';
                break;
            default:
                break;
        }
    }
}
