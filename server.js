//Core Packages del proyecto
const hapi = require('hapi');
const inert = require('inert'); //Puedo servir archivos o renderizar toda la vista
const path = require('path');
const good = require('good')
const methods = require('./lib/methods')
const handlebars = require('./lib/helpers');
const vision = require('vision');
const blankie = require('blankie')
const scooter = require('scooter')

//Importando las rutas
const routes = require('./routes');

//"nodemon": "nodemon server.js --ext js,hbs",

const P = 3000;

const server = hapi.server({
    //port: process.env.PORT || 3000,
    port: P,   
    host: 'localhost',
    routes: {
        files: {
            relativeTo: path.join(__dirname, 'public')
        }
    }                     //Escribiendo el core
});


const init = async ()=> {
    try {
    
     //Permitiendo el acceso a servir el template   
    await server.register(inert)
    await server.register(vision)
    await server.register({
        plugin: good,
        options:{
            reporters:{
                console:[
                    {
                        module: 'good-console'
                    },
                    'stdout'
                ]
            }
        }
    })
    
    await server.register({
        plugin: require('./lib/api'),
        options:{
            prefix: 'api'
        }
    })

    //Configurando Metodos de servidor
    server.method('setAnswerRight', methods.setAnswerRight)

    //Configurando el State
    server.state('user', {
        ttl: 1000 * 60 * 60 * 24 * 7,
        isSecure: process.env.NODE_ENV === 'prod',
        encoding: 'base64json'
      })


    /*
        CROSS Site Scripting
      await server.register([scooter, {
      plugin: blankie,
      options: {
        defaultSrc: `'self' 'unsafe-inline'`,
        styleSrc: `'self' 'unsafe-inline' https://maxcdn.bootstrapcdn.com`,
        fontSrc: `'self' 'unsafe-inline' data:`,
        scriptSrc: `'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://maxcdn.bootstrapcdn.com/ https://code.jquery.com/`,
        generateNonces: false
      }
    }])
      */

    //Implementando un objeto de configuracion
    server.views({
        engines: {
            hbs: handlebars
          },
          relativeTo: __dirname,
          path: 'views',
          layout: true,
          layoutPath: 'views'
    })

    
      server.route(routes)   
      await server.start()
    } catch (error) {
      console.error(error)
      process.exit(1)
    }
    
    server.log(' Status ', `INFO-SERVER  -> ${server.info.uri}`)
}

//Mostrando los errores en la consola
process.on('unhandledRejection', error => {
    console.error('UnhandledRejection', error.message, error)
})
  
process.on('unhandledException', error => {
    console.error('unhandledException', error.message, error)
})

//Init del servidor
init();