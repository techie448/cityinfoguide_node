// create an express app
const express = require("express");
const app = express();

app.use(express.json());

// use the express-static middleware
app.use(express.static("public"));

// define the first route
app.get("/", function (req, res) {
    res.send("<h1>Hello World!</h1>")
});



const db = require("./db");
const dbName = "data";
const collectionName = "movies";

db.initialize(dbName, collectionName, function(dbCollection) { // successCallback
    // get all items
    dbCollection.find().toArray(function(err, result) {
        if (err) throw err;
        console.log(result);
    });

    // << db CRUD routes >>

    // create

    app.post("/items", (request, response) => {
        const item = request.body;
        dbCollection.insertOne(item, (error, result) => { // callback of insertOne
            if (error) throw error;
            // return updated list
            dbCollection.find().toArray((_error, _result) => { // callback of find
                if (_error) throw _error;
                response.json(_result);
            });
        });
    });

    // get one

    app.get("/items/:id", (request, response) => {
        const itemId = request.params.id;

        dbCollection.findOne({ id: itemId }, (error, result) => {
            if (error) throw error;
            // return item
            response.json(result);
        });
    });

    // get all

    app.get("/items", (request, response) => {
        // return updated list
        dbCollection.find().toArray((error, result) => {
            if (error) throw error;
            response.json(result);
        });
    });

    // update

    app.put("/items/:id", (request, response) => {
        const itemId = request.params.id;
        const item = request.body;
        console.log("Editing item: ", itemId, " to be ", item);

        dbCollection.updateOne({ id: itemId }, { $set: item }, (error, result) => {
            if (error) throw error;
            // send back entire updated list, to make sure frontend data is up-to-date
            dbCollection.find().toArray(function(_error, _result) {
                if (_error) throw _error;
                response.json(_result);
            });
        });
    });

    // delete

    app.delete("/items/:id", (request, response) => {
        const itemId = request.params.id;
        console.log("Delete item with id: ", itemId);

        dbCollection.deleteOne({ id: itemId }, function(error, result) {
            if (error) throw error;
            // send back entire updated list after successful request
            dbCollection.find().toArray(function(_error, _result) {
                if (_error) throw _error;
                response.json(_result);
            });
        });
    });

}, function(err) { // failureCallback
    throw (err);
});

// start the server listening for requests
app.listen(process.env.PORT || 3000,
    () => console.log("Server is running..."));
