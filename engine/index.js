require(Modules.AI);

let dialogflow, call;

function sendMediaToDialogflow() {
    call.removeEventListener(CallEvents.PlaybackFinished);
    call.sendMediaTo(dialogflow)
}

function onDialogflowResponse(e) {
    let response = e.response;

    if (response.queryResult !== undefined && response.queryResult.fulfillmentText !== undefined) {
        call.say(response.queryResult.fulfillmentText, Language.Premium.RU_RUSSIAN_YA_FEMALE);
        call.sendMessage(JSON.stringify(response.queryResult));

        if(response.queryResult.diagnosticInfo){
            if(response.queryResult.diagnosticInfo.end_conversation){
                call.addEventListener(CallEvents.PlaybackFinished, VoxEngine.terminate);
            }
        }

        call.addEventListener(CallEvents.PlaybackFinished, sendMediaToDialogflow)
    }
}

function onCallConnected(e) {
    dialogflow = AI.createDialogflow({ lang: DialogflowLanguage.RUSSIAN });
    dialogflow.addEventListener(AI.Events.DialogflowResponse, onDialogflowResponse);
    call.say("Добрый день! Вас приветствует логистическая компания. Мы готовы принять Ваш заказ! Сообщите адрес отправления и доставки.", Language.Premium.RU_RUSSIAN_YA_FEMALE);
    call.addEventListener(CallEvents.PlaybackFinished, sendMediaToDialogflow)
}

VoxEngine.addEventListener(AppEvents.CallAlerting, (e) => {
    call = e.call;
    call.addEventListener(CallEvents.Connected, onCallConnected);
    call.addEventListener(CallEvents.Disconnected, VoxEngine.terminate);
    call.answer()
});