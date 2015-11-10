(function (angular) {
    'use strict';

    var app = angular.module('example', ['wavesurfer.angular']);

    app.controller('wavesurferCtrl', ['$scope', function ($scope) {
        $scope.options = {
            waveColor: '#c5c1be',
            progressColor: '#2A9FD6',
            hideScrollbar: true,
            skipLength: 15,
            height: 50,
            cursorColor: '#2A9FD6'
        };

        $scope.files = [
            {
                name: 'Form #1',
                url: './example.mp3'
            },
            {
                name: 'Form #2',
                url: './example.mp3'
            },
            {
                name: 'Form #3',
                url: './example.mp3'
            },
            {
                name: 'Form #4',
                url: './example.mp3'
            }
        ];
    }]);
}(window.angular));
