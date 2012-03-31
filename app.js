var express = require('express')
    , _ = require('underscore')
    , rest = require('restler')
    , jsonify = require('jsonify')
    , inspect = require('util').inspect;

app = express.createServer();
app.use(express.static(__dirname + '/public'));
app.use(express.logger());

var port = process.env.PORT || 8080;
app.listen(port);

app.get('/events', function(req, res) {
    indyHackersUrl = 'https://www.google.com/calendar/feeds/ig7e0j6v8ub9q6kga256n77048@group.calendar.google.com/public/full?futureevents=true&singleevents=true&alt=jsonc&fields=items(title,location,when)&orderby=starttime&sortorder=ascending&max-results=10';
    
    rest.get(indyHackersUrl).on('complete', function(d) {
        next_three = _.first(d.data.items, 5)
        cleaned_data = _.map(next_three, clean_calendar);

        //google api likes to not sort correctly
        cleaned_data = _.sortBy(cleaned_data, function(item){ return item.when; });
        res.json(cleaned_data);
    });
});

clean_calendar = function(item) {
    return {
        'what': item['title'],
        'where': item['location'],
        'when': item['when'][0]['start'],
    }
}

console.log('Server started on port %s', app.address().port);