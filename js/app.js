var app = angular.module('callBreakCalc', []);

app.controller('callBreakCtrl', function($scope) {
    var getNewHand = function(){
        return {playerPoints:[{call:0, extra:0},{call:0, extra:0},{call:0, extra:0},{call:0, extra:0}], started: false};
    };
    
    var configureHands = function(){
        $scope.hands = [];
        $scope.hands.push(getNewHand());
        
        $scope.handIndex = 0;
        $scope.playerIndex = 0;
    };
    
    configureHands();
    
    $scope.playerPointClicked = function(handIndex, playerIndex) {
            $scope.handIndex = handIndex;
            $scope.playerIndex = playerIndex;
    };
    
    $scope.increasePoints = function() {
            var hand = $scope.hands[$scope.handIndex];
            var playerPoint = hand.playerPoints[$scope.playerIndex];
            if (!hand.started){
                playerPoint.call++;
            } else {
                playerPoint.extra++;
            }
    };
    
    $scope.decreasePoints = function() {
            var hand = $scope.hands[$scope.handIndex];
            var playerPoint = hand.playerPoints[$scope.playerIndex];
            if (!hand.started){
                if (playerPoint.call >1){
                    playerPoint.call--;
                }
            } else {
                if (playerPoint.extra > -1){
                    playerPoint.extra--;
                }
            }
    };
    
    $scope.canStartHand = function(){
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
        // can only reset the hand if this hand is started and
        // a) this hand is the last started hand, or b) this hand is the fifth hand
        if (!$scope.hands[$scope.handIndex].started){
            return false;
        }
        
        if ($scope.handIndex === 4){
            return true;
        }
        
        if ($scope.hands[$scope.handIndex+1].started){
            return false;
        }
        
        return true;
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
        // add a new hand if we haven't added 5 hands already and this is the last hand
        if ($scope.hands.length > 4){
            return;
        }
        if ($scope.hands.length-1 === $scope.handIndex){
            $scope.hands.push(getNewHand());
        }
    };
    
    $scope.getPlayersTotal = function(playerIndex){
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
});