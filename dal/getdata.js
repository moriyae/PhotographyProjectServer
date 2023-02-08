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

    this.findOne = async (query) => {
        try {
            let connection = await sql.connect(config)
            console.log(`select * from ${table} where ${query} `)
            let result = await connection.request().query(`select * from ${table} where ${query} `)
            return {success: true, data: result.recordset};          
        }
        catch (ex) {
            return {success: false, data: ex};
        }
    }

    this.findAll = async (field) => {
        try{
        let connection = await sql.connect(config)
        let result = await connection.request().query(`select ${field} from ${table} `)

        return {success: true, data: result.recordset};
    }
        catch(ex){
            return {success: false, data: ex};
        }
    }


    this.findInnerJoin = async (field,query) => {
        try{
        let connection = await sql.connect(config)
        let result = await connection.request().query(`select ${field} from ${table} ${query}`)

        return {success: true, data: result.recordset};
    }
        catch(ex){
            return {success: false, data: ex};
        }
    }

}
