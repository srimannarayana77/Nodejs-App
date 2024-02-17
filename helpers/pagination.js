const  userControllers = require('../controllers/userController')
function paginationResponse(req) {
    const page = parseInt(req.query.page) || 1; 
    const pageSize = parseInt(req.query.pageSize) || 3;
    const skip = (page - 1) * pageSize
    return 
}
module.exports = paginationResponse;
   