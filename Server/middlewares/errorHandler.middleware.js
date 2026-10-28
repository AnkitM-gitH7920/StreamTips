import APIError from "../utilities/APIError.js";

const errorHandler = (err, req, res, next) => {
     console.log(err)
     if (err instanceof APIError) {
          return res
               .status(err.statusCode)
               .json({
                    status: err.statusCode,
                    message: err.message,
                    success: err.success,
                    data: err.data
               })
     }

     return res.status(500).json({
          success: false,
          status: 500,
          message: "Something went wrong, please try again later",
          data: {
               error: "SERVER_ERROR"
          }
     });
}

export { errorHandler };
