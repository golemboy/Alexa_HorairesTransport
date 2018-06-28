'use strict';

// =================================================================================
// App Configuration
// =================================================================================

const {App} = require('jovo-framework');
const ratp = require('./ratp_calls');
const tools = require('./tools');
const config = {
    logging: true,
};

const app = new App(config);


// =================================================================================
// App Logic
// =================================================================================

app.setHandler({
    'LAUNCH': function() {
        this.ask('Voulez vous avoir les horaires ?');

    },
    'HorairesIntent': function(type, code, station) {
        if (!this.alexaSkill().isDialogCompleted()) {
            this.alexaSkill().dialogDelegate();

        } else if (!this.alexaSkill().hasSlotValue('type')) {
            this.alexaSkill().dialogElicitSlot('type', 'quel type de transport s\'il vous plait ?');        

        } else if (!this.alexaSkill().hasSlotValue('code')) {
            this.alexaSkill().dialogElicitSlot('code', 'quelle {type} s\'il vous plait ?');

        } else if (!this.alexaSkill().hasSlotValue('station')) {
            this.alexaSkill().dialogElicitSlot('station', 'quel arrêt s\'il vous plait ?');

            
        } else if (this.alexaSkill().getIntentConfirmationStatus() !== 'CONFIRMED') {
            
            let la_station = station.alexaSkill.resolutions.resolutionsPerAuthority[0].values[0].value.name;

            this.alexaSkill().dialogConfirmIntent(
                'Vous recherchez les horaires du ' + type.value +
                ' ' + code.value +
                ' station ' + la_station +
                 ' ?'
            );
        
        } else if (this.alexaSkill().getIntentConfirmationStatus() === 'CONFIRMED') {
            let HorairesData = {
                type: type,
                code: code,
                station: station,                
            };
            this.toIntent('HorairesApiIntent', HorairesData);
        }
    },
    'HorairesApiIntent': function(HorairesData) {
        
        // console.log("---------------------------------------")
        // console.log("LA")
        // console.log(HorairesData.station.alexaSkill.resolutions.resolutionsPerAuthority)
        // console.log("---------------------------------------")

        let station = HorairesData.station.alexaSkill.resolutions.resolutionsPerAuthority[0].values[0].value.id;
        //console.log("HorairesData " +HorairesData.type);

        ratp.call_schedules(HorairesData.type.value, HorairesData.code.value, station, 'A' )        
        .then ((output) => {
            console.log(output);
            this.tell(tools.display(output))
            //this.tell('<speak>destination '+output[0].destination+' dans '+tools.translate(output[0].message)+',<break time="1s"/> destination '+output[1].destination+' dans '+tools.translate(output[1].message)+'.</speak>');
            
        }
        ).catch((error) => {
            this.tell(tools.display(error))
        })
        //this.tell('c\'est pret, merci !');
    },
});



module.exports.app = app;
