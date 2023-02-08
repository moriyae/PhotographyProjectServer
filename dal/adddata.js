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

    this.addOne = async (fields, values) => {
        try {
            let connection = await sql.connect(config)

            let result = await connection.request().query(`insert into ${table} (${fields}) values (${values}) `)

            return {success: true, data: result};
        }
        catch (ex) {
            
            return {success: false, data: ex};
        }
    }

    this.deleteOne = async (query) => {
        console.log("in delete one")
        console.log(query)
        try{
        let connection = await sql.connect(config)
        let result = await connection.request().query(`delete from ${table} where ${query}`)
        return {success: true, data: result};
        }
        catch(ex){
           return {success: false, data: ex};
        }
    }

} 