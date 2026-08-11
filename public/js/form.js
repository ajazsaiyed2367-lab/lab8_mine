/*
    The function formSubmit() is called when the form "myform" is submitted.
    It runs some validations and shows the output.
*/
function formSubmit(){

    //return true; // uncomment this line to bypass the validations

    var myOutput = ''; // we will use this to store the output of the form
    var errors = ''; // we will use this to store any error messages.
    
    // Fetching the values of all the fields entered by the user.

    // Using getElementById for most of the fields as they have just one
    // input field unlike radio buttons which have multiple.
    var name = document.getElementById('name').value;
    var email = document.getElementById('email').value;
    var postcode = document.getElementById('postcode').value;
    var phone = document.getElementById('phone').value;
    var campus = document.getElementById('campus').value;
    var tickets = document.getElementById('tickets').value;
    tickets = parseInt(tickets);//making sure that the string is converted to number

    // We use getElementsByName to fetch the radio buttons as we do not know
    // which one the user will select. This returns us an array of objects.
    var lunch = document.getElementsByName('lunch'); 
    

    var lunch_index = -1; 
    /* 
        Setting lunch_index as -1 as -1 is never an index in an array.
        If the value of lunch_index remains -1 after the execution of the 
        next for loop, that means the user did not check any value for lunch.
    */

    // Iterating through all the radio buttons to see which one was selected.
    for(var i = 0; i< lunch.length; i++){
        if(lunch[i].checked){
            lunch_index = i; // storing the index that the user selected
            break;
        }
    }

    // Checking if any of the radio buttons was selected
    if(lunch_index > -1){
        lunch = lunch[lunch_index].value;
    }
    else{
        // User did not select any value for lunch so concatenating that error to the list
        errors += 'You did not select any value for lunch<br/>';
    }


    // Writing a regular expression to validate Post Code
    // Post code format example is N2E 1A6

    var postcoderegex = /^[A-Z][0-9][A-Z]\s[0-9][A-Z][0-9]$/;

    // Converting the postcode to uppercase before testing
    postcode = postcode.toUpperCase(); 

    // Testing if the postcode fits the pattern
    if(postcoderegex.test(postcode)){ // Returns true if postcode satisfies the pattern
        errors += ''; // No error in postcode
    }
    else{
        errors += 'Post code is not in correct format <br/>'; // Error found in postcode
    }

    // Writing a regular expression to validate Phone
    // Phone format example is 123-123-1234 or 123.123.1234
    // or (123)-(123)-(1234) or (123).(123).(1234) or 1231231234
    // or 123/123/1234 or (123)/123/1234
    // or (123).123.1234 or (123)-123-1234 and some more that satisfy the rules

    var phoneregex = /^\(?(\d{3})\)?[\.\-\/\s]?(\d{3})[\.\-\/\s]?(\d{4})$/;

    // Testing if the phone fits the pattern
    if(phoneregex.test(phone)){ // Returns true if phone satisfies the pattern
        errors += ''; // No error in phone
    }
    else{
        // Error found in phone; concatenating to the existing list of errors
        errors += 'Phone is not in correct format <br/>'; 
    }

    // Comparing the errors string if any errors were found.
    if(errors.trim() != ''){ // trim is the function that trims any empty spaces from front or back
        // Showing the errors
        document.getElementById('errors').innerHTML = errors + '-- Please fix the above errors --';
        document.getElementById('errors').style.border = '2px dashed white';
    }
    else{
        // If no errors found
        
        var cost = 0; // setting a variable to store cost

        if(tickets > 0){// if tickets were selected
            cost = 100*tickets;
        }
        if(lunch == 'yes'){//if taking lunch
            cost += 60;//add 60 to the total cost
        }

        tax = cost * 0.13;

        total = cost + tax;

        // Preparing the myOutput
        myOutput = `Name: ${name} <br>
                    Email: ${email} <br>
                    Lunch: ${lunch}<br>
                    Campus: ${campus}<br>
                    Sub Total: $${cost.toFixed(2)}<br>
                    Tax: $${tax.toFixed(2)}<br>
                    Total: $${total.toFixed(2)}<br>
                    `;
        // removing any error messages
        document.getElementById('errors').innerHTML = '';
        document.getElementById('errors').style.border = '0px';
        // Showing the values put in by the user and the total cost
        document.getElementById('formResult').innerHTML = myOutput;
    }

    // Return false will stop the form from submitting and keep it on the current page.
    return false;
}