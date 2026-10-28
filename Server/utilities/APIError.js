class APIError{
     constructor(statusCode, message, data){
          this.statusCode = statusCode;
          this.success = false;
          this.message = message;
          this.data = data;
     }
}


export default APIError;
