var app = angular.module('callBreakCalc', []);

app.controller('callBreakCtrl', function($scope) {
    var getNewHand = function(){
        var playerPoints = [];
        for(var i=0; i < 4; i++){
            playerPoints.push({call:0, extra:0});
        }
        return {'playerPoints':playerPoints, 'started': false};
    };
    
    var configureHands = function(){
        $scope.hands = [];
        $scope.hands.push(getNewHand());        
        $scope.handIndex = 0;
        $scope.playerIndex = 0;
    };
    
    configureHands();
    
    $scope.playerTotals = [];
    for (var i=0; i < $scope.hands[$scope.handIndex].playerPoints.length; i++){
        $scope.playerTotals.push({score: 0, position: 0});
    }
    
    $scope.playerPointClicked = function(handIndex, playerIndex) {
		$scope.handIndex = handIndex;
		$scope.playerIndex = playerIndex;
    };
    
    $scope.increasePoints = function() {
		var hand = $scope.hands[$scope.handIndex];
		var playerPoint = hand.playerPoints[$scope.playerIndex];
		if (!hand.started){
			// There are 13 wins in a hand, realistically a single player won't get that many, but that is the limit.5
			if (playerPoint.call <13){
				playerPoint.call++;
			}
		} else {
			playerPoint.extra++;
		}
    };
    
    $scope.decreasePoints = function() {
		var hand = $scope.hands[$scope.handIndex];
		var playerPoint = hand.playerPoints[$scope.playerIndex];
		if (!hand.started){
            // not allowing to decrease the call below 1
			if (playerPoint.call >1){
				playerPoint.call--;
			}
		} else {
            // not letting to decrease the extra below -1, -1 means this player lost this hand
			if (playerPoint.extra > -1){
				playerPoint.extra--;
			}
		}
    };
    
    $scope.canStartHand = function(){
        // can start current hand if it hasn't been started already and all the calls have been made
        if ($scope.hands[$scope.handIndex].started){
            return false;
        }
        for (var i=0; i < $scope.hands[$scope.handIndex].playerPoints.length; i++){
            if ($scope.hands[$scope.handIndex].playerPoints[i].call < 1){
                return false;
            }
        }
        return true;
    };
    
    $scope.canResetHand = function(){
        // can only reset the hand if this hand is started and either
        // a) this hand is the fifth hand, or b) this isn't the fifth hand but the next hand hasn't been started yet
        if (!$scope.hands[$scope.handIndex].started){
            return false;
        }
        
        if ($scope.handIndex === 4){
            return true;
        }
        
        if (!$scope.hands[$scope.handIndex+1].started){
            return true;
        }
        
        return false;
    };
    
    $scope.resetHand = function(){
        if (!window.confirm('Replay previous hand?')){
            return;
        }
        $scope.hands[$scope.handIndex].started = false;			
        for (var i=0; i < $scope.hands[$scope.handIndex].playerPoints.length; i++){
            var playerPoint = $scope.hands[$scope.handIndex].playerPoints[i];
            playerPoint.call = 0;
            playerPoint.extra = 0;
        }
    };
    
    $scope.resetGame = function(){
        if (!window.confirm('Start a whole new game?')){
            return;
        }
        configureHands();
    };
    
    $scope.startHand = function(){
        $scope.hands[$scope.handIndex].started = true;
        // bring the selection back to the first player in this hand
        $scope.playerIndex = 0;
        // skip adding new hands if there are five hands already
        if ($scope.hands.length > 4){
            return;
        }
        // add a new hand if this is the last hand
        if ($scope.hands.length-1 === $scope.handIndex){
            $scope.hands.push(getNewHand());
        }
    };
    
    var getPlayersTotal = function(playerIndex){
        // calculating the claim and the extra separately and adding them up later to avoid floating values
        var totalCall = 0;
        var totalExtra = 0;
        for (var i=0; i < $scope.hands.length; i++){
            var hand = $scope.hands[i];
            if (hand.started){
                var playerPoint = hand.playerPoints[playerIndex];
                if (playerPoint.extra < 0){
                    totalCall -= playerPoint.call;
                } else {
                    totalCall += playerPoint.call;
                    totalExtra += playerPoint.extra;
                }
            }
        }
        return totalCall + (totalExtra/10);
    };
	
    var fillPlayersPosition = function(){
        //copy the array to a new one and sort that new array using 'inserting sorting'
        var playerTotalsCopy = $scope.playerTotals.slice();
        var numberOfPlayers = playerTotalsCopy.length;
        for (var i=1; i < numberOfPlayers; i++){
            var temp = playerTotalsCopy[i];
            var j = i;
            while (j > 0 && temp.score > playerTotalsCopy[j-1].score){
                playerTotalsCopy[j] = playerTotalsCopy[j-1];
                j--;
            }
            playerTotalsCopy[j] = temp;
        }
        
        //fill in the position from first to last in the sorted array
        //original aray should also get the position because they reference the same objects
        for (var k=0; k < numberOfPlayers; k++){
            if (k === 0){
                playerTotalsCopy[k].position = 1;
            } else {
                if (playerTotalsCopy[k].score === playerTotalsCopy[k-1].score){
                    playerTotalsCopy[k].position = playerTotalsCopy[k-1].position;
                } else {
                    playerTotalsCopy[k].position = playerTotalsCopy[k-1].position + 1;
                }
            }
        }
    };
    
    // Calculate the total score everytime our data changes
    $scope.$watch('hands', function() {
        // no need to calculate total when there is only one hand
        if ($scope.hands.length < 2){
            return;
        }
        for (var i=0; i < $scope.playerTotals.length; i++){
            $scope.playerTotals[i].score = getPlayersTotal(i);
        }
        fillPlayersPosition();
    }, true);
    
    $scope.getPositionSuperscript = function(position){
        if (position > 20){
            // we don't expect to get position above 4, but the same method will work for positions upto 20
            // could divide by 10 and use the remainder to find the position for those numbers, but it's unnecessary
            return "";
        }
        
        switch (position){
            case 1:
                return "st";
            case 2:
                return "nd";
            case 3:
                return "rd";
            default:
                return "th";
        }
        
    };
});