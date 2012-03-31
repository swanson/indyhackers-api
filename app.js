var express = require('express')
    , _ = require('underscore')
    , rest = require('restler')
    , jsonify = require('jsonify')
    , inspect = require('util').inspect;

app = express.createServer();
app.use(express.logger());

var port = process.env.PORT || 8080;
app.listen(port);

app.get('/', function(req, res) {
    var url = "https://www.google.com/calendar/feeds/ig7e0j6v8ub9q6kga256n77048@group.calendar.google.com/public/full?alt=jsonc&max-results=0";
    
    rest.get(url).on('complete', function(r) {
        cleaned_data = clean_meta(r);

        res.json(cleaned_data);
    });
});

app.get('/events', function(req, res) {
    var url = 'https://www.google.com/calendar/feeds/ig7e0j6v8ub9q6kga256n77048@group.calendar.google.com/public/full?futureevents=true&singleevents=true&alt=jsonc&fields=items(title,location,when,details)&orderby=starttime&sortorder=ascending&max-results=10';
    
    rest.get(url).on('complete', function(d) {
        cleaned_data = _.map(d.data.items, clean_calendar);

        //google api likes to not sort correctly
        cleaned_data = _.sortBy(cleaned_data, function(item){ return item.when; });
        res.json(cleaned_data);
    });
});

clean_meta = function(response) {
    return {
        'title': response['data']['title'],
        'what': response['data']['details'],
        'updated': new Date(response['data']['updated']).getTime() / 1000,
        'routes': get_routes(),
    }
};

get_routes = function() {
    var routes = app.routes.routes['get'];
    return _.pluck(routes, 'path')
}

clean_calendar = function(item) {
    return {
        'what': item['title'],
        'where': item['location'],
        'when': new Date(item['when'][0]['start']).getTime() / 1000,
        'description': item['details'],
    }
};

console.log('Server started on port %s', app.address().port);