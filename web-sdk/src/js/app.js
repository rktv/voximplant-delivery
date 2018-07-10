import * as VoxImplant from 'voximplant-websdk';
import { ui } from './ui';

document.addEventListener('DOMContentLoaded', () => {
    ui.showLoader();
});

const sdk = VoxImplant.getInstance();
    sdk.init({
        micRequired: true,
    })
        .then(()=>{
            console.log('This code is executed after SDK successfully initializes');
            return sdk.connect();
        })
        .then(()=>{
            console.log('This code is executed after SDK is successfully connected to Voximplant');
            return sdk.login('username@appname.accname.voximplant.com','PASSWORD'); // Replace with your username and password
        })
        .then(()=>{
            console.log('This code is executed on successfull login');
            ui.hideLoader();
            document.getElementById('jsMakeCall').addEventListener('click',()=>{
                const call = sdk.call(699100813);
                call.on(VoxImplant.CallEvents.Connected, () => {
                    console.log('You can hear audio from the cloud')
                });

                call.on(VoxImplant.CallEvents.MessageReceived, (e) => {
                    console.log('Message Received');
                    let response = JSON.parse(e.text);
                    let params = response.parameters;
                    console.log(response);
                });

                call.on(VoxImplant.CallEvents.Failed, (e) => console.log(`Call failed with the ${e.code} error`));
                call.on(VoxImplant.CallEvents.Disconnected, () => console.log('The call has ended'));

                // Hang up
                document.getElementById('jsHangUp').addEventListener('click', ()=>{
                    call.hangup();
                }, false);

              }, false);
        })
        .catch((e)=>{
            console.log(e);
        });