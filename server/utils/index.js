export const buildErrorResponse = (res, error) => {
    const statusCode = error.statusCode ? error.statusCode : 500; 

    delete error.statusCode;
    return res.status(statusCode).send({
        status: false,
        error
    })
}

export const buildSuccessResponse = (res, response) => {
    const statusCode = response.statusCode ? response.statusCode : 200; 

    delete response.statusCode
    response.status = true;
    return res.status(statusCode).send(response)
}