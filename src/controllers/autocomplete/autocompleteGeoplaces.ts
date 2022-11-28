import { Request } from "express";
import knex, { st } from "../../configs/knex";
import { AutocompleteQuery } from "../../types/Autocomplete";
import { asyncWrapper } from "../../utils/errors/asyncWrapper";
import { AutocompleteQueryError } from "../../utils/errors/AutocompleteQueryError";
import { validateCoords } from "../../utils/validations/coordinates";
import { validateAdminOne } from "../../utils/validations/validateAdminOne";

export const autocompleteGeoplaces = asyncWrapper(async (req: Request<{},{},{},AutocompleteQuery>, res) => {
    
    const { value, lnglat, limit=8 } = req.query;
    if(!value) throw new AutocompleteQueryError('VALUE_REQUIRED')
    
    const query = knex('geoplaces')
    
    const parsedValue = value.split(',').map(x => x.trim())
    const [ name, adminOne ] = parsedValue;
    query.whereILike('name', (name + '%'))
    
    if(parsedValue.length > 1){
        const valid = validateAdminOne(adminOne);
        if(valid) query.where('admin_one', valid)
    }
    
    if(lnglat && !adminOne && name.length < 8){
        const coords = lnglat.split(',').map(x => parseFloat(x))
        if(validateCoords(coords)){
            const [lng, lat] = coords;
            const point = st.transform(st.setSRID(st.point(lng, lat), 4326), 3857)
            query.select('*',
            knex.raw('st_asgeojson(st_transform(geom, 4326))::json as geom'),
            knex.raw("'GEOPLACE' as type"),
            knex.raw('rank_result(geom <-> ?, weight, ?) as rank', [point, 300000])
            )
            query.where(st.dwithin('geom', point, 300000))
        }
    }else{
        query.select('*', 
        knex.raw('st_asgeojson(st_transform(geom, 4326))::json as geom'),
        knex.raw("'GEOPLACE' as type"),
        knex.raw('weight as rank')
        )
    }
    
    query.orderByRaw('rank desc')
    query.limit(limit)
    
    const results = await query;
    res.status(200).json(results)
})

