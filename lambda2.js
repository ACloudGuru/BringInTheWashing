exports.handler = (event, context, callback) => {

    // things you configure
    var snsarn = '';
    var knownItems = ['Backyard', 'Outdoors', 'Yard', 'Bench', 'Park Bench', 'Flora', 'Plant', 'Tree', 'Park', 
                  'Forest', 'Grove', 'Land', 'Nature', 'Vegetation', 'Pond', 'Water', 'Blossom', 'Path', 
                  'Pavement', 'Cherry Blossom', 'Flora', 'Flower', 'Plant', 'Fence', 'Lilac', 'Hedge', 'Harbor',
                  'Port', 'Waterfront', 'Nature', 'Conifer', 'Urban', 'Flower Arrangement', 'Grove', 'Wilderness', '',
                  'Ornament', 'Jar', 'Potted Plant', 'Pottery', 'Vase', 'Vine', 'Sidewalk', 'Ivy', 'Yew',
                  'Oak', 'Sycamore', 'Moss', 'Grass', 'Lupin', 'Resort', 'Hotel', 'Building', 'Flagstone',
                  'Bonsai', 'Tarmac', 'Walkway', 'Trail', 'Office Building', 'Aisle', 'Indoors', 'Human', 'People', 
                  'Person', 'Intersection', 'Road', 'Garden', 'Architecture', 'Asphalt', 'Soil'];
    
    // Get image details from event object
    var bucket = event.Records[0].s3.bucket.name;
    var filename = event.Records[0].s3.object.key;
    
    // Configure Rekognition client
    var AWS = require('aws-sdk');
    var rekognition = new AWS.Rekognition({apiVersion: '2016-06-27', region: process.env.AWS_REGION});
    
    // Configure Rekognition client parameters, including image name 
    // and location, maximum amount of results, and minimum confidence level
    var params = {
        Image: {
            S3Object: {Bucket: bucket, Name: filename }},
        MaxLabels: 20,
        MinConfidence: 40
    };
    
    // Call rekognition detect label function
    var request = rekognition.detectLabels(params, function(err, data) {
        if(err) {
            console.log(err, err.stack); // an error occurred
        }
        else{
            
            // a few tracking variables
            var found = 0; // have we found anything?
            var notify = 0; // should we notify someone?
            var items = ""; // list of items we found
            
            // iterate through all of the labels that were found for this image
            var labels = data.Labels;
            var key = 'Name';
            // loop through all keys (labels) that were detected, using the key of 'Name'
            for (key in labels) {
                found = 0;
                // loop through knownItems to see if anything matches
                for (var x=0; x<knownItems.length; x++) {
                    if (knownItems[x] == labels[key].Name) { // if something matches, lets record it with the found variable
                        found = 1;
                    } 
                }
                if (found == 0) { // if we get here, the loop had no matching knownItem for the key we're checking. this means something was found.
                    if (notify == 1) // formatting
                        items += ',';
                    items += " " + labels[key].Name; // record what was found so we can email it to the user
                    notify = 1;   // confirm we're going to send a notification

                }
            }

            // if we've confirmed we're going to send a notification
            if (notify == 1) {
                // send notification via SNS
                var sns = new AWS.SNS();
                sns.publish({
                    Message: 'You left the washing on the clothes line!\n\nFound objects: ' + items + '.',
                    MessageStructure: 'text',
                    TargetArn: snsarn,
                    Subject: 'Bring in the washing!'
                }, function(err, data) {
                    if (err) {
                        console.log(err.stack);
                        return;
                    }
                });    
            }
        }
    }); 
};
