import { Request } from "express";
import knex from "../../configs/knex";
import { asyncWrapper } from "../../utils/errors/asyncWrapper";
import { AuthError } from "../../utils/errors/AuthError";
import { validateUsername } from "../../utils/validations/validateUsername";

interface ReqBody{
    username: string
}

/** @Middleware authenticateRequest sets user property */
export const changeUsername = asyncWrapper(async (req: Request<{},{},ReqBody>, res) => {
    const { username } = req.body;
    try{
        const [updated] = await knex('users')
            .where({ id: req.user })
            .update({ username }, '*') 
        res.status(200).json({ id: updated.id, username: updated.username })
    }catch(err){
        throw new AuthError('USERNAME_IN_USE')
    }
})
