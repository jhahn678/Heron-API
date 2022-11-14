import { Router } from 'express'
import controllers from '../controllers'
const router = Router()

router.get('/', controllers.autocompleteAll)
router.get('/geoplaces', controllers.autocompleteGeoplaces)
router.get('/waterbodies', controllers.autocompleteWaterbodies)
router.get('/waterbodies/distinct-name', controllers.autocompleteDistinctName)
router.get('/nearest-waterbodies', controllers.nearestWaterbodies)
router.get('/nearest-geoplace', controllers.nearestGeoplace)
router.get('/users', controllers.searchByUsername)

export default router;