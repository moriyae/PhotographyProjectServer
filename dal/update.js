let sql = require('mssql')

var config = {
  user: 'moriya',
  password: '211341086',
  server: 'localhost',
  database: 'PhotographyProject',
  trustServerCertificate: true,
  options: {
      cryptoCredentialsDetails: {
          minVersion: 'TLSv1'
      }
  }
}

module.exports = function MyObject(col) {
  var table = col
 
  this.update = async (query, id) => {
    try{
    let connection = await sql.connect(config)
    console.log(`update ${table} set ${query} where Id=${id}`)
    let result = await connection.request().query(`update ${table} set ${query} where Id=${id}`)


    return {success: true, data: result};
    }
    catch(ex){
      return {success: false, data: ex};
    }
  }
}