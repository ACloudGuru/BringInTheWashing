exports.handler = (event, context, callback) => {

    // Get image details from event object
    var bucket = event.Records[0].s3.bucket.name;
	var filename = event.Records[0].s3.object.key;

    // Labels to exclude (ie: notify us if anything apart from these appear)
    

    console.log('Bucket ['+bucket+'], Key ['+ filename+'] region:'+process.env.AWS_REGION);
    
    // Configure Rekognition client
    var AWS = require('aws-sdk');
    var rekognition = new AWS.Rekognition({apiVersion: '2016-06-27', region: process.env.AWS_REGION});
    
    // Configure Rekognition client parameters, including image name 
    // and location, maximum amount of results, and minimum confidence level
    var params = {
        Image: {
            S3Object: {Bucket: bucket, Name: filename }},
        MaxLabels: 20,
        MinConfidence: 60
    };
    
    // Call rekognition detect label function
    var request = rekognition.detectLabels(params, function(err, data) {
        if(err) {
            console.log(err, err.stack); // an error occurred
        }
        else{
            console.log('Results: ['+JSON.stringify(data)+']');
                        
        }
    }); 
};
