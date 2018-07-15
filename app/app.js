'use strict';

// =================================================================================
// App Configuration
// =================================================================================

const {App} = require('jovo-framework');
const ratp = require('./ratp_calls');
const tools = require('./tools');
const config = {
    logging: false,
    saveUserOnResponseEnabled: true,
    userDataCol: 'userData',

    intentMap: {
        'AMAZON.RepeatIntent': 'RepeatIntent',
    },

    db: {
        type: 'dynamodb',
        tableName: 'HoraireTransportData',
    },
};

//go
const app = new App(config);


// =================================================================================
// App Logic
// =================================================================================

app.setHandler({
    'LAUNCH': function() {
        this.ask('Voulez vous avoir les horaires ?');

    },

    'RepeatIntent': function()  {
        
        let userData  = this.user().data
        
        if ( userData !== undefined  
            && !tools.isEmpty(userData)
            && !userData.HorairesData.error ) {            
            this.toIntent('HorairesApiIntent', userData.HorairesData);
        }
        else {
            this.toIntent('LAUNCH');
        }
    },

    'HorairesIntent': function(type, code, station) {
        if (!this.alexaSkill().isDialogCompleted()) {
            this.alexaSkill().dialogDelegate()
            
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
                error: true                
            };
            this.toIntent('HorairesApiIntent', HorairesData);
        }
    },
    'HorairesApiIntent': function(HorairesData) {

        let station = HorairesData.station.alexaSkill.resolutions.resolutionsPerAuthority[0].values[0].value.id

        ratp.call_schedules(HorairesData.type.value, HorairesData.code.value, station, 'A' )        
        .then ((output) => {
            this.tell(tools.display(output))
            
            HorairesData.error = false
            this.user().data.HorairesData = HorairesData
            
        }
        ).catch((error) => {
            this.tell(tools.display(error))

            HorairesData.error = true
            this.user().data.HorairesData = HorairesData

        })
    },
});



module.exports.app = app;
