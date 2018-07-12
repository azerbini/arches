define([
    'jquery',
    'underscore',
    'edtfy',
    'moment',
    ], function ($, _, edtfy, moment) {
    edtfy.locale('en')
    return Backbone.View.extend({
        
        // much of this adapted from code found on stack exchange
        isValidDate: function(nodes, node_name){
            
            var valid = true;
            _.each(nodes, function(node){
                if (node["entitytypeid"] == node_name) {
                    
                    var date_string = node["value"];
                    justDate = date_string.split("T")[0];
                    
                    // Deal with empty dates (they're ok!)
                    if(justDate == ""){
                        return;
                    }
                    
                    // Return false if the date has / or \ in it
                    if (justDate.indexOf('/') > -1){
                        valid = false;
                    }
                    if (justDate.indexOf('\\') > -1){
                        valid = false;
                    }

                    // The following was used before to replace / with -, but the new text was
                    // never passed on, and therefore this was a misleading test (/ fails on save)
                    //var replaceDate = justDate.replace(/\//g,"-");

                    // First check for the pattern
                    if(!/^\d{4}\-\d{1,2}\-\d{1,2}$/.test(justDate)){
                        valid = false;
                    }

                    // Parse the date parts, rebuild justDate
                    var parts = justDate.split("-");
                    for (i=1; i==2; i++) {
                        if (parts[i].length == i) {
                            parts[i] = "0"+parts[i];
                        }
                    }
                    justDate = parts.join("-");
                    
                    // make parts into integers for processing
                    var day = parseInt(parts[2], 10);
                    var month = parseInt(parts[1], 10);
                    var year = parseInt(parts[0], 10);

                    // Check the ranges of month and year
                    if(year > 3000 || month == 0 || month > 12){
                        valid = false;
                    }
                    var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

                    // Adjust for leap years
                    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)){
                        monthLength[1] = 29;
                    }
                        
                    // Check the range of the day
                    valid = day > 0 && day <= monthLength[month - 1];
                }
            });
            return valid;
        },
        
        validateDateEdtfy: function(nodes,node_name){

            /* set which moment.js formats you will accept here */
            
            var formats = ["YYYY-MM-DD", "YYYY-MM", "Y"]; 
            var valid = nodes !== undefined && nodes.length > 0;
            _.each(nodes, function(node) {
                if (node.entitytypeid != node_name) { return };

                if (node.value.length != node.value.trim().length) {
                    $("#edtf-date-alert").text("Please check for spaces before or after your date.");
                    valid = false;
                    return;
                }

                // first strip out a negative sign if necessary
                // this is just temporary for validation, the node is not actually altered.
                var nodeVal = node.value;
                if( nodeVal.charAt( 0 ) === '-' ) {
                    nodeVal = nodeVal.slice( 1 );
                }
                
                /* use moment.js to check for a correct date format first */
                var initial = moment(nodeVal, formats, true).isValid();
                console.log(moment(nodeVal));
                if (initial === true) {
                    valid = true;
                    return
                }
                console.log("moment failed, now checking with edtfy...");
                /* nodeVal is not strictly valid as a date, so check if it fits edtf */	

                try {
                    var parsed = edtfy(nodeVal); 
                    if(parsed == nodeVal) {
                        /* user entered a correct edtf value */
                        valid = true;
                    } else if(nodeVal.slice(-1) == '~' || 
                              nodeVal.slice(-1) == '?' ||
                              nodeVal.slice(-1) == 'u') {
                        /* check if parser is mis-interpreting YYYY-MM[?] */
                        console.log('yes');
                        var res = nodeVal.substring(0, nodeVal.length-1);
                        var initial = moment(res, formats, true).isValid();
                        if (initial === true) {
                            valid = true;
                        } 								
                    } else {
                        /* user used a recognizable invalid format, suggest edit */
                        $("#edtf-date-alert").text('Try entering this instead: ' + parsed);
                        valid = false;
                    }
                }
                catch(err) {
                    /* check if parser is mis-interpreting YYYY-MM-DD[?] */	  
                    if(nodeVal.slice(-1) == '~' || 
                       nodeVal.slice(-1) == '?' ||
                       nodeVal.slice(-1) == 'u') {
                        var res = nodeVal.substring(0, nodeVal.length-1);
                        var initial = moment(res, formats, true).isValid();
                        if (initial === true) {
                            valid = true;
                        } else {
                            valid = false;
                        }	 
                    } else {
                        /* user entered something incorrect that parser didn't recognize */
                        valid = false;
                    }
                }
            }, this);
            return valid;
        },
        
        //this now has the same syntax as validateHasValues.
        nodesHaveValues: function(nodes, node_names) {
            var valid = nodes != undefined && nodes.length > 0;
            _.each(nodes, function (node) {
                if (canBeEmpty) {
                    if (node.entityid === '' && node.value === '' && canBeEmpty.indexOf(node.entitytypeid) == -1){
                        valid = false;
                    }
                } else if (node.entityid === '' && node.value === '') {
                        valid = false;
                }
            }, this);
            return valid;
        }
    });
});