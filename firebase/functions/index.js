// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const admin = require('firebase-admin');
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');

const priceList = {
    small: 500,
    medium: 1000,
    large: 2000
};

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

admin.initializeApp(functions.config().firebase);
let database = admin.database();

function addOrder(params) {
    let ordersRef = database.ref('orders');
    let newOrderRef = ordersRef.push();
    newOrderRef.set(params);
}

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    const agent = new WebhookClient({request, response});
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

    function deliveryHandler(agent) {
        const carsize = agent.parameters.carsize;
        const loadercount = agent.parameters.loadercount;

        //Calculate price
        let price = 1000 * loadercount + priceList[carsize];

        agent.setContext({
            name: 'delivery-data',
            lifespan: 5,
            parameters: {carsize: carsize, loadercount: loadercount, price: price}
        });

        agent.add(`Все данные собраны, цена вашего заказа составит ${price} рублей! Оформляем заказ?`);
    }

    function deliveryConfirmHandler(agent) {
        const dataContext = agent.getContext('delivery-data');
        const orderParams = dataContext.parameters;
        addOrder({
            from: orderParams.addressfrom,
            to: orderParams.addressto,
            date: orderParams.date,
            carsize: orderParams.carsize,
            loadercount: orderParams.loadercount,
            payment: orderParams.payment,
            price: orderParams.price,
            date_created: Date.now()
        });

        agent.add(`Ваш заказ оформлен. Спасибо что выбрали нашу компанию.`);
    }

    // Run the proper function handler based on the matched Dialogflow intent name
    let intentMap = new Map();

    intentMap.set('delivery', deliveryHandler);
    intentMap.set('delivery - yes', deliveryConfirmHandler);

    agent.handleRequest(intentMap);
});