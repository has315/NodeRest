const idCheck = (req) => {
    if (!req.query.hasOwnProperty('id') || !req.query.id) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: 'Error',
            message: 'ID not found'
        });
        console.log('i get called');

    }
}

module.exports = {
    idCheck
}