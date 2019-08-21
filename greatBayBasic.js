var mysql = require ("mysql");
var inquirer = require ("inquirer");

var connection = mysql.createConnection({

    host: "localhost",
    user: "root",
    password: "",
    port: 3306,
    database: "greatBay_DB"
});

connection.connect(function(err){
    if(err) throw err;

    console.log("we are connected on"+ connection.threadId);
    start ();
});

function start(){

    inquirer
        .prompt([
            {
                name: "postOrBid",
                type: "list",
                message: "what do you want to do?",
                choices: ["POST", "BID", "EXIT"]
            }
        ]).then(function(answer){

            if(answer.postOrBid === "POST"){
                postAuction();
            } else if (answer.postOrBid === "BID"){
                bidAuction();
            } else {
                connection.end();
            }
        });
}

function postAuction(){

    inquirer
        .prompt([
            {
                name: "item",
                type: "input",
                message: "what item you want to put in auction?"
            },
            {
                name: "category",
                type: "input",
                message: "what category best suits for this item?"
            },
            {
                name: "startingBid",
                type: "input",
                message: "how much money you want to bid?",
                validate: function(value) {
                    if (isNaN(value) === false) {
                      return true;
                    }
                    return false;
                  }
            },

        ]).then(function(answer){

            connection.query(
                "INSERT INTO auction SET ?",
                {
                    item_name: answer.item,
                    category: answer.category,
                    starting_bid: answer.startingBid || 0,
                    highest_bid: answer.startingBid || 0
                },
                function (err) {
                    if (err) throw err;

                    console.log("the auction table is successfully updated");
                    start();
                },
                
            );

        });
}


function bidAuction(){

    connection.query("SELECT * FROM auction",
        function (err, result){
            if(err) throw err;

            inquirer
                .prompt([
                    {
                        name: "choices",
                        type: "rawlist",
                        choices: function (){
                            var dataArray = [];

                            for (var i=0 ; i< result.length ; i++){
                                dataArray.push(result[i].item_name);
                            }
                        }
                    },
                    {
                        name: "bid",
                        type: "input",
                        message: "how much you want to bid?"
                    }

                ]).then(function(answer){

                    var chosenItem;

                    for (var i=0; i<result.length; i++){
                        if(answer.choices === result[i].item_name){
                            chosenItem =  result [i];
                        } return chosenItem;
                    }

                    if(chosenItem.highest_bid < parseInt (answer.bid)){
                        connection.query(
                            "UPDATE auction SET ? WHERE ?",
                            [
                                {
                                    id: chosenItem.id
                                },
                                {
                                    highest_bid: answer.bid
                                }
                            ],
                            function (err){
                                if(err) throw err;

                                start();
                            }
                        );
                    } else {
                        start ();
                    }
                });

        }
    );
}







