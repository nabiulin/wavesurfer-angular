(function (angular, WaveSurfer) {
    'use strict';

    var module = angular.module('wavesurfer.angular', []);

    function wavesurferDirective($rootScope, $timeout) {
        var uuid = 1;

        return {
            restrict: 'AE',
            scope: {
                url: '=',
                peaks: '=?',
                options: '='
            },
            templateUrl: '../dist/template/wavesurfer.html',
            link: function (scope, element) {
                var waveformContainer = element.find('div.audio')[0],
                    length = 0,
                    defaultOptions = {
                        hideScrollbar: true,
                        height: 30,
                        waveColor: "#d5d1d6",
                        progressColor: "#736d74",
                        container: waveformContainer
                    };

                var options = angular.extend(defaultOptions, scope.options);

                scope.isVolumeActive = false;
                scope.volume = 50;
                scope.isPlaying = false;
                scope.isLoading = false;
                scope.uniqueId = 'waveform_' + (uuid++);
                scope.progress = 0;
                scope.remaining = 0;

                var ready = function () {
                    length = Math.floor(scope.wavesurfer.getDuration());

                    $timeout(function () {
                        scope.remaining = length;
                        scope.isLoading = false;
                        scope.playPause();
                    });
                };

                var audioprocess = function (time) {
                    $timeout(function () {
                        scope.progress = time;
                        scope.remaining = length - time;
                    });
                };

                var finish = function () {
                    scope.isPlaying = false;
                    scope.wavesurfer.seekTo(0);
                };

                var init = function (peaks) {
                    scope.wavesurfer = WaveSurfer.create(options);
                    scope.wavesurfer.load(scope.url, peaks || null);

                    scope.wavesurfer.on('ready', ready);
                    scope.wavesurfer.backend.on('audioprocess', audioprocess);
                    scope.wavesurfer.on('finish', finish);

                    scope.$watch('volume', function (value) {
                        if (value) {
                            scope.wavesurfer.setVolume(value / 100);
                        }
                    });
                };

                scope.load = function () {
                    if (!angular.isDefined(scope.wavesurfer)) {
                        scope.isLoading = true;
                        init(scope.peaks);
                    } else {
                        scope.playPause();
                    }
                };

                scope.playPause = function () {
                    scope.isPlaying = !scope.isPlaying;
                    scope.wavesurfer.playPause();
                };

                scope.pause = function () {
                    scope.wavesurfer.pause();
                    scope.isPlaying = false;
                };

                $rootScope.$on('wavesurfer:stopAll', function () {
                    if (angular.isDefined(scope.wavesurfer)) {
                        scope.pause();
                    }
                });
            }
        };
    }

    function hmsFilter() {
        return '';
    }

    module
        .directive('wavesurfer', wavesurferDirective)
        .filter('hms', hmsFilter);

}(window.angular, window.WaveSurfer));
