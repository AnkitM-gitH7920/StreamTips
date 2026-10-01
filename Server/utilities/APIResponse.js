class APIResponse{
     constructor(statusCode, message, data){
          this.statusCode = statusCode;
          this.message = message;
          this.data = data;
          this.success = true; //Always return success: True
     }
}

export default APIResponse;
